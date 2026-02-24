"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Phase Data ───
interface Phase {
  tag: string;
  name: string;
  time: string;
  desc: string;
  deliverable: string;
  amber?: boolean;
}

const PHASES: Phase[] = [
  {
    tag: "Phase 01",
    name: "Manual & Full Process Audit",
    time: "Week 1\u20132",
    desc: "We sit in your workflows. Watch the bottlenecks. Map every input, handoff, and time sink. No assumptions \u2014 we audit the real operations before touching anything.",
    deliverable: "\uD83D\uDCCB Process map + bottleneck report delivered",
    amber: true,
  },
  {
    tag: "Phase 02",
    name: "Something in Your Hands",
    time: "Week 2\u20133",
    desc: "Fast turnaround. You get a working solution \u2014 not a deck, not a proposal. A real tool you can start using immediately. First couple weeks, it\u2019s in your hands.",
    deliverable: "\u26A1 Working prototype / first automation live",
  },
  {
    tag: "Phase 03",
    name: "Use It. Break It. Improve It.",
    time: "Week 3\u20136",
    desc: "You\u2019re actively using the system on the job. We iterate in real-time based on what works and what doesn\u2019t. Feedback loops are tight \u2014 changes ship same week.",
    deliverable: "\uD83D\uDD04 Weekly iterations + refinement cycles",
  },
  {
    tag: "Phase 04",
    name: "Monthly Maintenance & Support",
    time: "Month 2+",
    desc: "System is stable. We shift to a monthly cadence \u2014 monitoring, maintenance, and incremental improvements. You\u2019re covered without the overhead of full-time staff.",
    deliverable: "\uD83D\uDCCA Monthly report + support retainer",
  },
  {
    tag: "Phase 05",
    name: "Platform Subscription + SLA",
    time: "Ongoing",
    desc: "The automation becomes your platform. Software subscription with maintenance and service level agreements. Uptime guarantees, priority support, continuous improvement.",
    deliverable: "\uD83D\uDD12 SLA-backed platform with guaranteed uptime",
  },
];

const BAR_LABELS = ["Audit", "Deliver", "Iterate", "Monthly", "Platform"];

const AMBIENT_GLOWS = [
  "radial-gradient(ellipse at 20% 50%, rgba(251,191,36,0.06) 0%, transparent 50%)",
  "radial-gradient(ellipse at 35% 40%, rgba(251,191,36,0.05) 0%, transparent 50%)",
  "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 50%)",
  "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.04) 0%, transparent 50%)",
  "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.03) 0%, transparent 50%)",
];

// ─── Component ───
export default function ProcessSection() {
  const [phase, setPhase] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const manualTimeout = useRef<NodeJS.Timeout | null>(null);
  const TOTAL = PHASES.length;

  // ── Scroll-driven phase progression ──
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || manualMode) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const range = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / range));
      const newPhase = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
      setPhase(newPhase);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [manualMode, TOTAL]);

  // ── Re-engage scroll mode after manual interaction ──
  useEffect(() => {
    if (!manualMode) return;
    const handleScroll = () => {
      if (manualTimeout.current) clearTimeout(manualTimeout.current);
      manualTimeout.current = setTimeout(() => setManualMode(false), 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (manualTimeout.current) clearTimeout(manualTimeout.current);
    };
  }, [manualMode]);

  // ── Navigate to phase ──
  const goToPhase = useCallback(
    (i: number) => {
      setManualMode(true);
      setPhase(Math.max(0, Math.min(TOTAL - 1, i)));
    },
    [TOTAL]
  );

  // ── Keyboard nav ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToPhase(phase + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPhase(phase - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, goToPhase]);

  const barPct = (phase / (TOTAL - 1)) * 100;

  return (
    <div
      ref={scrollContainerRef}
      id="process"
      style={{ height: `${TOTAL * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Ambient glow layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{ background: AMBIENT_GLOWS[phase] }}
        />

        <div className="max-w-[1100px] mx-auto px-7 w-full relative z-10">
          {/* ── Header ── */}
          <div className="scroll-reveal" data-reveal="">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm text-black">
                ⚡
              </span>
              <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase text-amber-500">
                Our Process
              </span>
            </div>
          </div>

          <h2 className="scroll-reveal stagger-1 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-2">
            Huge wins.{" "}
            <span className="section-gradient-text">Minimal friction.</span>
          </h2>

          <p className="scroll-reveal stagger-2 text-base font-normal text-white/60 max-w-[460px] leading-relaxed mb-10">
            We move fast, prove value early, and build toward a system you own.
          </p>

          {/* ── Progress Bar ── */}
          <div className="relative mb-9">
            {/* Track */}
            <div className="w-full h-[3px] bg-white/[0.08] rounded-sm relative">
              {/* Fill */}
              <div
                className="h-full rounded-sm relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: `${barPct}%`,
                  background:
                    "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  boxShadow: "0 0 12px rgba(251,191,36,0.15)",
                }}
              >
                {/* Glow dot at tip */}
                <div
                  className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: "#fbbf24",
                    boxShadow:
                      "0 0 16px rgba(251,191,36,0.6), 0 0 4px rgba(251,191,36,0.8)",
                  }}
                />
              </div>

              {/* Milestone dots */}
              {BAR_LABELS.map((_, i) => {
                const left = (i / (TOTAL - 1)) * 100;
                const reached = i < phase;
                const active = i === phase;
                return (
                  <button
                    key={i}
                    onClick={() => goToPhase(i)}
                    className="absolute top-1/2 rounded-full border-2 z-[2] transition-all duration-300 hover:scale-150"
                    style={{
                      left: `${left}%`,
                      transform: "translate(-50%, -50%)",
                      width: active ? 12 : 10,
                      height: active ? 12 : 10,
                      borderColor: active
                        ? "#fbbf24"
                        : reached
                        ? "#f59e0b"
                        : "rgba(255,255,255,0.15)",
                      background: active
                        ? "#fbbf24"
                        : reached
                        ? "#f59e0b"
                        : "#0a0a0a",
                      boxShadow: active
                        ? "0 0 12px rgba(251,191,36,0.5)"
                        : reached
                        ? "0 0 8px rgba(251,191,36,0.15)"
                        : "none",
                      cursor: "pointer",
                    }}
                    aria-label={`Go to ${BAR_LABELS[i]}`}
                  />
                );
              })}
            </div>

            {/* Labels */}
            <div className="hidden md:flex justify-between mt-3">
              {BAR_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => goToPhase(i)}
                  className="text-center w-[20%] transition-colors duration-300 cursor-pointer text-[0.7rem] font-semibold tracking-[0.08em] uppercase"
                  style={{
                    color:
                      i === phase
                        ? "#f59e0b"
                        : i < phase
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.3)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Phase Card Carousel ── */}
          <div className="relative min-h-[280px]">
            {PHASES.map((p, i) => {
              const isActive = i === phase;
              const isPast = i < phase;
              return (
                <div
                  key={i}
                  className="top-0 left-0 w-full transition-all duration-500"
                  style={{
                    position: isActive ? "relative" : "absolute",
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? "translateX(0)"
                      : isPast
                      ? "translateX(-50px)"
                      : "translateX(50px)",
                    pointerEvents: isActive ? "auto" : "none",
                    transitionTimingFunction:
                      "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div className="flex gap-6 items-start">
                    {/* Big ghost number */}
                    <div
                      className="hidden md:block text-[4rem] font-extrabold leading-none select-none shrink-0"
                      style={{ color: "rgba(251,191,36,0.06)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div>
                      {/* Tag */}
                      <span
                        className="inline-block mb-2.5 px-3 py-1 rounded-md text-[0.65rem] font-bold tracking-[0.12em] uppercase"
                        style={
                          p.amber
                            ? {
                                color: "#000",
                                background:
                                  "linear-gradient(135deg, #f59e0b, #d97706)",
                              }
                            : {
                                color: "#f59e0b",
                                background: "rgba(251,191,36,0.08)",
                                border:
                                  "1px solid rgba(251,191,36,0.2)",
                              }
                        }
                      >
                        {p.tag}
                      </span>

                      {/* Name */}
                      <h3 className="text-[1.4rem] font-bold tracking-[-0.02em] mb-1 text-white">
                        {p.name}
                      </h3>

                      {/* Time */}
                      <div className="text-[0.75rem] text-white/30 mb-3.5">
                        {p.time}
                      </div>

                      {/* Description */}
                      <p className="text-[0.95rem] font-normal text-white/60 leading-relaxed max-w-[500px]">
                        {p.desc}
                      </p>

                      {/* Deliverable chip */}
                      <div
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
                        style={{
                          background: "rgba(251,191,36,0.04)",
                          border: "1px solid rgba(251,191,36,0.1)",
                        }}
                      >
                        <span className="text-[0.8rem] font-medium text-white/60">
                          {p.deliverable}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Arrow Navigation ── */}
          <div className="flex items-center gap-2.5 mt-7">
            <button
              onClick={() => goToPhase(phase - 1)}
              disabled={phase === 0}
              className="w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center text-base disabled:opacity-20 disabled:pointer-events-none hover:border-amber-500/30 hover:text-amber-500"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(20,20,20,0.9)",
                color: "rgba(255,255,255,0.6)",
              }}
              aria-label="Previous phase"
            >
              ←
            </button>
            <button
              onClick={() => goToPhase(phase + 1)}
              disabled={phase === TOTAL - 1}
              className="w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center text-base disabled:opacity-20 disabled:pointer-events-none hover:border-amber-500/30 hover:text-amber-500"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(20,20,20,0.9)",
                color: "rgba(255,255,255,0.6)",
              }}
              aria-label="Next phase"
            >
              →
            </button>
            <span className="text-[0.7rem] text-white/30">
              {phase + 1} / {TOTAL}
            </span>
            <span className="text-[0.6rem] text-white/20 ml-2">
              scroll or ← → keys
            </span>
          </div>
        </div>

        {/* Scroll hint */}
        {phase < TOTAL - 1 && (
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[0.7rem] text-white/30 tracking-[0.1em] uppercase flex items-center gap-1.5 animate-scroll">
            ↓ scroll to advance
          </div>
        )}
      </div>
    </div>
  );
}
