'use client';

interface LavaLampProps {
  side: 'left' | 'right';
}

export function LavaLamp({ side }: LavaLampProps) {
  return (
    <div 
      className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-1/3 h-full pointer-events-none z-0`}
      aria-hidden="true"
    >
      <div className="lava-container">
        <div className="lava-blob lava-blob-1" />
        <div className="lava-blob lava-blob-2" />
        <div className="lava-blob lava-blob-3" />
        <div className="lava-blob lava-blob-4" />
        <div className="lava-blob lava-blob-5" />
      </div>
    </div>
  );
}