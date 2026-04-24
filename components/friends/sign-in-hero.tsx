"use client";

import { useState } from "react";
import type { FriendSurface } from "@/lib/friends/types";

type Props = {
  friend: FriendSurface;
  authing: boolean;
  onSignIn: () => void;
};

type View = "landing" | "consent";

export function SignInHero({ friend, authing, onSignIn }: Props) {
  const [view, setView] = useState<View>("landing");
  const first = friend.full_name.split(" ")[0] || "friend";

  return (
    <main className="min-h-[100dvh] w-full flex flex-col">
      <nav className="px-6 md:px-10 py-6 flex items-center justify-between rule-bot">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--fr-accent)] shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          <p className="small-caps">friends · {friend.friend_slug}</p>
        </div>
        <p className="mono text-xs text-[var(--fr-text-low)] hidden md:block">
          private · unlisted
        </p>
      </nav>

      {view === "landing" ? (
        <Landing friend={friend} first={first} onContinue={() => setView("consent")} />
      ) : (
        <Consent
          friend={friend}
          first={first}
          authing={authing}
          onBack={() => setView("landing")}
          onSignIn={onSignIn}
        />
      )}

      <footer className="px-6 md:px-10 py-6 rule-top flex items-center justify-between text-[var(--fr-text-low)] mono text-xs">
        <span>built by a friend · not indexed</span>
        <div className="flex gap-4">
          <a className="hover:text-[var(--fr-text-mid)]" href="/privacy">privacy</a>
          <a className="hover:text-[var(--fr-text-mid)]" href="/terms">terms</a>
        </div>
      </footer>
    </main>
  );
}

function Landing({
  friend,
  first,
  onContinue,
}: {
  friend: FriendSurface;
  first: string;
  onContinue: () => void;
}) {
  const headline =
    friend.friend_headline || `Hey ${first} — I built you a *thing*.`;
  const pitch =
    friend.friend_pitch ||
    "A small, private cockpit that reads your recent email, tells you what actually matters, and drafts replies in your voice.";

  return (
    <section className="flex-1 flex items-center px-6 md:px-10">
      <div className="mx-auto w-full max-w-5xl py-14 md:py-24 grid md:grid-cols-[1.3fr_1fr] gap-10 md:gap-20 items-center">
        <div>
          <p className="small-caps rise rise-1">
            for {friend.full_name.toLowerCase() || first}
            {friend.company_name ? ` · ${friend.company_name.toLowerCase()}` : ""}
          </p>

          <h1 className="display rise rise-2 text-[clamp(2.4rem,7vw,5rem)] leading-[1.02] mt-5">
            {renderHeadline(headline)}
          </h1>

          <p className="rise rise-3 mt-8 text-[var(--fr-text-mid)] text-[15px] md:text-[17px] leading-relaxed max-w-xl">
            {pitch}
          </p>

          <div className="rise rise-4 mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button type="button" onClick={onContinue} className="fr-btn">
              Show me what this needs →
            </button>
            <p className="mono text-[11px] text-[var(--fr-text-low)] max-w-xs">
              you&rsquo;ll see exactly what it reads before signing in
            </p>
          </div>

          <div className="rise rise-5 mt-14 pt-6 rule-top grid grid-cols-3 gap-6 max-w-lg">
            <TinyFact label="reads" value={<><span className="text-[var(--fr-text-hi)]">~40</span> threads</>} />
            <TinyFact label="sends" value={<><span className="text-[var(--fr-text-hi)]">0</span> emails</>} />
            <TinyFact label="drafts" value={<span className="text-[var(--fr-text-hi)]">in your voice</span>} />
          </div>
        </div>

        <aside className="hidden md:block">
          <TerminalMock />
        </aside>
      </div>
    </section>
  );
}

function Consent({
  friend,
  first,
  authing,
  onBack,
  onSignIn,
}: {
  friend: FriendSurface;
  first: string;
  authing: boolean;
  onBack: () => void;
  onSignIn: () => void;
}) {
  const [ack, setAck] = useState(false);

  return (
    <section className="flex-1 flex items-start justify-center px-6 md:px-10">
      <div className="w-full max-w-2xl py-10 md:py-16">
        <button
          type="button"
          onClick={onBack}
          className="small-caps hover:text-[var(--fr-text-mid)] transition-colors"
        >
          ← back
        </button>

        <h2 className="display rise rise-1 text-[clamp(1.8rem,4.5vw,2.8rem)] leading-[1.05] mt-6">
          Before you sign in, {first} —
          <br />
          <em className="italic text-[var(--fr-accent-soft)]">here&rsquo;s exactly what this does.</em>
        </h2>

        <p className="rise rise-2 mt-5 text-[var(--fr-text-mid)] leading-relaxed">
          Google will show you an &ldquo;unverified app&rdquo; warning on the next screen. That&rsquo;s their default for anything that reads Gmail. It&rsquo;s not a security issue with your account — it&rsquo;s Google being cautious about a new app. Read below so you know what you&rsquo;re granting.
        </p>

        <div className="rise rise-3 mt-8 grid md:grid-cols-2 gap-4">
          <TrustPanel
            label="what this reads"
            tone="read"
            items={[
              "Up to ~40 of your most recent inbox threads",
              "Subject lines, participants, bodies, timestamps",
              "Your Google account email (to label this cockpit)",
            ]}
          />
          <TrustPanel
            label="what it never does"
            tone="never"
            items={[
              "Send email on your behalf — drafts go to your Gmail Drafts only when you explicitly click",
              "Share, sell, or transfer your mail to anyone",
              "Train AI models on your data",
              "Let humans at Salience read your mail",
            ]}
          />
        </div>

        <div className="rise rise-4 mt-6 rounded-md border hairline bg-[var(--fr-bg-soft)] p-4 md:p-5">
          <p className="small-caps mb-2">where your data lives</p>
          <p className="text-[13.5px] text-[var(--fr-text-mid)] leading-relaxed">
            Gmail stays in Gmail. Summaries and drafts we generate are stored in a Salience-owned Supabase database, encrypted in transit and at rest. Email thread contents are sent to OpenAI&rsquo;s API for summarization; OpenAI&rsquo;s API tier does not train on that data.{" "}
            <a className="fr-link" href="/privacy" target="_blank" rel="noreferrer">
              full privacy policy
            </a>
            .
          </p>
        </div>

        <div className="rise rise-4 mt-6 rounded-md border hairline bg-[var(--fr-bg-soft)] p-4 md:p-5">
          <p className="small-caps mb-2">you can revoke anytime</p>
          <p className="text-[13.5px] text-[var(--fr-text-mid)] leading-relaxed">
            Pull access from{" "}
            <a
              className="fr-link"
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
            >
              your Google account permissions
            </a>{" "}
            and we stop fetching new mail immediately. Email{" "}
            <a className="fr-link" href="mailto:aqeel@aqeelali.com">
              aqeel@aqeelali.com
            </a>{" "}
            to delete the stored summaries and drafts too.
          </p>
        </div>

        <label className="rise rise-5 mt-8 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-[3px] w-4 h-4 accent-[var(--fr-accent)] cursor-pointer"
          />
          <span className="text-[13.5px] text-[var(--fr-text-mid)] leading-relaxed">
            I understand this reads my recent Gmail threads, never sends mail, and I can revoke access at any time. I&rsquo;ve read the{" "}
            <a className="fr-link" href="/privacy" target="_blank" rel="noreferrer">
              privacy policy
            </a>{" "}
            and{" "}
            <a className="fr-link" href="/terms" target="_blank" rel="noreferrer">
              terms
            </a>
            .
          </span>
        </label>

        <div className="rise rise-5 mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="button"
            onClick={onSignIn}
            disabled={!ack || authing}
            className="fr-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <GoogleMark />
            {authing ? "opening google…" : "Continue with Google"}
          </button>
          <p className="mono text-[11px] text-[var(--fr-text-low)] max-w-xs">
            you&rsquo;ll see &ldquo;Google hasn&rsquo;t verified this app.&rdquo; that&rsquo;s expected — click advanced → continue.
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustPanel({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "read" | "never";
  items: string[];
}) {
  const markColor =
    tone === "read" ? "text-[var(--fr-accent)]" : "text-[var(--fr-signal-green)]";
  const mark = tone === "read" ? "→" : "✕";
  return (
    <div className="crosshair-card rounded-md border hairline bg-[var(--fr-bg-soft)] p-5">
      <p className="small-caps mb-3">{label}</p>
      <ul className="space-y-2.5 text-[13.5px] text-[var(--fr-text-mid)]">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 leading-relaxed">
            <span className={`${markColor} mono text-xs shrink-0 mt-[3px]`}>{mark}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderHeadline(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-[var(--fr-accent-soft)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function TinyFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="small-caps mb-1.5">{label}</p>
      <p className="mono text-[13px] text-[var(--fr-text-mid)]">{value}</p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
    </svg>
  );
}

function TerminalMock() {
  return (
    <div className="crosshair-card rounded-lg border hairline bg-[var(--fr-bg-soft)] p-5 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[var(--fr-text-low)]" />
        <span className="w-2 h-2 rounded-full bg-[var(--fr-text-low)]" />
        <span className="w-2 h-2 rounded-full bg-[var(--fr-accent)]" />
        <span className="mono text-[11px] text-[var(--fr-text-low)] ml-2">inbox · preview</span>
      </div>
      <div className="space-y-3 text-[13px]">
        <MockRow dotClass="dot dot-high" subject="Re: next week's proposal" note="needs reply · same-day" />
        <MockRow dotClass="dot dot-medium" subject="Intro: Alex → you" note="reply within 2 days" />
        <MockRow dotClass="dot dot-medium" subject="Q3 renewal terms" note="pushback expected" />
        <MockRow dotClass="dot dot-low" subject="Newsletter: signal" note="fyi only" />
      </div>
      <div className="mt-5 pt-4 rule-top mono text-[11px] text-[var(--fr-text-low)]">
        drafts generated: 3 / 4 · in your voice
      </div>
    </div>
  );
}

function MockRow({
  dotClass,
  subject,
  note,
}: {
  dotClass: string;
  subject: string;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center min-w-0">
        <span className={dotClass} />
        <span className="truncate text-[var(--fr-text-hi)]">{subject}</span>
      </div>
      <span className="mono text-[11px] text-[var(--fr-text-low)] whitespace-nowrap">{note}</span>
    </div>
  );
}
