"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// ─── Props ───
interface FooterSpotlightProps {
  /** Path to the removebg Salience wordmark image */
  wordmarkSrc?: string;
}

export default function FooterSpotlight({
  wordmarkSrc = "/assets/assets-whole-word-removebg.svg",
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
              {"\u26a1"}
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
