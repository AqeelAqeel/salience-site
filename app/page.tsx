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
  MessageSquare,
  PhoneCall,
  CalendarCheck,
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import ProcessSection from '@/components/process-section';
import FooterSpotlight from '@/components/footer-spotlight';

/* ─── Scroll Reveal Hook ─── */
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

/* ─── Calendly Loader ─── */
function useCalendly() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src*="calendly"]')) {
      setLoaded(true);
      return;
    }
    // CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // JS
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  const openCalendly = useCallback(() => {
    if (loaded && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/aqeelali/aa-30',
      });
    }
  }, [loaded]);

  return openCalendly;
}

/* ─── Narrative Line Component ─── */
function NarrativeLine({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Gauge ─── */
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
        <svg className="w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" className="circular-gauge-bg" />
          <circle
            cx="50" cy="50" r="45"
            style={{
              fill: 'none',
              stroke: color,
              strokeWidth: 8,
              strokeLinecap: 'round',
              strokeDasharray: circumference,
              strokeDashoffset: isVisible ? offset : circumference,
              transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
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

/* ─── Stats Counter ─── */
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

/* ─── CTA Block (reusable) ─── */
function CTABlock({ openCalendly }: { openCalendly: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={openCalendly}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto cta-button text-lg px-8 py-6 rounded-xl font-semibold">
            <CalendarCheck className="mr-2 w-5 h-5" />
            Book a Free Consultation
          </Button>
        </button>
        <a
          href="sms:+14087180712?body=Hi, I want to learn more about Salience"
          className="w-full sm:w-auto"
        >
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-white/20 text-white hover:bg-white/10">
            <MessageSquare className="mr-2 w-5 h-5" />
            Text Us
          </Button>
        </a>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/40 text-sm">
        <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <PhoneCall className="w-4 h-4" />
          <span>+1 (408) 718-0712</span>
        </a>
        <span className="hidden sm:block text-white/20">|</span>
        <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <Mail className="w-4 h-4" />
          <span>aqeel@aqeelali.com</span>
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  MAIN PAGE                                     */
/* ═══════════════════════════════════════════════ */
export default function HomePage() {
  useScrollReveal();
  const openCalendly = useCalendly();

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
      <main className="relative overflow-x-clip bg-[#0a0a0a] min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/20 via-transparent to-transparent" />

        {/* ============================================ */}
        {/* HERO — "Solutions Without Sacrifice"         */}
        {/* ============================================ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 relative pt-20 md:pt-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl" />
          </div>
          <div className="absolute top-32 left-10 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 max-w-5xl mx-auto w-full text-center top-light-effect">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8 scroll-reveal">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Consulting &middot; AI Automation &middot; Project Development</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight hero-text-glow scroll-reveal stagger-1">
              <span className="hero-gradient-text">Solutions</span>
              <br />
              <span className="text-white">Without Sacrifice</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 mb-16 max-w-2xl mx-auto scroll-reveal stagger-2 leading-relaxed">
              AI that works under your directives. Assessing, interpreting, recommending, and executing—so you don&apos;t have to.
            </p>

            <div className="scroll-reveal stagger-3">
              <CTABlock openCalendly={openCalendly} />
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-scroll" />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* NARRATIVE — Storytelling Buildup             */}
        {/* ============================================ */}
        <section className="py-24 md:py-40 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-3xl mx-auto">
            {/* Line 1 */}
            <NarrativeLine className="mb-20 md:mb-28">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 leading-snug tracking-tight">
                Your automations turn <span className="text-amber-400">manual chaos</span> into <span className="text-emerald-400">finished output</span>.
              </p>
            </NarrativeLine>

            {/* Line 2 */}
            <NarrativeLine className="mb-20 md:mb-28" delay={0.1}>
              <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-xl">
                Real-time. Assessing every signal. Interpreting context. Recommending next moves.
                Executing tasks—under <span className="text-white/80 font-medium">your</span> directives.
              </p>
            </NarrativeLine>

            {/* Line 3 */}
            <NarrativeLine className="mb-20 md:mb-28" delay={0.1}>
              <div className="pl-6 border-l-2 border-amber-500/30">
                <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                  Full reports on every decision made. Possible insights surfaced before you ask.
                  <span className="text-white/70 font-medium"> Nothing happens without your visibility.</span>
                </p>
              </div>
            </NarrativeLine>

            {/* The punchline buildup */}
            <NarrativeLine className="mb-12 md:mb-16" delay={0.1}>
              <div className="relative py-12 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent rounded-3xl" />
                <p className="text-xl md:text-2xl lg:text-3xl text-white/30 italic text-center leading-relaxed relative">
                  &ldquo;Yeah, yeah, AI&apos;s gonna take all our jobs.&rdquo;
                </p>
              </div>
            </NarrativeLine>

            <NarrativeLine className="mb-20 md:mb-28" delay={0.1}>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-center tracking-tight">
                <span className="text-white">But why do you</span>{' '}
                <span className="hero-gradient-text">work more than ever?</span>
              </p>
            </NarrativeLine>

            {/* The answer */}
            <NarrativeLine delay={0.1}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  <span className="text-white/40">It&apos;s AI,</span>{' '}
                  <span className="hero-gradient-text">applied for you.</span>
                </p>
                <p className="text-base md:text-lg text-white/40 max-w-lg mx-auto">
                  Consulting meets engineering. We don&apos;t just advise—we build, deploy, and run AI that actually does the work.
                </p>
              </div>
            </NarrativeLine>
          </div>
        </section>

        {/* ============================================ */}
        {/* CTA — Primary Conversion                    */}
        {/* ============================================ */}
        <section className="py-16 md:py-24 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-3xl mx-auto">
            <div className="scroll-reveal">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
                <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />
                <div className="relative px-8 py-14 md:px-14 md:py-20 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Free to start</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                    <span className="text-white">See what&apos;s possible.</span>
                  </h2>
                  <p className="text-white/50 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                    Book a quick call. We&apos;ll map your workflow, show you where AI creates leverage, and give you a clear picture—no strings attached.
                  </p>
                  <CTABlock openCalendly={openCalendly} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* TEAM — "With You Every Step"                 */}
        {/* ============================================ */}
        <section className="py-24 md:py-36 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                <span className="text-white">Our team&apos;s with you</span>
                <br />
                <span className="section-gradient-text">every step of the way</span>
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                We start with a <span className="text-white/80 font-medium">pro bono consultation</span>—a quick overview and assessment of your current operations. We&apos;ll show you exactly how you get value that feels at least <span className="text-amber-400 font-semibold">5x+ what we&apos;d end up charging</span>.
              </p>
            </div>

            {/* What the consultation covers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {[
                {
                  icon: FileText,
                  title: 'Workflow Audit',
                  desc: 'We map your current processes and identify exactly where time and money leak.',
                },
                {
                  icon: Target,
                  title: 'Opportunity Map',
                  desc: 'Concrete leverage points where AI creates outsized value for your specific operation.',
                },
                {
                  icon: BarChart3,
                  title: 'ROI Preview',
                  desc: 'A clear picture of cost savings, time recovered, and revenue potential—before you spend a dollar.',
                },
              ].map((item, i) => (
                <div key={item.title} className={`scroll-reveal stagger-${i + 1}`}>
                  <div className="value-card p-6 md:p-8 h-full">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                      <item.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="scroll-reveal text-center">
              <CTABlock openCalendly={openCalendly} />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* "RUN YOUR PRACTICE LIKE 10 VERSIONS OF YOU" */}
        {/* ============================================ */}
        <section className="py-24 md:py-36 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 hero-text-glow">
                <span className="text-white">Run Your Practice Like You Have</span>
                <br />
                <span className="hero-gradient-text">10 Versions of Yourself</span>
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                Measurable outcomes from day one—not vaporware demos
              </p>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-20">
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

            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-14">
              <div className="scroll-reveal stagger-1">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Costs Less Than a New Hire</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    No salary, benefits, onboarding, or training costs. An always-on workforce at a fraction of what a single VA would run you.
                  </p>
                </div>
              </div>
              <div className="scroll-reveal stagger-2">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                    <BrainCircuit className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Multiples the Output</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    AI doesn&apos;t take breaks, call in sick, or drop the ball. Intake, follow-ups, scheduling, document processing—handled in parallel, 24/7.
                  </p>
                </div>
              </div>
              <div className="scroll-reveal stagger-3">
                <div className="value-card p-6 md:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Kills Management Overhead</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    No 1-on-1s, no performance reviews, no re-training. Turnaround times collapse from days to minutes. You manage a dashboard, not people.
                  </p>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {industries.map((industry, index) => (
                <div key={industry.title} className={`industry-card group scroll-reveal stagger-${index + 1}`}>
                  <div className="p-6 md:p-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                      <industry.icon className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{industry.title}</h3>
                    <p className="text-white/50 mb-4">{industry.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-medium">{industry.stats}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-base text-amber-400/70 mt-14 italic scroll-reveal text-center">
              Soon the person you&apos;ll spend the most time with is your tax advisor
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* OUR PROCESS — Scroll-driven phases           */}
        {/* ============================================ */}
        <ProcessSection />

        {/* ============================================ */}
        {/* FINAL CTA                                   */}
        {/* ============================================ */}
        <section className="py-24 md:py-36 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                <span className="text-white">Ready to Get Your</span>
                <br />
                <span className="hero-gradient-text">Time Back?</span>
              </h2>
              <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                We&apos;ll audit your workflow, identify the bottlenecks, and deploy AI exactly where it matters. You keep full control—always.
              </p>
              <CTABlock openCalendly={openCalendly} />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FOOTER                                      */}
        {/* ============================================ */}
        <FooterSpotlight />
      </main>
    </>
  );
}
