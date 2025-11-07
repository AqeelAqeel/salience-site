'use client';

import Header from '@/components/header';
import { LavaLamp } from '@/components/lava-lamp';

export default function CognitionConductorPage() {
  return (
    <>
      <Header />
      
      <LavaLamp side="left" />
      <LavaLamp side="right" />
      
      <main className="relative overflow-hidden bg-[#0a0a0a] min-h-screen">
        <div className="absolute inset-0 dotted-pattern opacity-30" />
        <div className="absolute inset-0 noise-texture" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="sun-rays" />
        </div>

        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-8 -mt-8">
          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-bold tracking-tight mb-16 leading-none">
              <span className="mystical-gradient-text">cognitive conduit conductor,</span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-cyan-300 leading-relaxed mb-12 max-w-4xl mx-auto font-medium mystical-glow">
              channeling continuous creativity
            </p>
          </div>
        </section>
      </main>
    </>
  );
}