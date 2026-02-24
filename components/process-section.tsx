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
  { tag: "Phase 01", name: "Manual & Full Process Audit", time: "Week 1\u20132", desc: "We sit in your workflows. Watch the bottlenecks. Map every input, handoff, and time sink. No assumptions \u2014 we audit the real operations before touching anything.", deliverable: "\ud83d\udccb Process map + bottleneck report delivered", solid: true },
  { tag: "Phase 02", name: "Something in Your Hands", time: "Week 2\u20133", desc: "Fast turnaround. You get a working solution \u2014 not a deck, not a proposal. A real tool you can start using immediately.", deliverable: "\u26a1 Working prototype / first automation live" },
  { tag: "Phase 03", name: "Use It. Break It. Improve It.", time: "Week 3\u20136", desc: "You\u2019re actively using the system on the job. We iterate in real-time based on what works and what doesn\u2019t. Changes ship same week.", deliverable: "\ud83d\udd04 Weekly iterations + refinement cycles" },
  { tag: "Phase 04", name: "Maintenance & Support", time: "Month 2+", desc: "System is stable. We shift to a monthly cadence \u2014 monitoring, maintenance, and incremental improvements. You\u2019re covered.", deliverable: "\ud83d\udcca Monthly report + support retainer" },
  { tag: "Phase 05", name: "Platform Subscription + SLA", time: "Ongoing", desc: "The automation becomes your platform. Software subscription with SLAs. Uptime guarantees, priority support, continuous improvement.", deliverable: "\ud83d\udd12 SLA-backed platform with guaranteed uptime" },
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
            }}>{"\u26a1"}</span>
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
            {[{ dir: -1, label: "\u2190" }, { dir: 1, label: "\u2192" }].map(({ dir, label }) => (
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
            <span style={{ fontSize: 10, color: s.muted, opacity: 0.5, marginLeft: 8 }}>scroll or \u2190 \u2192 keys</span>
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
            <span style={{ display: "inline-block", animation: "processBob 1.5s ease-in-out infinite" }}>{"\u2193"}</span>
            scroll to advance
          </div>
        )}
        <style>{`@keyframes processBob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}`}</style>
      </div>
    </div>
  );
}
