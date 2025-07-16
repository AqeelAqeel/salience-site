'use client';

export function LavaLamp({ side }: { side: 'left' | 'right' }) {
  return (
    <div 
      className={`fixed ${side === 'left' ? 'left-0' : 'right-0'} top-0 h-full w-32 md:w-48 lg:w-64 pointer-events-none z-0 overflow-hidden opacity-50`}
    >
      <div className="relative w-full h-full">
        <div className={`absolute inset-0 ${side === 'left' ? '-translate-x-1/2' : 'translate-x-1/2'}`}>
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