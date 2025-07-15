'use client';

export function LavaLamp({ side }: { side: 'left' | 'right' }) {
  return (
    <div 
      className={`fixed ${side === 'left' ? 'left-0' : 'right-0'} top-0 h-full w-48 md:w-64 lg:w-96 pointer-events-none z-10 overflow-hidden`}
    >
      <div className="relative w-full h-full">
        <div className={`absolute inset-0`}>
          <div className="lava-container">
            <div className="lava-blob lava-blob-1" />
            <div className="lava-blob lava-blob-2" />
            <div className="lava-blob lava-blob-3" />
            <div className="lava-blob lava-blob-4" />
            <div className="lava-blob lava-blob-5" />
          </div>
        </div>
      </div>
    </div>
  );
}