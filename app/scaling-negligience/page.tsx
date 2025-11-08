'use client';

import Header from '@/components/header';
import { LavaLamp } from '@/components/lava-lamp';

export default function ScalingNegligencePage() {
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

        <section className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-16 relative pt-32 -mt-16">
          <div className="relative z-10 max-w-6xl mx-auto w-full">
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight mb-16 md:mb-20 leading-none text-center">
              <span className="mystical-gradient-text">Scaling Negligence</span>
            </h1>
            
            <div className="glass-dark rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10 mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 text-center">
                <span className="text-gradient">Systemic Failures</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl lg:prose-2xl prose-invert max-w-none text-center space-y-8">
                <p className="text-xl md:text-2xl lg:text-3xl text-cyan-300 leading-relaxed font-medium mystical-glow mb-12">
                  "The system is the best one we've got"
                </p>
                
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  <strong>Nah, I don't think so.</strong>
                </p>
                
                <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                  There's no more excuses. We've regressed to the minimal amount of perceived/experienced consequence in our actions. This is ridiculous.
                </p>
                
                <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                  The psychology we have when experiencing the pain, is not honored once uplifted or beyond that situation. The system produces fringes, and everyone just compromises or folds because "that's the way it is."
                </p>
                
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                  <em>Nah. It doesn't have to be.</em>
                </p>
                
                <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                  There's got to be ways to bring the best out, where actual participation happens, and we're not bottlenecked by the properties/realities of the engineering elements and nature of solutions that are compromising our day-to-day lives.
                </p>
                
                <p className="text-xl md:text-2xl text-cyan-300 leading-relaxed font-medium mystical-glow mt-12">
                  We scale human biases, oscillations across the board, and whatnot.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg md:text-xl text-white/60 leading-relaxed italic">
                The time for accepting systemic mediocrity is over. We can engineer better defaults.
              </p>
            </div>
            
          </div>
        </section>
      </main>
    </>
  );
}