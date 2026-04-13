"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Phase {
  tag: string;
  name: string;
  time: string;
  desc: string;
  deliverable: string;
  solid?: boolean;
}

const PHASES: Phase[] = [
  { tag: "Phase 01", name: "Free Workflow Consultation", time: "Week 1", desc: "We spend 30\u201345 minutes understanding how you take calls, what forms and PDFs you fill, how you schedule and follow up, and where time is wasted or things fall through the cracks.", deliverable: "Workflow map + opportunity summary delivered", solid: true },
  { tag: "Phase 02", name: "Design-Partner Pilot", time: "Week 1\u20133", desc: "We map your workflows in detail, connect to your existing tools (phone, text, email, forms), and build a working prototype that captures, transcribes, and pre-fills your critical PDFs.", deliverable: "Working prototype + first automation live" },
  { tag: "Phase 03", name: "Test, Iterate, Refine", time: "Week 3\u20136", desc: "Your staff use the system on real clients. We track time saved, forms automated, and errors reduced. Changes ship same week based on real feedback.", deliverable: "Weekly iterations + measured results" },
  { tag: "Phase 04", name: "Deploy Your Custom System", time: "Month 2", desc: "System is stable and delivering value. We move to a 12-month subscription that includes hosting, maintenance, staff support, and updates as your business evolves.", deliverable: "SLA-backed platform with guaranteed uptime" },
  { tag: "Phase 05", name: "Expand & Refine", time: "Ongoing", desc: "Once your first workflow runs smoothly, we add new forms, extend to other departments, and integrate with more systems. We become your AI admin partner.", deliverable: "Continuous improvement + new integrations" },
];

const LABELS = ["Consult", "Pilot", "Iterate", "Deploy", "Expand"];
const T = PHASES.length;

const s = {
  blue: "#2563eb",
  blueLight: "#3b82f6",
  blueDark: "#1d4ed8",
  bg: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  dim: "#475569",
  muted: "#94a3b8",
  border: "#e2e8f0",
  font: '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif',
};

export default function ProcessSection() {
  const [phase, setPhase] = useState(0);
  const [manual, setManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barPct = (phase / (T - 1)) * 100;

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
        {/* Subtle blue ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          transition: "all 1s ease",
          background: `radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.04) 0%, transparent 50%)`,
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", width: "100%", position: "relative", zIndex: 1 }}>
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#fff", fontWeight: 700,
            }}>{"S"}</span>
            <span style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase" as const, color: s.blue,
            }}>How We Work</span>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8, color: s.text,
          }}>
            From consult to running{" "}
            <span style={{
              background: "linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>system</span>
            {" "}in weeks.
          </h2>
          <p style={{
            fontSize: 16, fontWeight: 400, color: s.dim,
            maxWidth: 500, lineHeight: 1.6, marginBottom: 40,
          }}>
            We move fast, prove value early, and build a system tailored to your business.
          </p>

          {/* Progress Bar */}
          <div style={{ position: "relative", marginBottom: 36 }}>
            <div style={{ width: "100%", height: 3, background: s.border, borderRadius: 3, position: "relative" }}>
              <div style={{
                height: "100%", borderRadius: 3, position: "relative",
                width: `${barPct}%`,
                background: `linear-gradient(90deg, ${s.blue}, ${s.blueLight})`,
                boxShadow: "0 0 12px rgba(37,99,235,0.15)",
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{
                  position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                  width: 12, height: 12, borderRadius: "50%", background: s.blueLight,
                  boxShadow: "0 0 16px rgba(37,99,235,0.4), 0 0 4px rgba(37,99,235,0.6)",
                }} />
              </div>

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
                    borderColor: active ? s.blueLight : reached ? s.blue : "#cbd5e1",
                    background: active ? s.blueLight : reached ? s.blue : s.bg,
                    boxShadow: active ? "0 0 12px rgba(37,99,235,0.4)" : reached ? "0 0 8px rgba(37,99,235,0.1)" : "none",
                    cursor: "pointer", zIndex: 2, transition: "all 0.3s ease", padding: 0,
                  }} />
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              {LABELS.map((lbl, i) => (
                <button key={i} onClick={() => go(i)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "center" as const, width: "20%", transition: "color 0.3s",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, fontFamily: s.font,
                  color: i === phase ? s.blue : i < phase ? s.dim : s.muted,
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Phase Card */}
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
                    <div style={{
                      fontSize: 64, fontWeight: 800, lineHeight: 1,
                      color: "rgba(37,99,235,0.08)", flexShrink: 0,
                      userSelect: "none" as const, minWidth: 72,
                    }}>{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <span style={{
                        display: "inline-block", marginBottom: 10,
                        padding: "5px 12px", borderRadius: 6,
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        ...(p.solid
                          ? { color: "#fff", background: `linear-gradient(135deg, ${s.blue}, ${s.blueDark})` }
                          : { color: s.blue, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }
                        ),
                      }}>{p.tag}</span>
                      <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: s.text }}>{p.name}</h3>
                      <div style={{ fontSize: 12, color: s.muted, marginBottom: 14 }}>{p.time}</div>
                      <p style={{ fontSize: 15, fontWeight: 400, color: s.dim, lineHeight: 1.7, maxWidth: 500 }}>{p.desc}</p>
                      <div style={{
                        marginTop: 16, padding: "10px 16px",
                        background: "rgba(37,99,235,0.04)",
                        border: "1px solid rgba(37,99,235,0.1)",
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

          {/* Arrows */}
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
                  opacity: (dir === -1 && phase === 0) || (dir === 1 && phase === T - 1) ? 0.3 : 1,
                  pointerEvents: (dir === -1 && phase === 0) || (dir === 1 && phase === T - 1) ? "none" : "auto",
                }}>{label}</button>
            ))}
            <span style={{ fontSize: 11, color: s.muted }}>{phase + 1} / {T}</span>
            <span style={{ fontSize: 10, color: s.muted, opacity: 0.5, marginLeft: 8 }}>{"scroll or \u2190 \u2192 keys"}</span>
          </div>
        </div>

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
