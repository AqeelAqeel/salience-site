"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CockpitSnapshot,
  FriendEmailThread,
  FriendReplyDraft,
  FriendThreadInterpretation,
  StreamEvent,
} from "@/lib/friends/types";
import { SignInHero } from "./sign-in-hero";
import { ContextPanel } from "./context-panel";
import { ThreadCard } from "./thread-card";
import { ConnectionStrip } from "./connection-strip";

type Props = {
  slug: string;
  initialSnapshot: CockpitSnapshot;
  supabase: { url: string; anonKey: string };
};

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export function Cockpit({ slug, initialSnapshot, supabase }: Props) {
  const supa = useMemo<SupabaseClient>(
    () =>
      createClient(supabase.url, supabase.anonKey, {
        auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
      }),
    [supabase.url, supabase.anonKey]
  );

  const [snapshot, setSnapshot] = useState<CockpitSnapshot>(initialSnapshot);
  const [authing, setAuthing] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "complete" | "error">(
    initialSnapshot.threads.length > 0 ? "complete" : "idle"
  );
  const [syncProgress, setSyncProgress] = useState<{
    loaded: number;
    analyzed: number;
    total: number;
    error?: string;
  }>({ loaded: 0, analyzed: 0, total: 0 });
  const [analyzingThreadIds, setAnalyzingThreadIds] = useState<Set<string>>(new Set());
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const streamRef = useRef<EventSource | null>(null);
  const didLinkRef = useRef(false);

  const hasConnection = Boolean(snapshot.connectedGoogleEmail);
  const friend = snapshot.friend;

  const startSync = useCallback(() => {
    streamRef.current?.close();
    setSyncState("syncing");
    setSyncProgress({ loaded: 0, analyzed: 0, total: 0 });

    const es = new EventSource(`/api/friends/${slug}/stream`);
    streamRef.current = es;

    es.onmessage = (evt) => {
      try {
        const ev = JSON.parse(evt.data) as StreamEvent;
        if (ev.type === "sync_started") {
          setSyncProgress((p) => ({ ...p, total: ev.totalEstimate }));
        } else if (ev.type === "email_loaded") {
          setSyncProgress((p) => ({ ...p, loaded: p.loaded + 1 }));
        } else if (ev.type === "analysis_started") {
          setAnalyzingThreadIds((prev) => new Set(prev).add(ev.threadId));
        } else if (ev.type === "analysis_completed") {
          setAnalyzingThreadIds((prev) => {
            const next = new Set(prev);
            next.delete(ev.threadId);
            return next;
          });
          setSyncProgress((p) => ({ ...p, analyzed: p.analyzed + 1 }));
        } else if (ev.type === "sync_completed") {
          setSyncState("complete");
          es.close();
          void refreshSnapshot();
        } else if (ev.type === "error") {
          setSyncProgress((p) => ({ ...p, error: ev.message }));
          setSyncState("error");
        }
      } catch {
        /* ignore malformed */
      }
    };

    es.onerror = () => {
      setSyncState("error");
      setSyncProgress((p) => ({ ...p, error: "connection lost" }));
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const refreshSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/friends/${slug}/snapshot`, { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as CockpitSnapshot;
      setSnapshot(next);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    if (didLinkRef.current) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hash = window.location.hash;
    const looksLikeReturn =
      url.searchParams.get("just_signed_in") === "1" ||
      hash.includes("access_token=") ||
      hash.includes("provider_token=");
    if (!looksLikeReturn) return;

    didLinkRef.current = true;

    (async () => {
      const { data } = await supa.auth.getSession();
      const session = data.session;
      if (!session) return;

      const providerToken =
        (session as unknown as { provider_token?: string }).provider_token ??
        null;
      const providerRefreshToken =
        (session as unknown as { provider_refresh_token?: string })
          .provider_refresh_token ?? null;

      if (!providerToken || !providerRefreshToken) {
        console.warn(
          "[friends] Google session returned without provider refresh token — make sure `access_type=offline` + `prompt=consent` are set in signInWithOAuth"
        );
      }

      await fetch(`/api/friends/${slug}/link-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUserId: session.user.id,
          googleEmail: session.user.email ?? "",
          accessToken: providerToken,
          refreshToken: providerRefreshToken,
          scope: GMAIL_SCOPE,
          expiresAt: session.expires_at ?? null,
        }),
      });

      url.searchParams.delete("just_signed_in");
      window.history.replaceState(
        {},
        "",
        url.pathname + (url.search ? `?${url.searchParams}` : "")
      );

      await refreshSnapshot();
      startSync();
    })();
  }, [slug, supa, refreshSnapshot, startSync]);

  useEffect(() => () => streamRef.current?.close(), []);

  async function handleSignIn() {
    setAuthing(true);
    try {
      await supa.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: GMAIL_SCOPE,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/friends/${slug}?just_signed_in=1`,
        },
      });
    } catch (err) {
      console.error(err);
      setAuthing(false);
    }
  }

  function handleThreadOpen(threadId: string) {
    setSelectedThreadId((curr) => (curr === threadId ? null : threadId));
  }

  async function handleSaveDraft(draftId: string, body: string) {
    const res = await fetch(`/api/friends/${slug}/drafts/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, status: "edited" }),
    });
    if (res.ok) await refreshSnapshot();
  }

  async function handlePushToGmail(draftId: string) {
    const res = await fetch(`/api/friends/${slug}/drafts/${draftId}`, {
      method: "POST",
    });
    if (res.ok) await refreshSnapshot();
    else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Push to Gmail failed — may need gmail.compose scope.");
    }
  }

  async function handleMarkDone(threadId: string) {
    await fetch(`/api/friends/${slug}/threads/${threadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    }).catch(() => null);
    await refreshSnapshot();
  }

  if (!hasConnection) {
    return (
      <SignInHero
        friend={friend}
        authing={authing}
        onSignIn={handleSignIn}
      />
    );
  }

  const needsReply = snapshot.threads.filter((t) => t.status === "needs_reply");
  const other = snapshot.threads.filter((t) => t.status !== "needs_reply");

  return (
    <main className="min-h-[100dvh] w-full">
      <ConnectionStrip
        friendName={friend.full_name}
        googleEmail={snapshot.connectedGoogleEmail ?? ""}
        threadCount={snapshot.threads.length}
        pendingCount={needsReply.length}
        syncState={syncState}
        syncProgress={syncProgress}
        onResync={startSync}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10 pt-6 pb-28">
        <aside className="hidden lg:block sticky top-16 self-start h-[calc(100dvh-5rem)] overflow-y-auto pr-2">
          <ContextPanel snapshot={snapshot} />
        </aside>

        <section className="min-w-0">
          <HeroStrip
            friendName={friend.full_name}
            pendingCount={needsReply.length}
            totalCount={snapshot.threads.length}
          />

          <details className="lg:hidden mt-4 mb-6">
            <summary className="small-caps cursor-pointer select-none list-none flex items-center justify-between px-4 py-3 rounded-md border hairline">
              <span>context · patterns · people</span>
              <span className="mono text-xs">open</span>
            </summary>
            <div className="mt-3 px-1">
              <ContextPanel snapshot={snapshot} />
            </div>
          </details>

          {syncState === "syncing" && snapshot.threads.length === 0 && (
            <EmptyScanning />
          )}

          {needsReply.length > 0 && (
            <div className="mt-6">
              <SectionHeader label="needs a reply" count={needsReply.length} />
              <div className="flex flex-col gap-4 mt-3">
                {needsReply.map((t) => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    interpretation={snapshot.interpretations[t.id]}
                    drafts={snapshot.drafts[t.id] ?? []}
                    recipients={snapshot.recipients}
                    analyzing={analyzingThreadIds.has(t.id)}
                    expanded={selectedThreadId === t.id}
                    onOpen={() => handleThreadOpen(t.id)}
                    onSaveDraft={handleSaveDraft}
                    onPushToGmail={handlePushToGmail}
                    onMarkDone={() => handleMarkDone(t.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div className="mt-10">
              <SectionHeader label="recent, no action needed" count={other.length} />
              <div className="flex flex-col gap-3 mt-3">
                {other.map((t) => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    interpretation={snapshot.interpretations[t.id]}
                    drafts={snapshot.drafts[t.id] ?? []}
                    recipients={snapshot.recipients}
                    analyzing={analyzingThreadIds.has(t.id)}
                    expanded={selectedThreadId === t.id}
                    compact
                    onOpen={() => handleThreadOpen(t.id)}
                    onSaveDraft={handleSaveDraft}
                    onPushToGmail={handlePushToGmail}
                    onMarkDone={() => handleMarkDone(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function HeroStrip({
  friendName,
  pendingCount,
  totalCount,
}: {
  friendName: string;
  pendingCount: number;
  totalCount: number;
}) {
  const first = friendName.split(" ")[0] || "you";
  return (
    <header className="mt-4 md:mt-8 rule-bot pb-6">
      <p className="small-caps rise rise-1">your cockpit</p>
      <h1 className="display rise rise-2 text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] mt-3">
        Here&rsquo;s what&rsquo;s
        <br className="hidden md:block" />{" "}
        <em className="italic text-[var(--fr-accent-soft)]">waiting on you</em>, {first}.
      </h1>
      <p className="rise rise-3 mt-4 text-[var(--fr-text-mid)] max-w-xl">
        {pendingCount > 0
          ? `${pendingCount} thread${pendingCount === 1 ? "" : "s"} out of ${totalCount} need a reply. I've drafted each one in your voice — scan, tweak, send.`
          : `All ${totalCount} threads are clean. Drafts appear here as new mail lands.`}
      </p>
    </header>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <p className="small-caps">{label}</p>
      <p className="mono text-xs text-[var(--fr-text-low)]">
        {String(count).padStart(2, "0")}
      </p>
    </div>
  );
}

function EmptyScanning() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full border hairline flex items-center justify-center relative">
        <div className="w-2 h-2 bg-[var(--fr-accent)] rounded-full animate-pulse" />
        <div className="absolute inset-0 rounded-full border border-[var(--fr-accent)] opacity-20 animate-ping" />
      </div>
      <p className="small-caps mt-6">scanning your inbox</p>
      <p className="text-[var(--fr-text-mid)] text-sm mt-2 max-w-sm">
        Reading recent threads, understanding senders, and drafting replies. First cards appear in a few seconds.
      </p>
    </div>
  );
}
