import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';
import { LavaLamp } from '@/components/lava-lamp';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      {/* Lava Lamps on both sides */}
      <LavaLamp side="left" />
      <LavaLamp side="right" />

      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10" />
          
          <div className="relative z-20 text-center max-w-6xl mx-auto">
            {/* Main asset - using dummy.graphic.png */}
            <div className="mb-8 mx-auto w-64 h-64 md:w-96 md:h-96 relative">
              <Image 
                src="/assets/Salience_Logo_Cover.png" 
                alt="Salience Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Giant tagline */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
              <span className="gradient-text">make it personal.</span>
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Transform consciousness into creation. Where minimalism meets the future.
            </p>
            
            <div className="mt-12">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
              >
                Begin Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="gradient-text">Experience the Vision</span>
            </h2>
            
            <div className="video-border">
              <div className="bg-black/80 backdrop-blur-md rounded-xl aspect-video flex items-center justify-center">
                {/* Video placeholder - replace with your video */}
                <div className="text-white text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2" />
                    </div>
                  </div>
                  <p className="text-lg opacity-80">Commercial Video Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Card Gradient Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="gradient-text">Minimalist Excellence</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <a href="https://chaos.energy" target="_blank" rel="noopener noreferrer" className="bg-white/10 dark:bg-white/5 backdrop-blur-md p-8 text-center group cursor-pointer rounded-2xl border border-white/20 hover:bg-white/20 dark:hover:bg-white/10 transition-all">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600/80 to-pink-600/80 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white/90">Chaos.energy</h3>
                <p className="text-white/70">
                  Harness the power of controlled chaos. Transform energy into innovation.
                </p>
              </a>

              <a href="https://tricks.ai" target="_blank" rel="noopener noreferrer" className="bg-white/10 dark:bg-white/5 backdrop-blur-md p-8 text-center group cursor-pointer rounded-2xl border border-white/20 hover:bg-white/20 dark:hover:bg-white/10 transition-all">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600/80 to-cyan-600/80 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white/90">tricks.ai</h3>
                <p className="text-white/70">
                  AI-powered solutions that defy expectations. The future of intelligent automation.
                </p>
              </a>

              <a href="https://okaybestie.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 dark:bg-white/5 backdrop-blur-md p-8 text-center group cursor-pointer rounded-2xl border border-white/20 hover:bg-white/20 dark:hover:bg-white/10 transition-all">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600/80 to-emerald-600/80 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white/90">OkayBestie</h3>
                <p className="text-white/70">
                  Your digital companion for life's journey. Making connections that matter.
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="gradient-text">Ready to Transcend?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12">
              Join the consciousness revolution. Make it personal.
            </p>
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
            >
              Start Your Journey
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}