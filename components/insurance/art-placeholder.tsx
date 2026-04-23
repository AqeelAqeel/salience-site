'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LucideIcon, ImageIcon } from 'lucide-react';

export default function ArtPlaceholder({
  src,
  alt,
  icon: Icon = ImageIcon,
  tone = 'from-blue-100 via-white to-amber-100',
  className = '',
}: {
  src: string;
  alt: string;
  icon?: LucideIcon;
  tone?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`relative w-full h-full bg-gradient-to-br ${tone} flex items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Icon className="w-10 h-10" strokeWidth={1.25} />
          <span className="text-xs uppercase tracking-widest">Art coming</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
