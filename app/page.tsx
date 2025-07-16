import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Zap, Globe, Layers, Eye, PenTool, MoveHorizontal } from 'lucide-react';
import { LavaLamp } from '@/components/lava-lamp';
import Image from 'next/image';
import Link from 'next/link';

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
                src="/assets/Salience_Logo_Cover_Art-removebg-preview (1).png" 
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
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-20">
              <span className="gradient-text">Featured Projects</span>
            </h2>
            
            {/* Gesture Indicator */}
            <div className="flex justify-center mb-8 lg:hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <MoveHorizontal className="w-4 h-4 text-white/60 swipe-indicator" />
                <span className="text-sm text-white/60">Swipe to explore</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="overflow-x-auto cards-scroll-container pb-6 -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
                <div className="flex lg:grid lg:grid-cols-3 gap-8 lg:gap-12 min-w-max lg:min-w-0">
                  {/* Chaos.energy Card */}
                  <a 
                    href="https://chaos.energy" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="relative group flex-shrink-0 w-80 lg:w-auto card-snap"
                  >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-black/90 p-10 rounded-3xl border border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-8">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                        <Zap className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">Chaos.energy</h3>
                  <p className="text-gray-300 text-lg leading-relaxed flex-grow">
                    Harness the power of controlled chaos. Transform energy into breakthrough innovation.
                  </p>
                  <div className="mt-8 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>

                  {/* tricks.ai Card */}
                  <a 
                    href="https://tricks.ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="relative group flex-shrink-0 w-80 lg:w-auto card-snap"
                  >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-black/90 p-10 rounded-3xl border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-8">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                        <Globe className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">tricks.ai</h3>
                  <p className="text-gray-300 text-lg leading-relaxed flex-grow">
                    AI-powered solutions that defy expectations. The future of intelligent automation.
                  </p>
                  <div className="mt-8 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium">Discover</span>
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>

                  {/* OkayBestie Card */}
                  <a 
                    href="https://okaybestie.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="relative group flex-shrink-0 w-80 lg:w-auto card-snap"
                  >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-black/90 p-10 rounded-3xl border border-green-500/20 group-hover:border-green-500/50 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-8">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">OkayBestie</h3>
                  <p className="text-gray-300 text-lg leading-relaxed flex-grow">
                    Your digital companion for life's journey. Making connections that matter.
                  </p>
                  <div className="mt-8 flex items-center justify-center text-green-400 group-hover:text-green-300 transition-colors">
                    <span className="text-sm font-medium">Connect</span>
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Thesis Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            {/* 3D Background Elements */}
            <div className="perspective-container absolute inset-0 pointer-events-none">
              {/* Floating geometric shapes */}
              <div className="geometric-shape float-3d w-32 h-32 rounded-2xl" style={{ top: '10%', left: '10%', transform: 'rotate(45deg)' }} />
              <div className="geometric-shape float-3d w-48 h-48 rounded-full holographic" style={{ top: '60%', right: '15%', animationDelay: '5s' }} />
              <div className="geometric-shape float-3d w-24 h-24 rounded-xl" style={{ bottom: '20%', left: '25%', animationDelay: '10s' }} />
              
              {/* Orbital elements */}
              <div className="orbital-element" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full backdrop-blur-sm" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - Text content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/80">Discover Our Vision</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="gradient-text">Beyond Interface.</span>
                  <br />
                  <span className="text-white">Into Experience.</span>
                </h2>
                
                <p className="text-xl text-gray-300 leading-relaxed">
                  We're reimagining human-computer interaction from the ground up. Our thesis explores how technology should adapt to human behavior, not the other way around.
                </p>
                
                <Link href="/thesis">
                  <Button 
                    size="lg"
                    className="group relative rounded-full px-8 py-6 text-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md hover:from-purple-600/30 hover:to-pink-600/30 text-white border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">Explore Our Thesis</span>
                    <Layers className="relative z-10 ml-3 h-5 w-5 transform group-hover:rotate-12 transition-transform" />
                    {/* Animated Quill */}
                    <div className="absolute inset-0 pointer-events-none">
                      <PenTool className="absolute h-8 w-8 text-purple-300/50 quill-animation" style={{ top: '50%', marginTop: '-16px' }} />
                    </div>
                  </Button>
                </Link>
              </div>

              {/* Right side - 3D Visual */}
              <div className="relative h-[500px] perspective-container">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 rounded-3xl" />
                
                {/* Central 3D element */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative w-64 h-64 md:w-80 md:h-80">
                    {/* Layered glass panels */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl transform rotate-12 depth-shadow" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-md rounded-3xl transform -rotate-6 translate-z-10 depth-shadow" style={{ transform: 'translateZ(30px) rotate(-6deg)' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-3xl transform rotate-3 depth-shadow" style={{ transform: 'translateZ(60px) rotate(3deg)' }} />
                    
                    {/* Center icon - Glass morphism instead of solid black */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 border border-white/20 shadow-2xl">
                        <Layers className="w-16 h-16 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating particles */}
                <div className="absolute top-10 right-10 w-4 h-4 bg-purple-400 rounded-full animate-pulse" />
                <div className="absolute bottom-20 left-10 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
              </div>
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