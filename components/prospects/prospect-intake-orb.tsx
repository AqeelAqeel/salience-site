"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { IntakePhase, AnalyzerData } from "@/lib/types/prospects";

interface ProspectIntakeOrbProps {
  phase: IntakePhase;
  analyzerData: AnalyzerData | null;
  className?: string;
}

// Phase color configs
const PHASE_COLORS: Record<
  IntakePhase,
  { inner: string; mid: string; outer: string; glow: string }
> = {
  idle: {
    inner: "rgba(245, 158, 11, 0.35)",
    mid: "rgba(245, 158, 11, 0.15)",
    outer: "rgba(245, 158, 11, 0.0)",
    glow: "rgba(245, 158, 11, 0.06)",
  },
  listening: {
    inner: "rgba(251, 191, 36, 0.5)",
    mid: "rgba(245, 158, 11, 0.25)",
    outer: "rgba(245, 158, 11, 0.0)",
    glow: "rgba(251, 191, 36, 0.1)",
  },
  thinking: {
    inner: "rgba(168, 85, 247, 0.45)",
    mid: "rgba(245, 158, 11, 0.2)",
    outer: "rgba(168, 85, 247, 0.0)",
    glow: "rgba(168, 85, 247, 0.08)",
  },
  speaking: {
    inner: "rgba(251, 191, 36, 0.55)",
    mid: "rgba(245, 158, 11, 0.3)",
    outer: "rgba(245, 158, 11, 0.0)",
    glow: "rgba(251, 191, 36, 0.12)",
  },
};

function parseRGBA(rgba: string): [number, number, number, number] {
  const match = rgba.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/
  );
  if (!match) return [0, 0, 0, 0];
  return [+match[1], +match[2], +match[3], match[4] ? +match[4] : 1];
}

function lerpRGBA(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  const al = a[3] + (b[3] - a[3]) * t;
  return `rgba(${r}, ${g}, ${bl}, ${al.toFixed(3)})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function ProspectIntakeOrb({
  phase,
  analyzerData,
  className,
}: ProspectIntakeOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    time: 0,
    currentInner: parseRGBA(PHASE_COLORS.idle.inner),
    currentMid: parseRGBA(PHASE_COLORS.idle.mid),
    currentOuter: parseRGBA(PHASE_COLORS.idle.outer),
    currentGlow: parseRGBA(PHASE_COLORS.idle.glow),
    currentScale: 1,
    currentNoiseIntensity: 0,
    particles: [] as {
      angle: number;
      radius: number;
      size: number;
      speed: number;
      band: number;
    }[],
  });

  // Initialize particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 64; i++) {
      particles.push({
        angle: (i / 64) * Math.PI * 2,
        radius: 0,
        size: 1.5 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7,
        band: Math.floor(Math.random() * 4),
      });
    }
    stateRef.current.particles = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function render() {
      const s = stateRef.current;
      s.time += 16;
      const t = s.time;

      const rect = canvas!.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const baseRadius = Math.min(cx, cy) * 0.38;

      // Target values based on phase
      const colors = PHASE_COLORS[phase];
      const targetInner = parseRGBA(colors.inner);
      const targetMid = parseRGBA(colors.mid);
      const targetOuter = parseRGBA(colors.outer);
      const targetGlow = parseRGBA(colors.glow);

      const amplitude = analyzerData?.amplitude || 0;
      const bands = analyzerData?.frequencyBands || [0, 0, 0, 0];

      let targetScale = 1;
      let targetNoise = 0;
      switch (phase) {
        case "idle":
          targetScale = 1 + Math.sin(t * 0.002) * 0.03;
          targetNoise = 0.1;
          break;
        case "listening":
          targetScale = 1 + amplitude * 0.35;
          targetNoise = 0.3 + amplitude * 0.5;
          break;
        case "thinking":
          targetScale = 1 + Math.sin(t * 0.004) * 0.06;
          targetNoise = 0.7;
          break;
        case "speaking":
          targetScale = 1 + amplitude * 0.2 + Math.sin(t * 0.003) * 0.04;
          targetNoise = 0.2 + amplitude * 0.3;
          break;
      }

      // Lerp towards targets
      const lerpSpeed = 0.06;
      for (let i = 0; i < 4; i++) {
        s.currentInner[i] = lerp(s.currentInner[i], targetInner[i], lerpSpeed);
        s.currentMid[i] = lerp(s.currentMid[i], targetMid[i], lerpSpeed);
        s.currentOuter[i] = lerp(s.currentOuter[i], targetOuter[i], lerpSpeed);
        s.currentGlow[i] = lerp(s.currentGlow[i], targetGlow[i], lerpSpeed);
      }
      s.currentScale = lerp(s.currentScale, targetScale, lerpSpeed);
      s.currentNoiseIntensity = lerp(
        s.currentNoiseIntensity,
        targetNoise,
        lerpSpeed
      );

      const radius = baseRadius * s.currentScale;

      // Clear
      ctx!.clearRect(0, 0, rect.width, rect.height);

      // Layer 0: Ambient glow
      const glowGrad = ctx!.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radius * 2.5
      );
      const glowColor = lerpRGBA(
        [0, 0, 0, 0],
        s.currentGlow as [number, number, number, number],
        1
      );
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(0.4, glowColor);
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = glowGrad;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      // Layer 1: Main orb
      const orbGrad = ctx!.createRadialGradient(
        cx - radius * 0.15,
        cy - radius * 0.15,
        0,
        cx,
        cy,
        radius
      );
      orbGrad.addColorStop(
        0,
        lerpRGBA(
          [0, 0, 0, 0],
          s.currentInner as [number, number, number, number],
          1
        )
      );
      orbGrad.addColorStop(
        0.5,
        lerpRGBA(
          [0, 0, 0, 0],
          s.currentMid as [number, number, number, number],
          1
        )
      );
      orbGrad.addColorStop(
        1,
        lerpRGBA(
          [0, 0, 0, 0],
          s.currentOuter as [number, number, number, number],
          1
        )
      );

      ctx!.beginPath();
      ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx!.fillStyle = orbGrad;
      ctx!.fill();

      // Layer 2: Noise / distortion particles
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";

      const noiseCount = 80;
      const noiseIntensity = s.currentNoiseIntensity;

      for (let i = 0; i < noiseCount; i++) {
        const angle = (i / noiseCount) * Math.PI * 2;
        const layerOffset = (i % 3) * 0.2;
        const dist =
          radius *
          (0.3 + layerOffset + 0.4 * Math.sin(t * 0.003 + angle * 3));
        const displacement =
          noiseIntensity *
          12 *
          Math.sin(t * 0.005 + i * 0.7) *
          Math.cos(t * 0.003 + i * 1.1);

        const px = cx + Math.cos(angle) * (dist + displacement);
        const py = cy + Math.sin(angle) * (dist + displacement);

        const alpha = noiseIntensity * (0.15 + 0.1 * Math.sin(t * 0.004 + i));
        ctx!.beginPath();
        ctx!.arc(px, py, 1.5 + noiseIntensity * 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(251, 191, 36, ${alpha.toFixed(3)})`;
        ctx!.fill();
      }

      ctx!.restore();

      // Layer 3: Particle ring
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";

      const ringBaseRadius = radius * 1.35;

      for (const p of s.particles) {
        p.angle += p.speed * 0.002;
        const bandValue = bands[p.band] || 0;
        const targetParticleRadius = ringBaseRadius + bandValue * 35;
        p.radius = lerp(p.radius || ringBaseRadius, targetParticleRadius, 0.1);

        const wobble = Math.sin(t * 0.002 + p.angle * 5) * 3 * (1 + bandValue);
        const px = cx + Math.cos(p.angle) * (p.radius + wobble);
        const py = cy + Math.sin(p.angle) * (p.radius + wobble);

        const alpha = 0.2 + bandValue * 0.5;
        ctx!.beginPath();
        ctx!.arc(px, py, p.size * (0.8 + bandValue * 0.6), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(245, 158, 11, ${alpha.toFixed(3)})`;
        ctx!.fill();
      }

      ctx!.restore();

      // Layer 4: Inner highlight (fake specular)
      const highlightGrad = ctx!.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.3,
        0,
        cx,
        cy,
        radius * 0.8
      );
      highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      highlightGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
      highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx!.beginPath();
      ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx!.fillStyle = highlightGrad;
      ctx!.fill();

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [phase, analyzerData]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      style={{ display: "block" }}
    />
  );
}
