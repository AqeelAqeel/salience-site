'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Brain, Target, MessageSquare, BarChart3, Layers } from 'lucide-react';
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
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-16 relative pt-16 -mt-16">

          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            {/* Giant H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-10 leading-tight">
              <span className="being-gradient-text">Being;</span>
              <span className="understood-gradient-text drop-shadow-2xl">Understood.</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/50 mb-16 md:mb-24 lg:mb-32">
              More Empathetic Systems.
            </p>

          </div>

        </section>

        {/* Solutions w/o Sacrifice Section */}
        <section className="py-24 md:py-40 lg:py-56 px-4 sm:px-8 lg:px-12 xl:px-16 relative">
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-10">
              <span className="mystical-gradient-text">Solutions w/o Sacrifice</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12 md:mb-16">
              Build empathetic, human-designed solutions. Everything that makes you, YOU, included.
            </p>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
              <div className="glass-dark p-5 md:p-8 text-center">
                <Zap className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">Dynamic UX</h3>
                <p className="text-xs md:text-sm text-white/60">Adapts in real-time</p>
              </div>
              <div className="glass-dark p-5 md:p-8 text-center">
                <BarChart3 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-purple-400" />
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">Higher Throughput</h3>
                <p className="text-xs md:text-sm text-white/60">Ship faster</p>
              </div>
              <div className="glass-dark p-5 md:p-8 text-center">
                <Brain className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-pink-400" />
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">Less Cognitive Load</h3>
                <p className="text-xs md:text-sm text-white/60">More signal</p>
              </div>
              <div className="glass-dark p-5 md:p-8 text-center">
                <Target className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-orange-400" />
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">KPIs Hit</h3>
                <p className="text-xs md:text-sm text-white/60">Systematically</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Grid Section */}
        <section className="py-20 md:py-32 lg:py-48 px-4 sm:px-8 lg:px-12 xl:px-16 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-12 md:mb-20 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="mystical-gradient-text">Our Ecosystem</span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-white/60 max-w-2xl mx-auto">
                Four interconnected experiences in human-computer symbiosis.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
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
              <a href="https://chaos.energy" target="_blank" rel="noopener noreferrer" className="app-tile bg-gradient-to-br from-pink-500 to-rose-500" data-label="chaos.energy" tabIndex={0}>
                <span className="app-name">chaos.energy</span>
              </a>
            </div>
          </div>
        </section>

        {/* Product Offerings Section */}
        <section className="py-20 md:py-40 lg:py-56 px-4 sm:px-8 lg:px-12 xl:px-16 relative mystical-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-10">
                <span className="mystical-gradient-text">What We Build</span>
              </h2>

              {/* Human Imagination Engine Wheel */}
              <div className="flex flex-col items-center mb-8 md:mb-12">
                <p className="text-sm md:text-base text-white/50 mb-6">Human imagination has never been the bottleneck.</p>

                <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px]">
                  {/* Rotating outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />

                  {/* Static wheel segments with labels */}
                  {['Inspiration', 'Ideation', 'Implementation', 'Insights'].map((label, i) => {
                    const angle = (i * 90 - 45) * (Math.PI / 180);
                    const radius = 70;
                    const mdRadius = 100;
                    return (
                      <div
                        key={label}
                        className="absolute text-[10px] md:text-xs font-medium text-white/70 whitespace-nowrap"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                        }}
                      >
                        <span className="hidden md:inline" style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * (mdRadius - radius)}px, ${Math.sin(angle) * (mdRadius - radius)}px)`,
                        }}>{label}</span>
                        <span className="md:hidden">{label}</span>
                      </div>
                    );
                  })}

                  {/* Arrows between segments */}
                  <svg className="absolute inset-0 w-full h-full animate-pulse-slow" viewBox="0 0 200 200">
                    <defs>
                      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="rgba(103, 232, 249, 0.6)" />
                      </marker>
                    </defs>
                    {/* Circular arrow path */}
                    <circle
                      cx="100"
                      cy="100"
                      r="50"
                      fill="none"
                      stroke="rgba(103, 232, 249, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      className="animate-spin-slow"
                      style={{ transformOrigin: 'center' }}
                    />
                  </svg>

                  {/* Center circle - Human Imagination */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <span className="text-lg md:text-2xl">🧠</span>
                      <p className="text-[8px] md:text-[10px] text-cyan-300 font-medium mt-1">Human<br/>Imagination</p>
                    </div>
                  </div>

                  {/* Rotating indicator dot */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-orbit" style={{ transformOrigin: '-48px center' }} />
                </div>
              </div>
            </div>

            <div className="space-y-8 md:space-y-16 lg:space-y-24">

              {/* Slack-Native Product Ops Orchestrator */}
              <div className="glass-dark rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 border border-white/10">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                  <a href="https://chaos.energy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                    <span className="text-xs md:text-sm uppercase tracking-wider font-medium">chaos.energy</span>
                  </a>
                </div>
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 text-white">
                  Product Ops Orchestrator
                </h3>
                <p className="text-sm md:text-lg text-white/70 mb-6 md:mb-8 max-w-3xl">
                  Turn scattered feedback + specs into shippable tickets and crisp decisions—directly in Slack.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-cyan-400">-40%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Decision Latency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">+20%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Ship Cadence</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-pink-400">-50%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">PM/Eng Chatter</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-orange-400">+25%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Spec Completeness</p>
                  </div>
                </div>
              </div>

              {/* Adaptive UX Engine */}
              <div className="glass-dark rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 border border-white/10">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <Layers className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  <span className="text-xs md:text-sm uppercase tracking-wider font-medium text-cyan-400">Adaptive Engine</span>
                </div>
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 text-white">
                  Adaptive UX Engine
                </h3>
                <p className="text-sm md:text-lg text-white/70 mb-6 md:mb-8 max-w-3xl">
                  Your front-end adapts in real time per user segment to maximize conversion, retention, and LTV.
                </p>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-cyan-400">+10%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Conversion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">-20%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Churn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-pink-400">+12%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">ARPU</p>
                  </div>
                </div>
              </div>

              {/* Ad Engagement Widgets */}
              <div className="glass-dark rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 border border-white/10">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                  <span className="text-xs md:text-sm uppercase tracking-wider font-medium text-orange-400">Publisher Tools</span>
                </div>
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 text-white">
                  Ad Engagement Widgets
                </h3>
                <p className="text-sm md:text-lg text-white/70 mb-6 md:mb-8 max-w-3xl">
                  Plug-in widgets that lift session depth and RPM without slowing pages.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-cyan-400">+20%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Pages/Session</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">+15%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Session Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-pink-400">+12%</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">RPM Lift</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-orange-400">&lt;50ms</p>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Overhead</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="video-section" className="py-20 md:py-40 lg:py-56 px-4 sm:px-8 lg:px-12 xl:px-16 bg-black relative mystical-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="mystical-gradient-text">How It Works</span>
              </h2>
              <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto">
                Context-engineering that understands, learns, and evolves.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12 md:mb-20">
              {/* Front-end Applications */}
              <div className="glass-dark rounded-2xl p-6 md:p-10 border border-white/10">
                <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-cyan-300">
                  Front-End Intelligence
                </h3>
                <ul className="space-y-3 text-white/70 text-sm md:text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Adaptive widgets for publishers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Intelligent chat layers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Real-time conversion optimization</span>
                  </li>
                </ul>
              </div>

              {/* Back-end Systems */}
              <div className="glass-dark rounded-2xl p-6 md:p-10 border border-white/10">
                <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-purple-300">
                  Enterprise Integration
                </h3>
                <ul className="space-y-3 text-white/70 text-sm md:text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <span>Slack threads that understand intent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <span>Responsive doc surfaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <span>Secure local learning</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="video-border max-w-4xl mx-auto">
              <div className="bg-black/80 rounded-xl aspect-video flex items-center justify-center border border-purple-500/30 backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/50 mystical-glow">
                      <div className="w-0 h-0 border-l-[16px] md:border-l-[20px] border-l-white border-t-[10px] md:border-t-[12px] border-t-transparent border-b-[10px] md:border-b-[12px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  <p className="text-sm md:text-base font-medium text-cyan-300 mystical-glow">Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bridging Section - New Interactive Ecosystem */}
        <section className="py-20 md:py-40 lg:py-56 px-4 sm:px-8 lg:px-12 xl:px-16 relative bg-black mystical-bg">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-24">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="mystical-gradient-text">Bridging to Post-Scarcity</span>
              </h2>
              <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto">
                From fragmented chaos to unified harmony.
              </p>
            </div>

            {/* Three-column layout with centered background logo */}
            <div className="relative">
              {/* Large Background Salience Logo - Positioned Behind Everything */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] opacity-10">
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
                  className="relative h-[280px] md:h-[400px] flex items-center justify-center"
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
                  className="relative h-[280px] md:h-[400px] flex items-center justify-center"
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
            <div className="mt-12 md:mt-20 text-center max-w-3xl mx-auto">
              <p className="text-sm md:text-lg text-cyan-300 font-medium mystical-glow">
                Scattered focus becomes unified consciousness.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-16 md:mt-28 lg:mt-40 text-center space-y-8 md:space-y-12">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                Explore Deeper
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                <a href="/cross-the-bridge" className="group">
                  <Button
                    size="lg"
                    className="rounded-xl px-4 py-6 md:px-6 md:py-8 text-sm md:text-base bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] w-full h-full min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 md:gap-3 mystical-glow"
                  >
                    <span className="text-2xl">🌉</span>
                    <span className="font-medium text-xs md:text-sm">Cross the Bridge</span>
                  </Button>
                </a>
                <a href="/heavens-gate" className="group">
                  <Button
                    size="lg"
                    className="rounded-xl px-4 py-6 md:px-6 md:py-8 text-sm md:text-base bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] w-full h-full min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 md:gap-3 mystical-glow"
                  >
                    <span className="text-2xl">🌌</span>
                    <span className="font-medium text-xs md:text-sm">Heaven's Gate?</span>
                  </Button>
                </a>
                <a href="/chat-analysis" className="group">
                  <Button
                    size="lg"
                    className="rounded-xl px-4 py-6 md:px-6 md:py-8 text-sm md:text-base bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] w-full h-full min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 md:gap-3 mystical-glow"
                  >
                    <span className="text-2xl">🔍</span>
                    <span className="font-medium text-xs md:text-sm">try anal?</span>
                  </Button>
                </a>
                <a href="/cognition-covenance" className="group">
                  <Button
                    size="lg"
                    className="rounded-xl px-4 py-6 md:px-6 md:py-8 text-sm md:text-base bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] w-full h-full min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 md:gap-3 mystical-glow"
                  >
                    <span className="text-2xl">🧠</span>
                    <span className="font-medium text-xs md:text-sm">Cognition Coven</span>
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