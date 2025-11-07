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
        <section className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-16 relative pt-16 -mt-16">
          
          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            {/* Giant H1 with split gradient */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-bold tracking-tight mb-20 md:mb-24 lg:mb-32 leading-none">
              <span className="being-gradient-text">Being;</span>
              <br className="hidden sm:block" />
              <span className="understood-gradient-text drop-shadow-2xl">Understood.</span>
            </h1>
            
            <div className="max-w-5xl mx-auto mb-16 md:mb-20 lg:mb-24">
              <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-cyan-300 leading-relaxed font-medium mystical-glow mb-8">
                Salience builds bridges to the other side.
              </p>
              <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed font-light max-w-4xl mx-auto">
                Transform consciousness into creation. Where minimalism meets the future of design innovation.
              </p>
            </div>
            
          </div>

        </section>

        {/* App Grid Section */}
        <section className="py-32 md:py-40 lg:py-48 px-6 sm:px-8 lg:px-12 xl:px-16 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-24 md:mb-32 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 md:mb-12">
                <span className="mystical-gradient-text">Our Ecosystem</span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
                Four interconnected experiences, each a window into different dimensions of human-computer symbiosis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto">
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

        {/* Philosophy & Manifesto Section */}
        <section className="py-40 md:py-48 lg:py-56 px-6 sm:px-8 lg:px-12 xl:px-16 relative mystical-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-24 md:mb-32">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-12 md:mb-16">
                <span className="mystical-gradient-text">Our Worldview</span>
              </h2>
            </div>
            
            <div className="space-y-16 md:space-y-20 lg:space-y-24">
              
              {/* Core Philosophy */}
              <div className="glass-dark rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 md:mb-12 text-center">
                  <span className="text-gradient">Why We Exist</span>
                </h3>
                <div className="prose prose-lg md:prose-xl lg:prose-2xl prose-invert max-w-none text-center">
                  <p className="text-white/90 leading-relaxed mb-8 md:mb-12">
                    We exist because of the <em>cataclysms of inefficiency</em> — the accumulated design choices, 
                    human conditions, behaviors, and biases that create friction in systems meant to serve us.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    We believe in the positive-sum values of focusing on <strong>nuances and imperfections</strong> — 
                    the room for improvement that others overlook — while respecting what already works.
                  </p>
                </div>
              </div>
              
              {/* What We Do */}
              <div className="glass-dark rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 md:mb-12 text-center">
                  <span className="text-gradient">What We Do</span>
                </h3>
                <div className="prose prose-lg md:prose-xl lg:prose-2xl prose-invert max-w-none text-center">
                  <p className="text-white/90 leading-relaxed mb-8 md:mb-12">
                    We don't rest on what's working — we <em>raise our defaults and baselines every day</em>. 
                    Through technology, research, and integrating what already exists, we refuse to default 
                    to provider laziness or become marginalized by their practical priorities.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    <strong>We have agency, but are not an agency.</strong> We build personalized nuance into 
                    scalable systems that integrate with the status quo, because we experience what's all too common 
                    and know what's possible with the technology already in our hands.
                  </p>
                </div>
              </div>
              
              {/* Context Engineering Philosophy */}
              <div className="glass-dark rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 md:mb-12 text-center">
                  <span className="text-gradient">Context as Product</span>
                </h3>
                <div className="prose prose-lg md:prose-xl lg:prose-2xl prose-invert max-w-none text-center">
                  <p className="text-white/90 leading-relaxed mb-8 md:mb-12">
                    Most software still treats context as a static backdrop. <em>We treat it as the product.</em>
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    Our context-engineering continuously fuses implicit and explicit signals — text tone, 
                    scroll patterns, referrer data, metadata, behavioral traces — to generate real-time 
                    personalized experiences that understand <strong>who's there, why they're there, 
                    and what moves the needle next.</strong>
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* Technical Deep Dive Section */}
        <section id="video-section" className="py-40 md:py-48 lg:py-56 px-6 sm:px-8 lg:px-12 xl:px-16 bg-black relative mystical-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24 md:mb-32">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-12 md:mb-16">
                <span className="mystical-gradient-text">How It Works</span>
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-5xl mx-auto leading-relaxed">
                Context-engineering that doesn't just react — it understands, learns, and evolves.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 mb-20 md:mb-32">
              {/* Front-end Applications */}
              <div className="glass-dark rounded-3xl p-8 md:p-12 border border-white/10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 text-cyan-300">
                  Front-End Intelligence
                </h3>
                <ul className="space-y-4 md:space-y-6 text-white/80 text-lg md:text-xl">
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 text-2xl">•</span>
                    <span>Ad-supported publishers with adaptive widgets</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 text-2xl">•</span>
                    <span>E-commerce sites with intelligent chat layers</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 text-2xl">•</span>
                    <span>In-page concierges that raise engagement</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-cyan-400 text-2xl">•</span>
                    <span>Real-time conversion optimization</span>
                  </li>
                </ul>
              </div>
              
              {/* Back-end Systems */}
              <div className="glass-dark rounded-3xl p-8 md:p-12 border border-white/10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 text-purple-300">
                  Enterprise Integration
                </h3>
                <ul className="space-y-4 md:space-y-6 text-white/80 text-lg md:text-xl">
                  <li className="flex items-start gap-4">
                    <span className="text-purple-400 text-2xl">•</span>
                    <span>Slack threads that understand intent</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-400 text-2xl">•</span>
                    <span>Notion docs with responsive surfaces</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-400 text-2xl">•</span>
                    <span>Dashboards that translate human needs</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-400 text-2xl">•</span>
                    <span>Local learning with secure context storage</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Video Placeholder */}
            <div className="video-border max-w-5xl mx-auto">
              <div className="bg-black/80 rounded-xl aspect-video flex items-center justify-center border border-purple-500/30 backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/50 mystical-glow">
                      <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-cyan-300 mystical-glow">Demo Video Placeholder</p>
                  <p className="text-sm text-purple-300 mt-2">Context-engineering in action</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bridging Section - New Interactive Ecosystem */}
        <section className="py-48 md:py-56 lg:py-64 px-6 sm:px-8 lg:px-12 xl:px-16 relative bg-black mystical-bg">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-32 md:mb-40">
              <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-12 md:mb-16">
                <span className="mystical-gradient-text">Bridging to post-scarcity.</span>
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/70 max-w-5xl mx-auto leading-relaxed">
                From fragmented digital chaos to unified, intelligent harmony.
              </p>
            </div>

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
            <div className="mt-24 md:mt-32 text-center max-w-5xl mx-auto">
              <p className="text-xl md:text-2xl lg:text-3xl text-cyan-300 font-medium leading-relaxed mystical-glow mb-8">
                From scattered focus to unified consciousness.
              </p>
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed">
                Salience bridges your fragmented digital life into harmonious flow.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-32 md:mt-40 lg:mt-48 text-center space-y-12 md:space-y-16">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                Ready to explore deeper?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto">
                <a href="/cross-the-bridge" className="group">
                  <Button 
                    size="lg"
                    className="rounded-2xl px-8 py-8 md:px-10 md:py-10 text-lg md:text-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 mystical-glow"
                  >
                    <span className="text-3xl">🌉</span>
                    <span className="font-semibold">Cross the Bridge</span>
                  </Button>
                </a>
                <a href="/heavens-gate" className="group">
                  <Button 
                    size="lg"
                    className="rounded-2xl px-8 py-8 md:px-10 md:py-10 text-lg md:text-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 mystical-glow"
                  >
                    <span className="text-3xl">🌌</span>
                    <span className="font-semibold">Heaven's Gate?</span>
                  </Button>
                </a>
                <a href="/chat-analysis" className="group">
                  <Button 
                    size="lg"
                    className="rounded-2xl px-8 py-8 md:px-10 md:py-10 text-lg md:text-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 mystical-glow"
                  >
                    <span className="text-3xl">🔍</span>
                    <span className="font-semibold">try anal?</span>
                  </Button>
                </a>
                <a href="/cognition-covenance" className="group">
                  <Button 
                    size="lg"
                    className="rounded-2xl px-8 py-8 md:px-10 md:py-10 text-lg md:text-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 mystical-glow"
                  >
                    <span className="text-3xl">🧠</span>
                    <span className="font-semibold">Cognition Coven</span>
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