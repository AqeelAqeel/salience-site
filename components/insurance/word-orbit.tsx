'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface WordOrbitLogo {
  label: string;
  src: string;
  icon: LucideIcon;
}

type Slot = 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r';

const SLOT_POSITION: Record<Slot, string> = {
  tl: '-top-20 -left-20 md:-top-24 md:-left-28',
  tr: '-top-20 -right-20 md:-top-24 md:-right-28',
  bl: '-bottom-20 -left-20 md:-bottom-24 md:-left-28',
  br: '-bottom-20 -right-20 md:-bottom-24 md:-right-28',
  l:  'top-1/2 -translate-y-1/2 -left-28 md:-left-40',
  r:  'top-1/2 -translate-y-1/2 -right-28 md:-right-40',
};

const DRIFT_CLASSES = ['animate-orbit-a', 'animate-orbit-b', 'animate-orbit-c', 'animate-orbit-d'];

function Satellite({
  logo,
  slot,
  driftIdx,
  delay,
}: {
  logo: WordOrbitLogo;
  slot: Slot;
  driftIdx: number;
  delay: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const Icon = logo.icon;

  return (
    <span
      className={`absolute ${SLOT_POSITION[slot]} ${DRIFT_CLASSES[driftIdx % DRIFT_CLASSES.length]} hidden sm:inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md shadow-slate-200/60 rounded-full px-3 py-1.5 pointer-events-none whitespace-nowrap`}
      style={{ animationDelay: delay }}
    >
      <span className="w-5 h-5 relative flex items-center justify-center flex-shrink-0">
        {imgFailed ? (
          <Icon className="w-4 h-4 text-slate-600" />
        ) : (
          <Image
            src={logo.src}
            alt=""
            width={20}
            height={20}
            className="object-contain"
            onError={() => setImgFailed(true)}
          />
        )}
      </span>
      <span className="text-xs font-medium text-slate-700 leading-none">
        {logo.label}
      </span>
    </span>
  );
}

export default function WordOrbit({
  word,
  logos,
  gradient = 'blue-gradient-text',
  slots = ['l', 'r', 'tl', 'tr'],
}: {
  word: ReactNode;
  logos: WordOrbitLogo[];
  gradient?: string;
  slots?: Slot[];
}) {
  return (
    <span className="relative inline-block">
      <span className={gradient}>{word}</span>
      {logos.map((logo, i) => (
        <Satellite
          key={logo.label}
          logo={logo}
          slot={slots[i % slots.length]}
          driftIdx={i}
          delay={`${(i * 0.4).toFixed(1)}s`}
        />
      ))}
    </span>
  );
}
