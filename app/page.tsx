'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  FileText,
  Calendar,
  ClipboardCheck,
  Building2,
  Stethoscope,
  Shield,
  Zap,
  Bot,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Play,
  BarChart3,
  Timer,
  Target,
  Sparkles,
  DollarSign,
  Clock,
  Users,
  BrainCircuit,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/navbar';
import ProcessSection from '@/components/process-section';
import FooterSpotlight from '@/components/footer-spotlight';
import Image from 'next/image';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

function MobileCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextSlide();
    if (touchStart - touchEnd < -75) prevSlide();
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full">
      <div
        className="carousel-container rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="carousel-slide flex justify-center px-4">
              <div className="relative w-full max-w-md">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={800}
                  className="w-full h-auto rounded-2xl shadow-2xl optimized-image"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedGauge({ value, max, label, color, icon: Icon }: {
  value: number;
  max: number;
  label: string;
  color: string;
  icon: React.ElementType;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (gaugeRef.current) observer.observe(gaugeRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={gaugeRef} className="flex flex-col items-center">
      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="circular-gauge-bg" />
          <circle
            cx="50" cy="50" r="45"
            className={`circular-gauge-fill ${isVisible ? 'animated' : ''}`}
            style={{
              '--gauge-offset': offset,
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: isVisible ? offset : circumference,
              transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
            } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 md:w-6 md:h-6 mb-1" style={{ color }} />
          <span className="text-xl md:text-2xl font-bold text-white counter-value">
            {isVisible ? value : 0}{max === 100 ? '%' : ''}
          </span>
        </div>
      </div>
      <p className="text-sm text-white/60 mt-3 text-center">{label}</p>
    </div>
  );
}

function StatsCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isVisible) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));
      if (progress >= 1) { clearInterval(timer); setCount(end); }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={counterRef} className="text-center">
      <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-400 counter-value">
        {count}{suffix}
      </p>
      <p className="text-sm md:text-base text-white/60 mt-1">{label}</p>
    </div>
  );
}

export default function HomePage() {
  useScrollReveal();

  const mobileExamples = [
    { src: '/assets/CENTERED-main-mobile-example-1.png', alt: 'Insurance Mobile App - Multi-screen view' },
    { src: '/assets/example-mobile-1.png', alt: 'Health Information Mobile Interface' },
    { src: '/assets/example-mobile-2.png', alt: 'Appointment Booking Mobile App' },
    { src: '/assets/example-mobile-3.png', alt: 'Transaction Processing Mobile Interface' },
  ];

  const workflowSteps = [
    {
      icon: FileText,
      title: 'Workflow Audit',
      description: 'We map your entire operation to find the exact lever points where AI creates the biggest impact.',
      features: ['Process documentation', 'Bottleneck identification', 'ROI analysis per automation'],
    },
    {
      icon: Calendar,
      title: 'Targeted AI Deployment',
      description: 'AI agents deployed precisely where they matter—intake, follow-ups, scheduling, communications.',
      features: ['Custom-fit to your process', 'Gradual rollout option', 'Zero disruption to current ops'],
    },
    {
      icon: ClipboardCheck,
      title: 'Monitor & Control',
      description: 'Real-time dashboards show exactly what\'s happening. You approve, override, or adjust anytime.',
      features: ['Live activity feeds', 'One-click overrides', 'Full audit trails'],
    },
  ];

  const industries = [
    {
      icon: Shield,
      title: 'Insurance Agencies',
      description: 'Automate policy renewals, claims follow-ups, and client communications.',
      stats: '73% faster claims processing',
    },
    {
      icon: Stethoscope,
      title: 'Healthcare Practices',
      description: 'Patient intake, appointment scheduling, and insurance verification on autopilot.',
      stats: '60% reduction in no-shows',
    },
    {
      icon: Building2,
      title: 'Professional Services',
      description: 'Client onboarding, document collection, and routine follow-ups handled.',
      stats: '85% less admin overhead',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-[#0a0a0a] min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/20 via-transparent to-transparent" />

        {/* ============================================ */}
        {/* HERO */}
        {/* ============================================ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 relative pt-20 md:pt-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl" />
          </div>
          <div className="absolute top-32 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 max-w-5xl mx-auto w-full text-center top-light-effect">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8 scroll-reveal">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">AI-Powered Automation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight hero-text-glow scroll-reveal stagger-1">
              <span className="text-white">Run Your Practice Like You Have</span>
              <br />
              <span className="hero-gradient-text">10 Versions of Yourself</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/60 mb-4 max-w-3xl mx-auto scroll-reveal stagger-2">
              We audit your workflow, identify your <span className="text-amber-400">main lever points</span>, and deploy AI to resolve operational bottlenecks—while you stay in control with
              <span className="text-white"> real-time dashboards</span> and
              <span className="text-white"> full visibility</span>.
            </p>

            <p className="text-base md:text-lg text-amber-400/80 mb-12 italic scroll-reveal stagger-3">
              Soon the person you&apos;ll spend the most time with is your tax advisor
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 scroll-reveal stagger-4">
              <a
                href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back"
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto cta-button text-lg px-8 py-6 rounded-xl font-semibold">
                  I&apos;m Ready to Make More Money
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a
                href="sms:+14087180712?body=Hi, I want to learn more about automating my practice"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-white/20 text-white hover:bg-white/10">
                  <Phone className="mr-2 w-5 h-5" />
                  Text Us Now
                </Button>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 scroll-reveal stagger-5">
              <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span>aqeel@aqeelali.com</span>
              </a>
              <span className="hidden sm:block">|</span>
              <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Phone className="w-4 h-4" />
                <span>+1 (408) 718-0712</span>
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-scroll" />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* METRICS */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="section-gradient-text">Real Results. Real Impact.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Measurable outcomes from day one—not vaporware demos
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              <div className="scroll-reveal stagger-1">
                <AnimatedGauge value={90} max={100} label="Productivity Increase" color="#f59e0b" icon={TrendingUp} />
              </div>
              <div className="scroll-reveal stagger-2">
                <AnimatedGauge value={42} max={100} label="Cost Savings" color="#10b981" icon={Timer} />
              </div>
              <div className="scroll-reveal stagger-3">
                <AnimatedGauge value={85} max={100} label="Admin Tasks Automated" color="#06b6d4" icon={Bot} />
              </div>
              <div className="scroll-reveal stagger-4">
                <AnimatedGauge value={73} max={100} label="Faster Processing" color="#8b5cf6" icon={Zap} />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* HOW IT WORKS */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="section-gradient-text">How We Work</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Audit first. Deploy AI at your lever points. You stay in control.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className={`workflow-card group scroll-reveal stagger-${index + 1}`}>
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="p-6 md:p-8">
                    <step.icon className="w-12 h-12 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-white/60 mb-6">{step.description}</p>
                    <ul className="space-y-2">
                      {step.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 text-center scroll-reveal">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                <span className="text-4xl">🎯</span>
                <div className="text-left">
                  <p className="text-white font-semibold text-lg">The Result?</p>
                  <p className="text-white/70">Bottlenecks resolved. Operations running 24/7. Full visibility in your dashboard. You focus on growth.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* OUR PROCESS — Scroll-driven phases */}
        {/* ============================================ */}
        <ProcessSection />

        {/* ============================================ */}
        {/* DASHBOARD SHOWCASE */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-amber-900/5 to-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="section-gradient-text">Your Command Center</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Full visibility. Total control. Watch your AI workforce in action.
              </p>
            </div>

            <div className="relative scroll-reveal-scale">
              <div className="dashboard-preview max-w-5xl mx-auto">
                <Image
                  src="/assets/example-dashboard-1.webp"
                  alt="AI Dashboard - Product Sales Analytics"
                  width={1200}
                  height={800}
                  className="w-full h-auto optimized-image"
                  priority
                />
              </div>

              <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />

              <div className="hidden lg:block absolute top-1/4 -left-4 xl:-left-16 scroll-reveal-left">
                <div className="glass-dark px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Real-time Analytics</p>
                    <p className="text-white/50 text-xs">Track every metric</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute bottom-1/4 -right-4 xl:-right-16 scroll-reveal-right">
                <div className="glass-dark px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">AI Assistant</p>
                    <p className="text-white/50 text-xs">Always working for you</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline stats under dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="scroll-reveal stagger-1">
                <StatsCounter end={200} suffix="+" label="Daily Tasks Automated" />
              </div>
              <div className="scroll-reveal stagger-2">
                <StatsCounter end={440} suffix="$" label="Average Revenue/Day" />
              </div>
              <div className="scroll-reveal stagger-3">
                <StatsCounter end={25} suffix="+" label="Appointments Managed" />
              </div>
              <div className="scroll-reveal stagger-4">
                <StatsCounter end={98} suffix="%" label="Client Satisfaction" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INDUSTRIES */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="section-gradient-text">Built for Your Industry</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Tailored automation for the practices that need it most
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {industries.map((industry, index) => (
                <div key={industry.title} className={`industry-card group scroll-reveal stagger-${index + 1}`}>
                  <div className="p-6 md:p-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                      <industry.icon className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{industry.title}</h3>
                    <p className="text-white/60 mb-4">{industry.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-medium">{industry.stats}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* VALUE PROP — "LESS THAN A VA" */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-amber-900/5 to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-white">Less Than a VA.</span>
                <br />
                <span className="hero-gradient-text">Multiples the Output.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Forget hiring, training, and managing. Get more done for a fraction of the cost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* Card 1 — Cost */}
              <div className="scroll-reveal stagger-1">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Costs Less Than a New Hire</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    No salary, benefits, onboarding, or training costs. You get an always-on workforce at a fraction of what a single VA or employee would run you.
                  </p>
                </div>
              </div>

              {/* Card 2 — Output */}
              <div className="scroll-reveal stagger-2">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                    <BrainCircuit className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Multiples the Finished Tasks</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    AI doesn&apos;t take breaks, call in sick, or drop the ball. Intake, follow-ups, scheduling, document processing—handled in parallel, 24/7.
                  </p>
                </div>
              </div>

              {/* Card 3 — Overhead */}
              <div className="scroll-reveal stagger-3">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Kills Management Overhead</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    No 1-on-1s, no performance reviews, no re-training. Turnaround times collapse from days to minutes. You manage a dashboard, not people.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison strip */}
            <div className="scroll-reveal">
              <div className="comparison-strip rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  <div className="p-6 md:p-8 text-center">
                    <Users className="w-6 h-6 text-red-400/70 mx-auto mb-3" />
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">New Hire / VA</p>
                    <p className="text-white/70 text-2xl font-bold">$3,500<span className="text-sm font-normal text-white/40">/mo+</span></p>
                    <p className="text-white/40 text-xs mt-1">Training, ramp-up, turnover risk</p>
                  </div>
                  <div className="p-6 md:p-8 text-center relative">
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-b-lg hidden md:block">YOU ARE HERE</div>
                    <Zap className="w-6 h-6 text-amber-400 mx-auto mb-3" />
                    <p className="text-amber-400/70 text-xs uppercase tracking-wider mb-1">Salience AI</p>
                    <p className="text-amber-400 text-2xl font-bold">Fraction<span className="text-sm font-normal text-amber-400/50"> of the cost</span></p>
                    <p className="text-white/50 text-xs mt-1">Live in days, not months</p>
                  </div>
                  <div className="p-6 md:p-8 text-center">
                    <Target className="w-6 h-6 text-emerald-400/70 mx-auto mb-3" />
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your ROI</p>
                    <p className="text-emerald-400 text-2xl font-bold">5-10x<span className="text-sm font-normal text-emerald-400/50"> output</span></p>
                    <p className="text-white/40 text-xs mt-1">Reduced overhead & turnaround</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* MOBILE SHOWCASE */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="scroll-reveal-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-medium">Mobile-First Experience</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-white">Manage Everything</span>
                  <br />
                  <span className="section-gradient-text">From Your Phone</span>
                </h2>
                <p className="text-white/60 text-lg mb-8">
                  Whether you&apos;re in the office or on the go, stay connected to your automated workflows with our intuitive mobile interfaces.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Approve actions with a single tap',
                    'Get instant notifications on exceptions',
                    'Review client communications in real-time',
                    'Access analytics anywhere, anytime',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:aqeel@aqeelali.com?subject=I want to see a demo" className="inline-flex">
                  <Button className="cta-button px-6 py-3 rounded-lg font-medium">
                    <Play className="w-4 h-4 mr-2" />
                    Request a Demo
                  </Button>
                </a>
              </div>

              <div className="scroll-reveal-right">
                <MobileCarousel images={mobileExamples} />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FINAL CTA */}
        {/* ============================================ */}
        <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Ready to Get Your</span>
                <br />
                <span className="hero-gradient-text">Time Back?</span>
              </h2>
              <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
                We&apos;ll audit your workflow, identify the bottlenecks, and deploy AI exactly where it matters. You keep full control with real-time dashboards.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <a
                  href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto cta-button text-lg px-10 py-7 rounded-xl font-semibold">
                    I&apos;m Ready to Make More Money
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <a
                  href="sms:+14087180712?body=Hi, I want to learn more about automating my practice"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-xl border-white/20 text-white hover:bg-white/10">
                    <Phone className="mr-2 w-5 h-5" />
                    Text Us
                  </Button>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 mb-8">
                <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>aqeel@aqeelali.com</span>
                </a>
                <span className="hidden sm:block">|</span>
                <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+1 (408) 718-0712</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FOOTER — Spotlight wordmark */}
        {/* ============================================ */}
        <FooterSpotlight />
      </main>
    </>
  );
}
