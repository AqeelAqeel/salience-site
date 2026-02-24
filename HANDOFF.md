# Salience Site — Component Handoff Spec

## Overview

Two new components need to be integrated into the existing Next.js 15 landing page at `salience-site`. Both are `"use client"` components. The existing site is on **main** and should not need any merge — these are purely additive changes.

---

## Tech Stack (existing)

- Next.js 16.1.3, React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`)
- Lucide React icons
- shadcn/ui components
- Font: Manrope (set in `globals.css` on `html, body`)
- Background: `#0a0a0a`, Accent: amber/gold (`#f59e0b`, `#fbbf24`, `#d97706`)

---

## Asset Requirement

Place a transparent-background Salience wordmark PNG at:

```
/public/assets/whole-word-removebg.png
```

The `FooterSpotlight` component references this path as its default prop.

---

## Component 1: ProcessSection

**File:** `components/process-section.tsx`

### What it does

Scroll-driven 5-phase timeline showing Salience's engagement process. As the user scrolls through a tall container (`5 × 100vh`), a sticky viewport locks in place and transitions through phases with an animated progress bar, phase cards, and ambient glow backgrounds.

### Features

- **Scroll-driven phase progression** — maps scroll position to phase index (0–4)
- **Manual override** — clicking dots, labels, or arrow buttons switches to manual mode; scroll re-engages after 800ms idle
- **Keyboard navigation** — ArrowLeft / ArrowRight when section is in viewport
- **Progress bar** — amber gradient fill with glowing dot at tip, clickable milestone dots
- **Phase cards** — slide-in/out transitions, ghost numbers, tag badges, deliverable chips
- **Ambient glow** — `radial-gradient` background shifts per phase
- **Scroll hint** — bouncing arrow at bottom when not on last phase
- **Fully inline-styled** — no dependency on Tailwind classes or globals.css (portable)

### Full source

```tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
/* ── Data ── */
interface Phase {
  tag: string;
  name: string;
  time: string;
  desc: string;
  deliverable: string;
  solid?: boolean;
}
const PHASES: Phase[] = [
  { tag: "Phase 01", name: "Manual & Full Process Audit", time: "Week 1–2", desc: "We sit in your workflows. Watch the bottlenecks. Map every input, handoff, and time sink. No assumptions — we audit the real operations before touching anything.", deliverable: "📋 Process map + bottleneck report delivered", solid: true },
  { tag: "Phase 02", name: "Something in Your Hands", time: "Week 2–3", desc: "Fast turnaround. You get a working solution — not a deck, not a proposal. A real tool you can start using immediately.", deliverable: "⚡ Working prototype / first automation live" },
  { tag: "Phase 03", name: "Use It. Break It. Improve It.", time: "Week 3–6", desc: "You're actively using the system on the job. We iterate in real-time based on what works and what doesn't. Changes ship same week.", deliverable: "🔄 Weekly iterations + refinement cycles" },
  { tag: "Phase 04", name: "Monthly Maintenance & Support", time: "Month 2+", desc: "System is stable. We shift to a monthly cadence — monitoring, maintenance, and incremental improvements. You're covered.", deliverable: "📊 Monthly report + support retainer" },
  { tag: "Phase 05", name: "Platform Subscription + SLA", time: "Ongoing", desc: "The automation becomes your platform. Software subscription with SLAs. Uptime guarantees, priority support, continuous improvement.", deliverable: "🔒 SLA-backed platform with guaranteed uptime" },
];
const LABELS = ["Audit", "Deliver", "Iterate", "Monthly", "Platform"];
const T = PHASES.length;
const GLOWS = [
  "radial-gradient(ellipse at 20% 50%, rgba(251,191,36,0.07) 0%, transparent 50%)",
  "radial-gradient(ellipse at 35% 40%, rgba(251,191,36,0.06) 0%, transparent 50%)",
  "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.07) 0%, transparent 50%)",
  "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.05) 0%, transparent 50%)",
  "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.04) 0%, transparent 50%)",
];
/* ── Styles (inline so it works everywhere) ── */
const s = {
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  amberDark: "#d97706",
  bg: "#0a0a0a",
  surface: "rgba(20,20,20,0.9)",
  text: "#ffffff",
  dim: "rgba(255,255,255,0.6)",
  muted: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.06)",
  font: '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};
export default function ProcessSection() {
  const [phase, setPhase] = useState(0);
  const [manual, setManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barPct = (phase / (T - 1)) * 100;
  /* scroll-driven */
  useEffect(() => {
    const fn = () => {
      if (!ref.current || manual) return;
      const r = ref.current.getBoundingClientRect();
      const scrolled = -r.top;
      const range = r.height - window.innerHeight;
      const p = Math.max(0, Math.min(1, scrolled / range));
      setPhase(Math.min(T - 1, Math.floor(p * T)));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [manual]);
  /* re-engage scroll after manual */
  useEffect(() => {
    if (!manual) return;
    const fn = () => {
      if (mt.current) clearTimeout(mt.current);
      mt.current = setTimeout(() => setManual(false), 800);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => {
      window.removeEventListener("scroll", fn);
      if (mt.current) clearTimeout(mt.current);
    };
  }, [manual]);
  const go = useCallback((i: number) => {
    setManual(true);
    setPhase(Math.max(0, Math.min(T - 1, i)));
  }, []);
  /* keyboard */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(phase + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(phase - 1); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [phase, go]);
  return (
    <div
      ref={ref}
      id="process"
      style={{ height: `${T * 100}vh`, position: "relative", fontFamily: s.font }}
    >
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        overflow: "hidden", background: s.bg,
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          transition: "all 1s ease", background: GLOWS[phase],
        }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", width: "100%", position: "relative", zIndex: 1 }}>
          {/* ── Label ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#000", fontWeight: 700,
            }}>⚡</span>
            <span style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase" as const, color: s.amber,
            }}>Our Process</span>
          </div>
          {/* ── Title ── */}
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8, color: s.text,
          }}>
            Huge wins.{" "}
            <span style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706, #fbbf24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", backgroundSize: "200% 200%",
            }}>Minimal friction.</span>
          </h2>
          <p style={{
            fontSize: 16, fontWeight: 400, color: s.dim,
            maxWidth: 460, lineHeight: 1.6, marginBottom: 40,
          }}>
            We move fast, prove value early, and build toward a system you own.
          </p>
          {/* ── Progress Bar ── */}
          <div style={{ position: "relative", marginBottom: 36 }}>
            <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 3, position: "relative" }}>
              {/* Fill */}
              <div style={{
                height: "100%", borderRadius: 3, position: "relative",
                width: `${barPct}%`,
                background: `linear-gradient(90deg, ${s.amber}, ${s.amberLight})`,
                boxShadow: "0 0 12px rgba(251,191,36,0.15)",
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{
                  position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                  width: 12, height: 12, borderRadius: "50%", background: s.amberLight,
                  boxShadow: "0 0 16px rgba(251,191,36,0.6), 0 0 4px rgba(251,191,36,0.8)",
                }} />
              </div>
              {/* Dots */}
              {LABELS.map((_, i) => {
                const left = (i / (T - 1)) * 100;
                const reached = i < phase;
                const active = i === phase;
                return (
                  <button key={i} onClick={() => go(i)} style={{
                    position: "absolute", left: `${left}%`, top: "50%",
                    transform: "translate(-50%,-50%)",
                    width: active ? 12 : 10, height: active ? 12 : 10,
                    borderRadius: "50%", border: "2px solid",
                    borderColor: active ? s.amberLight : reached ? s.amber : "rgba(255,255,255,0.15)",
                    background: active ? s.amberLight : reached ? s.amber : s.bg,
                    boxShadow: active ? "0 0 12px rgba(251,191,36,0.5)" : reached ? "0 0 8px rgba(251,191,36,0.15)" : "none",
                    cursor: "pointer", zIndex: 2, transition: "all 0.3s ease", padding: 0,
                  }} />
                );
              })}
            </div>
            {/* Labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              {LABELS.map((lbl, i) => (
                <button key={i} onClick={() => go(i)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "center" as const, width: "20%", transition: "color 0.3s",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, fontFamily: s.font,
                  color: i === phase ? s.amber : i < phase ? s.dim : s.muted,
                }}>{lbl}</button>
              ))}
            </div>
          </div>
          {/* ── Phase Card ── */}
          <div style={{ position: "relative", minHeight: 280 }}>
            {PHASES.map((p, i) => {
              const active = i === phase;
              const past = i < phase;
              return (
                <div key={i} style={{
                  position: active ? "relative" : "absolute",
                  top: 0, left: 0, width: "100%",
                  opacity: active ? 1 : 0,
                  transform: active ? "translateX(0)" : past ? "translateX(-50px)" : "translateX(50px)",
                  pointerEvents: active ? "auto" : "none",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                  <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                    {/* Ghost number */}
                    <div style={{
                      fontSize: 64, fontWeight: 800, lineHeight: 1,
                      color: "rgba(251,191,36,0.06)", flexShrink: 0,
                      userSelect: "none" as const, minWidth: 72,
                    }}>{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      {/* Tag */}
                      <span style={{
                        display: "inline-block", marginBottom: 10,
                        padding: "5px 12px", borderRadius: 6,
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        ...(p.solid
                          ? { color: "#000", background: `linear-gradient(135deg, ${s.amber}, ${s.amberDark})` }
                          : { color: s.amber, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }
                        ),
                      }}>{p.tag}</span>
                      <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: s.text }}>{p.name}</h3>
                      <div style={{ fontSize: 12, color: s.muted, marginBottom: 14 }}>{p.time}</div>
                      <p style={{ fontSize: 15, fontWeight: 400, color: s.dim, lineHeight: 1.7, maxWidth: 500 }}>{p.desc}</p>
                      {/* Deliverable */}
                      <div style={{
                        marginTop: 16, padding: "10px 16px",
                        background: "rgba(251,191,36,0.04)",
                        border: "1px solid rgba(251,191,36,0.1)",
                        borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: s.dim }}>{p.deliverable}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* ── Arrows ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
            {[{ dir: -1, label: "←" }, { dir: 1, label: "→" }].map(({ dir, label }) => (
              <button key={dir} onClick={() => go(phase + dir)}
                disabled={dir === -1 ? phase === 0 : phase === T - 1}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: `1px solid ${s.border}`, background: s.surface,
                  color: s.dim, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.3s", fontSize: 16,
                  fontFamily: s.font,
                  opacity: (dir === -1 && phase === 0) || (dir === 1 && phase === T - 1) ? 0.2 : 1,
                  pointerEvents: (dir === -1 && phase === 0) || (dir === 1 && phase === T - 1) ? "none" : "auto",
                }}>{label}</button>
            ))}
            <span style={{ fontSize: 11, color: s.muted }}>{phase + 1} / {T}</span>
            <span style={{ fontSize: 10, color: s.muted, opacity: 0.5, marginLeft: 8 }}>scroll or ← → keys</span>
          </div>
        </div>
        {/* Scroll hint */}
        {phase < T - 1 && (
          <div style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
            fontSize: 11, color: s.muted, letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            display: "flex", alignItems: "center", gap: 6, opacity: 0.5,
          }}>
            <span style={{ display: "inline-block", animation: "processBob 1.5s ease-in-out infinite" }}>↓</span>
            scroll to advance
          </div>
        )}
        <style>{`@keyframes processBob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}`}</style>
      </div>
    </div>
  );
}
```

### Integration point

In `app/page.tsx`, render `<ProcessSection />` between the "How It Works" section and the "Dashboard Showcase" section:

```tsx
import ProcessSection from '@/components/process-section';

// ... inside the return, after the How It Works </section> closing tag:

<ProcessSection />

{/* DASHBOARD SHOWCASE */}
<section className="py-20 md:py-32 ...">
```

---

## Component 2: FooterSpotlight

**File:** `components/footer-spotlight.tsx`

### What it does

A footer with a giant wordmark image that has a cursor-tracking spotlight reveal effect. The wordmark is nearly invisible (`opacity: 0.04`) until the user hovers, at which point a radial mask follows the cursor and reveals a brighter version underneath.

### Features

- **Spotlight effect** — `radial-gradient` CSS mask follows `mousemove` coordinates
- **Two image layers** — dim base layer + bright spotlight layer using Next.js `<Image fill />`
- **Bottom gradient fade** — blends wordmark into the `#0a0a0a` background
- **Top bar** — brand name, tagline, quote, copyright
- **Uses Tailwind classes** — matches existing site design system
- **Prop: `wordmarkSrc`** — defaults to `/assets/whole-word-removebg.png`

### Full source

```tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// ─── Props ───
interface FooterSpotlightProps {
  /** Path to the removebg Salience wordmark image */
  wordmarkSrc?: string;
}

export default function FooterSpotlight({
  wordmarkSrc = "/assets/whole-word-removebg.png",
}: FooterSpotlightProps) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });
  };

  return (
    <footer className="pt-16 border-t border-white/[0.06]">
      {/* Top bar */}
      <div className="max-w-[1100px] mx-auto px-7 flex justify-between items-start pb-8">
        <div>
          <div className="text-base font-bold text-white/80 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs text-black">
              ⚡
            </span>
            Salience
          </div>
          <p className="text-sm font-normal text-white/60 mt-1">
            AI Automation for Private Practices
          </p>
          <p className="text-[0.75rem] text-amber-500 italic mt-2.5 max-w-[300px]">
            &ldquo;Soon the person you&apos;ll spend the most time with is your
            tax advisor&rdquo;
          </p>
        </div>
        <div className="text-[0.7rem] text-white/30 text-right">
          &copy; 2026 Salience.
          <br />
          All rights reserved.
        </div>
      </div>

      {/* Giant wordmark with spotlight */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative h-[200px] flex items-end justify-center overflow-hidden cursor-default"
      >
        {/* Base layer: very dim wordmark */}
        <div className="relative w-full max-w-[800px] h-[160px]">
          <Image
            src={wordmarkSrc}
            alt="Salience"
            fill
            className="object-contain opacity-[0.04]"
            style={{ filter: "brightness(0.8)" }}
            priority={false}
          />

          {/* Spotlight layer: follows cursor */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hovering ? 1 : 0,
              WebkitMaskImage: `radial-gradient(circle 150px at ${mouse.x}% ${mouse.y}%, black 0%, transparent 100%)`,
              maskImage: `radial-gradient(circle 150px at ${mouse.x}% ${mouse.y}%, black 0%, transparent 100%)`,
            }}
          >
            <Image
              src={wordmarkSrc}
              alt=""
              fill
              className="object-contain"
              style={{
                opacity: 0.6,
                filter: "brightness(1.4) saturate(1.2)",
              }}
              priority={false}
            />
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </div>

      <div className="text-center pb-6 text-[0.65rem] text-white/20">
        Salience
      </div>
    </footer>
  );
}
```

### Integration point

In `app/page.tsx`, replace the existing `<footer>` block at the bottom of `<main>` with:

```tsx
import FooterSpotlight from '@/components/footer-spotlight';

// ... at the bottom of <main>, replacing the old <footer>...</footer>:

<FooterSpotlight />
```

---

## Changes to `app/page.tsx`

Only two things change in page.tsx:

### 1. Add imports (top of file, after existing imports)

```tsx
import ProcessSection from '@/components/process-section';
import FooterSpotlight from '@/components/footer-spotlight';
```

### 2. Add `<ProcessSection />` after the "How It Works" section (after line ~438 in current main)

```tsx
        </section>

        {/* OUR PROCESS — Scroll-driven phases */}
        <ProcessSection />

        {/* DASHBOARD SHOWCASE */}
        <section className="py-20 md:py-32 ...">
```

### 3. Replace the `<footer>` at the bottom with `<FooterSpotlight />`

Delete the entire `<footer className="py-12 ...">...</footer>` block and replace with:

```tsx
        <FooterSpotlight />
      </main>
    </>
  );
}
```

---

## Changes to `app/layout.tsx`

The Google Fonts import (`import { Inter } from 'next/font/google'`) was removed because it can fail in build environments without network access. The font stack is already defined in `globals.css` on `html, body`. The layout is now:

```tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Salience - AI Automation for Private Practices',
  description: 'Run your practice like you have 10 versions of yourself. AI that handles client intake, follow-ups, scheduling, and admin work for insurance agencies, healthcare practices, and professional services.',
  keywords: ['AI automation', 'private practice', 'insurance agency', 'healthcare automation', 'client intake', 'scheduling automation', 'business automation'],
  authors: [{ name: 'Aqeel Ali' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Salience - AI Automation for Private Practices',
    description: 'Run your practice like you have 10 versions of yourself. AI-powered automation for client intake, scheduling, and administrative tasks.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
```

**Note:** If you want to restore the Google Font, add this back:

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
// then add className={inter.className} to <html>
```

---

## No other files change

- `globals.css` — untouched
- `components/navbar.tsx` — untouched
- `package.json` — no new dependencies needed
- `next.config.ts` — untouched

---

## Design System Tokens (for reference)

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Amber | `#f59e0b` |
| Amber Light | `#fbbf24` |
| Amber Dark | `#d97706` |
| Text | `#ffffff` |
| Text Dim | `rgba(255,255,255,0.6)` |
| Text Muted | `rgba(255,255,255,0.3)` |
| Border | `rgba(255,255,255,0.06)` |
| Surface | `rgba(20,20,20,0.9)` |
| Font Stack | `"Manrope", "Inter", -apple-system, BlinkMacSystemFont, sans-serif` |
| Gradient Text | `section-gradient-text` class in globals.css |
| CTA Button | `cta-button` class in globals.css |
| Scroll Reveals | `scroll-reveal`, `scroll-reveal-left`, `scroll-reveal-right`, `scroll-reveal-scale` + `stagger-1` through `stagger-5` |
