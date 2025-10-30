'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import { LavaLamp } from '@/components/lava-lamp';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeEcosystem, setActiveEcosystem] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToVideo = () => {
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Left ecosystem - fragmented life areas
  const leftNodes = [
    { id: 'meditation', emoji: '🧘', angle: 0, label: 'Meditation' },
    { id: 'wellness', emoji: '💊', angle: 45, label: 'Wellness' },
    { id: 'running', emoji: '🏃', angle: 90, label: 'Running' },
    { id: 'exercise', emoji: '💪', angle: 135, label: 'Exercise' },
    { id: 'finance', emoji: '💰', angle: 180, label: 'Finance' },
    { id: 'love', emoji: '❤️', angle: 225, label: 'Love' },
    { id: 'climbing', emoji: '🧗', angle: 270, label: 'Climbing' },
    { id: 'nutrition', emoji: '🥗', angle: 315, label: 'Nutrition' },
  ];

  // Right ecosystem - connected harmony
  const rightNodes = [
    { id: 'love-right', emoji: '💕', angle: 0, label: 'Love' },
    { id: 'people', emoji: '👥', angle: 60, label: 'Community' },
    { id: 'art', emoji: '🎨', angle: 120, label: 'Art' },
    { id: 'singing', emoji: '🎤', angle: 180, label: 'Singing' },
    { id: 'dancing', emoji: '💃', angle: 240, label: 'Dancing' },
    { id: 'joy', emoji: '😊', angle: 300, label: 'Joy' },
  ];

  return (
    <>
      <Header />
      
      {/* Lava Lamps on both sides */}
      <LavaLamp side="left" />
      <LavaLamp side="right" />
      
      <main className="relative overflow-hidden bg-[#0a0a0a] min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 dotted-pattern opacity-30" />
        <div className="absolute inset-0 noise-texture" />
        
        {/* Sun Rays Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="sun-rays" />
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-8 -mt-8">
          
          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            {/* Giant H1 with split gradient */}
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-bold tracking-tight mb-16 leading-none">
              <span className="being-gradient-text">Being;</span>{' '}
              <span className="understood-gradient-text drop-shadow-2xl">Understood.</span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-cyan-300 leading-relaxed mb-12 max-w-4xl mx-auto font-medium mystical-glow">
              Salience builds bridges to the other side. Transform consciousness into creation. Where minimalism meets the future of design innovation.
            </p>
            
          </div>

        </section>

        {/* App Grid Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 max-w-4xl mx-auto">
              {/* App Tiles */}
              <div className="app-tile bg-gradient-to-br from-orange-500 to-red-500" data-label="retentech.ai" tabIndex={0}>
                <span className="app-name">retentech.ai</span>
              </div>
              <div className="app-tile bg-gradient-to-br from-blue-500 to-purple-500" data-label="okaybestie.com" tabIndex={0}>
                <span className="app-name">okaybestie.com</span>
              </div>
              <div className="app-tile bg-gradient-to-br from-green-500 to-teal-500" data-label="morelore.app" tabIndex={0}>
                <span className="app-name">morelore.app</span>
              </div>
              <div className="app-tile bg-gradient-to-br from-pink-500 to-rose-500" data-label="chaos.energy" tabIndex={0}>
                <span className="app-name">chaos.energy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Manifest Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic mb-8">
              The system exists because of necessary constraints and designs to get things happening. 
              We remove those limitations. The individualized nuances don't have to exist anymore as 
              creation can create. Creation and synergies are infinite.
            </p>
            
          </div>
        </section>

        {/* Video Section */}
        <section id="video-section" className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative mystical-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="mystical-gradient-text">Experience the Vision</span>
            </h2>
            
            <div className="video-border">
              <div className="bg-black/80 rounded-xl aspect-video flex items-center justify-center border border-purple-500/30 backdrop-blur-sm">
                {/* Video placeholder - replace with your video */}
                <div className="text-white text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/50 mystical-glow">
                      <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-cyan-300 mystical-glow">Commercial Video Placeholder</p>
                  <p className="text-sm text-purple-300 mt-2">Replace with your video content</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bridging Section - New Interactive Ecosystem */}
        <section className="py-40 px-4 sm:px-6 lg:px-8 relative bg-black mystical-bg">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-24">
              <span className="mystical-gradient-text">Bridging to post-scarcity.</span>
            </h2>

            {/* Three-column layout with centered background logo */}
            <div className="relative">
              {/* Large Background Salience Logo - Positioned Behind Everything */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] opacity-10">
                  <Image 
                    src="/assets/Salience_Logo_Cover_Art-removebg-preview (1).png" 
                    alt="Salience Bridge Background" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-center relative z-10">
                
                {/* Left Ecosystem - Fragmented */}
                <div 
                  className="relative h-[400px] md:h-[500px] flex items-center justify-center"
                  onMouseEnter={() => setActiveEcosystem('left')}
                  onMouseLeave={() => setActiveEcosystem(null)}
                >
                  <div className="absolute inset-0 ecosystem-container">
                    {/* Central node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`central-node ${activeEcosystem === 'left' ? 'scale-110' : ''} transition-all duration-500`}>
                        <span className="text-4xl">🧠</span>
                        <span className="text-4xl">❤️</span>
                        <span className="text-2xl">🔋</span>
                      </div>
                    </div>

                    {/* Surrounding nodes */}
                    {mounted && leftNodes.map((node, index) => {
                      const radius = 150;
                      const angleRad = (node.angle * Math.PI) / 180;
                      const x = Math.round(Math.cos(angleRad) * radius * 100) / 100;
                      const y = Math.round(Math.sin(angleRad) * radius * 100) / 100;
                      
                      return (
                        <div
                          key={node.id}
                          className={`ecosystem-node ${hoveredNode === node.id ? 'scale-125 z-20' : ''} ${activeEcosystem === 'left' ? 'animate-pulse-slow' : ''}`}
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            '--animation-delay': `${index * 0.2}s`
                          } as React.CSSProperties}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <div className="node-content">
                            <span className="text-3xl">{node.emoji}</span>
                            {hoveredNode === node.id && (
                              <span className="node-label">{node.label}</span>
                            )}
                          </div>
                          {/* Connection line */}
                          <svg className="connection-line" style={{ width: radius, height: radius }}>
                            <line
                              x1="50%"
                              y1="50%"
                              x2={`${50 - (x/radius) * 50}%`}
                              y2={`${50 - (y/radius) * 50}%`}
                              stroke="rgba(255, 183, 77, 0.3)"
                              strokeWidth="2"
                              strokeDasharray="5 5"
                              className={activeEcosystem === 'left' ? 'animate-dash' : ''}
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Center Bridge Animation Arrows Only */}
                <div className="relative flex items-center justify-center">
                  <div className="relative">
                    {/* Animated arrows */}
                    <div className="flex items-center gap-4">
                      <div className="arrow-flow-left w-16 md:w-24"></div>
                      <div className="text-4xl opacity-50">→</div>
                      <div className="arrow-flow-right w-16 md:w-24"></div>
                    </div>
                  </div>
                </div>

                {/* Right Ecosystem - Connected */}
                <div 
                  className="relative h-[400px] md:h-[500px] flex items-center justify-center"
                  onMouseEnter={() => setActiveEcosystem('right')}
                  onMouseLeave={() => setActiveEcosystem(null)}
                >
                  <div className="absolute inset-0 ecosystem-container">
                    {/* Central connected state */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`central-node-connected ${activeEcosystem === 'right' ? 'scale-110' : ''} transition-all duration-500`}>
                        <span className="text-5xl">✨</span>
                      </div>
                    </div>

                    {/* Connected nodes with web-like structure */}
                    {mounted && rightNodes.map((node, index) => {
                      const radius = 140;
                      const angleRad = (node.angle * Math.PI) / 180;
                      const x = Math.round(Math.cos(angleRad) * radius * 100) / 100;
                      const y = Math.round(Math.sin(angleRad) * radius * 100) / 100;
                      
                      return (
                        <div
                          key={node.id}
                          className={`ecosystem-node-connected ${hoveredNode === node.id ? 'scale-125 z-20' : ''} ${activeEcosystem === 'right' ? 'glow-effect' : ''}`}
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            '--animation-delay': `${index * 0.15}s`
                          } as React.CSSProperties}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <div className="node-content-connected">
                            <span className="text-3xl">{node.emoji}</span>
                            {hoveredNode === node.id && (
                              <span className="node-label">{node.label}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Web connections between all nodes */}
                    {activeEcosystem === 'right' && mounted && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {rightNodes.map((node1, i) => 
                          rightNodes.slice(i + 1).map((node2) => {
                            const radius = 140;
                            const angle1Rad = (node1.angle * Math.PI) / 180;
                            const angle2Rad = (node2.angle * Math.PI) / 180;
                            const x1 = Math.cos(angle1Rad) * radius + 200;
                            const y1 = Math.sin(angle1Rad) * radius + 200;
                            const x2 = Math.cos(angle2Rad) * radius + 200;
                            const y2 = Math.sin(angle2Rad) * radius + 200;
                            
                            return (
                              <line
                                key={`${node1.id}-${node2.id}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="url(#gradient-line)"
                                strokeWidth="1"
                                opacity="0.4"
                                className="connection-web animate-pulse-slow"
                              />
                            );
                          })
                        )}
                        <defs>
                          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FDB813" />
                            <stop offset="50%" stopColor="#FF6B35" />
                            <stop offset="100%" stopColor="#EE4E34" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom description */}
            <div className="mt-20 text-center max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-cyan-300 font-medium leading-relaxed mystical-glow">
                From scattered focus to unified consciousness.<br />Salience bridges your fragmented digital life into harmonious flow.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-24 text-center space-y-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Ready to explore deeper?
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-5xl mx-auto">
                <a href="/cross-the-bridge" className="flex-1">
                  <Button 
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                  >
                    🌉 Cross the Bridge
                  </Button>
                </a>
                <a href="/heavens-gate" className="flex-1">
                  <Button 
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                  >
                    🌌 Heaven's Gate?
                  </Button>
                </a>
                <a href="/chat-analysis" className="flex-1">
                  <Button 
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                  >
                    🔍 try anal?
                  </Button>
                </a>
                <a href="/cognition-covenance" className="flex-1">
                  <Button 
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                  >
                    🧠 Cognition Coven
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}