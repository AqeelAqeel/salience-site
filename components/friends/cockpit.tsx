"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CockpitSnapshot,
  FriendSurface,
  StreamEvent,
} from "@/lib/friends/types";
import { SignInHero } from "./sign-in-hero";
import { ContextPanel } from "./context-panel";
import { ThreadCard } from "./thread-card";
import { ConnectionStrip } from "./connection-strip";

type Props = {
  slug: string;
  friend: FriendSurface;
  supabase: { url: string; anonKey: string };
};

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

type AuthState =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "linking"; accessToken: string }
  | { kind: "wrong_owner"; userEmail: string }
  | { kind: "ready"; accessToken: string };

type Session = {
  user: { id: string; email?: string | null };
  expires_at?: number | null;
  access_token: string;
  provider_token?: string | null;
  provider_refresh_token?: string | null;
};

export function Cockpit({ slug, friend: friendProp, supabase }: Props) {
  const supa = useMemo<SupabaseClient>(
    () =>
      createClient(supabase.url, supabase.anonKey, {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      }),
    [supabase.url, supabase.anonKey]
  );

  const [authState, setAuthState] = useState<AuthState>({ kind: "loading" });
  const [snapshot, setSnapshot] = useState<CockpitSnapshot | null>(null);
  const [authing, setAuthing] = useState(false);
  const [syncState, setSyncState] = useState<
    "idle" | "syncing" | "complete" | "error"
  >("idle");
  const [syncProgress, setSyncProgress] = useState<{
    loaded: number;
    analyzed: number;
    total: number;
    error?: string;
  }>({ loaded: 0, analyzed: 0, total: 0 });
  const [analyzingThreadIds, setAnalyzingThreadIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const streamRef = useRef<EventSource | null>(null);
  const linkAttemptedRef = useRef(false);

  // Always read the friend identity from snapshot if available (it'll have
  // edits like updated personalization context). Fall back to the SSR'd
  // friendProp until the first snapshot lands.
  const friend = snapshot?.friend ?? friendProp;

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const { data } = await supa.auth.getSession();
      const token = data.session?.access_token ?? "";
      return fetch(path, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [supa]
  );

  const refreshSnapshot = useCallback(async () => {
    try {
      const res = await authedFetch(`/api/friends/${slug}/snapshot`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        const { data } = await supa.auth.getSession();
        setAuthState({
          kind: "wrong_owner",
          userEmail: data.session?.user.email ?? "",
        });
        return;
      }
      if (!res.ok) return;
      const next = (await res.json()) as CockpitSnapshot;
      setSnapshot(next);
      if (next.threads.length > 0 && syncState === "idle") {
        setSyncState("complete");
      }
    } catch {
      /* ignore */
    }
  }, [authedFetch, slug, supa, syncState]);

  const startSync = useCallback(async () => {
    streamRef.current?.close();
    setSyncState("syncing");
    setSyncProgress({ loaded: 0, analyzed: 0, total: 0 });

    const { data } = await supa.auth.getSession();
    const token = data.session?.access_token ?? "";
    const url = `/api/friends/${slug}/stream?access_token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    streamRef.current = es;

    es.onmessage = (evt) => {
      try {
        const ev = JSON.parse(evt.data) as StreamEvent;
        if (ev.type === "sync_started") {
          setSyncProgress((p) => ({ ...p, total: ev.totalEstimate }));
        } else if (ev.type === "email_loaded") {
          setSyncProgress((p) => ({ ...p, loaded: p.loaded + 1 }));
          // Fire a snapshot refresh so the new thread card shows up in the
          // list immediately, in "analyzing" state, instead of waiting for
          // the entire sync to complete.
          void refreshSnapshot();
        } else if (ev.type === "analysis_started") {
          setAnalyzingThreadIds((prev) => new Set(prev).add(ev.threadId));
        } else if (ev.type === "analysis_completed") {
          setAnalyzingThreadIds((prev) => {
            const next = new Set(prev);
            next.delete(ev.threadId);
            return next;
          });
          setSyncProgress((p) => ({ ...p, analyzed: p.analyzed + 1 }));
          // Pull in the interpretation + draft for this thread now that the
          // LLM is done — the card transitions from "analyzing" to populated.
          void refreshSnapshot();
        } else if (ev.type === "user_state_updated") {
          // Voice extraction finished — pull in the new auto-detected
          // communication_style + common_phrases for the top-left panel.
          void refreshSnapshot();
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
      setSyncState((curr) => (curr === "complete" ? curr : "error"));
      setSyncProgress((p) => ({
        ...p,
        error: p.error ?? "connection lost",
      }));
      es.close();
    };
  }, [refreshSnapshot, slug, supa]);

  const evaluateSession = useCallback(
    async (raw: unknown) => {
      const session = (raw as Session | null) ?? null;
      if (!session) {
        setAuthState({ kind: "signed_out" });
        return;
      }

      // If we already linked + ready, the upstream onAuthStateChange may fire
      // again on TOKEN_REFRESHED — just update the cached token, don't relink.
      if (linkAttemptedRef.current) {
        setAuthState((curr) =>
          curr.kind === "ready" || curr.kind === "linking"
            ? { kind: "ready", accessToken: session.access_token }
            : curr
        );
        return;
      }

      linkAttemptedRef.current = true;
      setAuthState({ kind: "linking", accessToken: session.access_token });

      const providerToken = session.provider_token ?? null;
      const providerRefreshToken = session.provider_refresh_token ?? null;

      // If we have provider tokens (fresh OAuth callback), claim/refresh
      // ownership + token storage. If we don't (returning user with a
      // persisted Supabase session but no fresh OAuth roundtrip), skip the
      // POST — server tokens are already stored and refreshed on demand.
      if (providerToken) {
        try {
          const linkRes = await fetch(`/api/friends/${slug}/link-tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              googleEmail: session.user.email ?? "",
              accessToken: providerToken,
              refreshToken: providerRefreshToken ?? "",
              scope: GMAIL_SCOPE,
              expiresAt: session.expires_at ?? null,
            }),
          });
          if (linkRes.status === 403) {
            setAuthState({
              kind: "wrong_owner",
              userEmail: session.user.email ?? "",
            });
            return;
          }
          if (!linkRes.ok) {
            console.error(
              "[friends] link-tokens failed",
              linkRes.status,
              await linkRes.text().catch(() => "")
            );
            linkAttemptedRef.current = false;
            setAuthState({ kind: "signed_out" });
            return;
          }
        } catch (err) {
          console.error("[friends] link-tokens threw", err);
          linkAttemptedRef.current = false;
          setAuthState({ kind: "signed_out" });
          return;
        }
      }

      // Strip post-OAuth params from the URL for cosmetics.
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (
          url.searchParams.has("just_signed_in") ||
          url.searchParams.has("code")
        ) {
          url.searchParams.delete("just_signed_in");
          url.searchParams.delete("code");
          window.history.replaceState(
            {},
            "",
            url.pathname + (url.search ? `?${url.searchParams}` : "")
          );
        }
      }

      // Pull snapshot. snapshot also gates wrong_owner via 403.
      const snapRes = await fetch(`/api/friends/${slug}/snapshot`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (snapRes.status === 403) {
        setAuthState({
          kind: "wrong_owner",
          userEmail: session.user.email ?? "",
        });
        return;
      }
      if (!snapRes.ok) {
        console.error("[friends] snapshot failed", snapRes.status);
        setAuthState({ kind: "signed_out" });
        return;
      }
      const snap = (await snapRes.json()) as CockpitSnapshot;
      setSnapshot(snap);
      setAuthState({ kind: "ready", accessToken: session.access_token });

      // First-link with provider tokens or empty mailbox → kick off sync.
      if (providerToken || snap.threads.length === 0) {
        if (snap.connectedGoogleEmail) void startSync();
      } else {
        setSyncState("complete");
      }
    },
    [slug, startSync]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    supa.auth.getSession().then(({ data }) => {
      if (!cancelled) void evaluateSession(data.session);
    });

    const { data: authSub } = supa.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        linkAttemptedRef.current = false;
        setAuthState({ kind: "signed_out" });
        setSnapshot(null);
        setSyncState("idle");
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void evaluateSession(session);
      }
    });

    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
    };
  }, [supa, evaluateSession]);

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

  async function handleSignOut() {
    await supa.auth.signOut();
    linkAttemptedRef.current = false;
    setAuthState({ kind: "signed_out" });
    setSnapshot(null);
  }

  function handleThreadOpen(threadId: string) {
    setSelectedThreadId((curr) => (curr === threadId ? null : threadId));
  }

  async function handleSaveDraft(draftId: string, body: string) {
    const res = await authedFetch(`/api/friends/${slug}/drafts/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, status: "edited" }),
    });
    if (res.ok) await refreshSnapshot();
  }

  async function handleSavePersonalization(value: string) {
    const res = await authedFetch(`/api/friends/${slug}/context`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_personalization_context: value }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error ?? "save failed");
    }
    await refreshSnapshot();
  }

  async function handlePushToGmail(draftId: string) {
    const res = await authedFetch(`/api/friends/${slug}/drafts/${draftId}`, {
      method: "POST",
    });
    if (res.ok) await refreshSnapshot();
    else {
      const data = await res.json().catch(() => null);
      alert(
        data?.error ?? "Push to Gmail failed — may need gmail.compose scope."
      );
    }
  }

  async function handleMarkDone(threadId: string) {
    await authedFetch(`/api/friends/${slug}/threads/${threadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    }).catch(() => null);
    await refreshSnapshot();
  }

  // ─────────────────────── Render branches ───────────────────────

  if (authState.kind === "loading") {
    return <LoadingShell />;
  }

  if (authState.kind === "signed_out") {
    return (
      <SignInHero
        friend={friend}
        authing={authing}
        onSignIn={handleSignIn}
      />
    );
  }

  if (authState.kind === "wrong_owner") {
    return (
      <WrongOwnerScreen
        friend={friend}
        userEmail={authState.userEmail}
        onSignOut={handleSignOut}
      />
    );
  }

  if (authState.kind === "linking" || !snapshot) {
    return <LoadingShell label="loading your cockpit" />;
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
        onResync={() => void startSync()}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10 pt-6 pb-28">
        <aside className="hidden lg:block sticky top-16 self-start h-[calc(100dvh-5rem)] overflow-y-auto pr-2">
          <ContextPanel
            snapshot={snapshot}
            onSavePersonalization={handleSavePersonalization}
          />
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
              <ContextPanel
                snapshot={snapshot}
                onSavePersonalization={handleSavePersonalization}
              />
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
              <SectionHeader
                label="recent, no action needed"
                count={other.length}
              />
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
        <em className="italic text-[var(--fr-accent-soft)]">waiting on you</em>
        , {first}.
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
        Reading recent threads, understanding senders, and drafting replies.
        First cards appear in a few seconds.
      </p>
    </div>
  );
}

function LoadingShell({ label = "loading" }: { label?: string }) {
  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-3 h-3 rounded-full bg-[var(--fr-accent)] mx-auto animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
        <p className="small-caps mt-5">{label}</p>
      </div>
    </main>
  );
}

function WrongOwnerScreen({
  friend,
  userEmail,
  onSignOut,
}: {
  friend: FriendSurface;
  userEmail: string;
  onSignOut: () => void;
}) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col">
      <nav className="px-6 md:px-10 py-6 flex items-center justify-between rule-bot">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--fr-signal-red)]" />
          <p className="small-caps">friends · {friend.friend_slug}</p>
        </div>
        <p className="mono text-xs text-[var(--fr-text-low)] hidden md:block">
          access denied
        </p>
      </nav>

      <section className="flex-1 flex items-center px-6 md:px-10">
        <div className="mx-auto w-full max-w-2xl py-14 md:py-24">
          <p className="small-caps rise rise-1">not your cockpit</p>

          <h1 className="display rise rise-2 text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] mt-5">
            This cockpit is bound to a{" "}
            <em className="italic text-[var(--fr-accent-soft)]">
              different account
            </em>
            .
          </h1>

          <p className="rise rise-3 mt-6 text-[var(--fr-text-mid)] leading-relaxed max-w-xl">
            You&rsquo;re signed in as{" "}
            <span className="mono text-[var(--fr-text-hi)]">{userEmail}</span>,
            but <span className="text-[var(--fr-text-hi)]">{friend.full_name}</span>
            &rsquo;s cockpit is privately bound to whoever first signed in here.
            Each cockpit is one person&rsquo;s tool — by design.
          </p>

          <p className="rise rise-3 mt-4 text-[var(--fr-text-mid)] leading-relaxed max-w-xl">
            If you should have access, ask the operator to reset this cockpit
            (clears the bound account so you can sign in fresh). Otherwise,
            sign out and ask for your own URL.
          </p>

          <div className="rise rise-4 mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              type="button"
              onClick={onSignOut}
              className="fr-btn fr-btn-ghost"
            >
              Sign out
            </button>
            <a className="fr-btn fr-btn-ghost" href="mailto:aqeel@aqeelali.com">
              Contact the operator
            </a>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-6 rule-top flex items-center justify-between text-[var(--fr-text-low)] mono text-xs">
        <span>private · unlisted</span>
        <div className="flex gap-4">
          <a className="hover:text-[var(--fr-text-mid)]" href="/privacy">
            privacy
          </a>
          <a className="hover:text-[var(--fr-text-mid)]" href="/terms">
            terms
          </a>
        </div>
      </footer>
    </main>
  );
}
