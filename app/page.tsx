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
  Home,
  Scale,
  Heart,
  ChevronLeft,
  ChevronRight,
  SmilePlus,
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import ProcessSection from '@/components/process-section';
import FooterSpotlight from '@/components/footer-spotlight';
import { MiniChat } from '@/components/mini-chat';
import WordOrbit, { type WordOrbitLogo } from '@/components/insurance/word-orbit';
import {
  ClipboardList,
  MessageCircle,
  Smartphone,
} from 'lucide-react';

const HERO_CAPTURE_LOGOS: WordOrbitLogo[] = [
  { label: 'Phone',    src: '/insurance/logos/logos-ringcentral.png',     icon: Phone },
  { label: 'Email',    src: '/insurance/logos/logos-gmail.png',           icon: Mail },
  { label: 'Web Form', src: '/insurance/logos/logos-typeform.png',        icon: ClipboardList },
  { label: 'SMS',      src: '/insurance/logos/logos-twilio.png',          icon: MessageCircle },
];

const HERO_COORDINATE_LOGOS: WordOrbitLogo[] = [
  { label: 'Calendar', src: '/insurance/logos/logos-google-calendar.png', icon: CalendarCheck },
  { label: 'Outlook',  src: '/insurance/logos/logos-outlook.png',         icon: Mail },
  { label: 'AMS',      src: '/insurance/logos/logos-hawksoft.png',        icon: Building2 },
  { label: 'CRM',      src: '/insurance/logos/logos-ezlynx.png',          icon: Users },
];

const HERO_COMPLETE_LOGOS: WordOrbitLogo[] = [
  { label: 'Forms',    src: '/insurance/logos/logos-acord.png',           icon: FileText },
  { label: 'Systems',  src: '/insurance/logos/logos-ams360.png',          icon: Building2 },
  { label: 'Delivery', src: '/insurance/logos/logos-gmail.png',           icon: Mail },
  { label: 'Signal',   src: '/insurance/logos/logos-twilio.png',          icon: Smartphone },
];

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
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
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
          <span className="text-xl md:text-2xl font-bold text-slate-800 counter-value">
            {isVisible ? value : 0}{max === 100 ? '%' : ''}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-3 text-center">{label}</p>
    </div>
  );
}

/* ─── CTA Block ─── */
function CTABlock({ openCalendly }: { openCalendly: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={openCalendly} className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto cta-button text-lg px-8 py-6 rounded-xl font-semibold">
            <CalendarCheck className="mr-2 w-5 h-5" />
            Book a Free Consultation
          </Button>
        </button>
        <Link href="/i-want-my-time-and-energy-back" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto cta-outline text-lg px-8 py-6 rounded-xl font-semibold">
            <MessageSquare className="mr-2 w-5 h-5" />
            Ask Our AI How You&apos;d Get Value
          </Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400 text-sm">
        <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
          <PhoneCall className="w-4 h-4" />
          <span>+1 (408) 718-0712</span>
        </a>
        <span className="hidden sm:block text-slate-300">|</span>
        <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
          <Mail className="w-4 h-4" />
          <span>aqeel@aqeelali.com</span>
        </a>
      </div>
    </div>
  );
}

/* ─── Industry Carousel ─── */
interface IndustryItem {
  icon: React.ElementType;
  title: string;
  shortLabel: string;
  description: string;
  benefit: string;
  href: string;
  image: string;
}

function IndustryCarousel({ items }: { items: IndustryItem[] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.length;

  const goto = useCallback((i: number) => {
    setActive(((i % total) + total) % total);
  }, [total]);

  // Auto-rotate every 6s
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, total]);

  const handleNav = (dir: number) => {
    goto(active + dir);
    // Pause then resume auto-rotate
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleStepClick = (i: number) => {
    goto(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const item = items[active];
  const Icon = item.icon;

  return (
    <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 scroll-reveal">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            <span className="text-slate-900">Who We Help</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            If your team spends hours every week on calls, forms, and follow-ups, we can automate a significant portion within a month.
          </p>
        </div>

        {/* Carousel card */}
        <div
          className="relative rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
            {/* Image half */}
            <div className="relative h-[260px] lg:h-auto bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">
              <Image
                key={item.image}
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Gradient overlay for text legibility on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent lg:hidden" />
            </div>

            {/* Content half */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {active + 1} / {total}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                {item.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed mb-6">
                {item.description}
              </p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all"
              >
                {item.benefit}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => handleNav(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNav(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicators — 6 dashed segments with labels */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.title}
                onClick={() => handleStepClick(i)}
                className="flex-1 group flex flex-col items-center gap-2"
              >
                {/* Dashed/solid line */}
                <div className="w-full h-1 rounded-full relative overflow-hidden">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      i === active
                        ? 'bg-blue-600'
                        : i < active
                          ? 'bg-blue-300'
                          : 'bg-slate-200'
                    }`}
                    style={i !== active ? {
                      backgroundImage: i < active ? 'none' : 'repeating-linear-gradient(90deg, #cbd5e1 0px, #cbd5e1 6px, transparent 6px, transparent 12px)',
                      backgroundColor: i < active ? undefined : 'transparent',
                    } : undefined}
                  />
                  {/* Active fill animation */}
                  {i === active && !isPaused && (
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-400 rounded-full"
                      style={{
                        animation: 'carouselProgress 6s linear forwards',
                      }}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-[11px] font-medium transition-colors whitespace-nowrap ${
                    i === active
                      ? 'text-blue-700'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {it.shortLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes carouselProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════ */
/*  MAIN PAGE                                     */
/* ═══════════════════════════════════════════════ */
export default function HomePage() {
  useScrollReveal();
  const openCalendly = useCalendly();

  const whoWeHelp = [
    {
      icon: Shield,
      title: 'Insurance Brokers',
      shortLabel: 'Insurance',
      description: 'High-volume quote calls, multiple carrier forms, strict documentation requirements.',
      benefit: 'Automate intake forms and policy processing',
      href: '/services#insurance',
      image: '/industries/industries-insurance-brokers.jpg',
    },
    {
      icon: Stethoscope,
      title: 'Telehealth & Clinics',
      shortLabel: 'Telehealth',
      description: 'Patient intake, pharmacy coordination, consent forms, and follow-up scheduling across remote and in-person visits.',
      benefit: 'Capture and structure every patient interaction',
      href: '/services#healthcare',
      image: '/industries/industries-telehealth-clinics.jpg',
    },
    {
      icon: SmilePlus,
      title: 'Dentists',
      shortLabel: 'Dental',
      description: 'New patient intake, insurance verification, treatment plan documentation, and recall reminders.',
      benefit: 'Streamline patient onboarding and insurance',
      href: '/services#healthcare',
      image: '/industries/industries-dentists.jpg',
    },
    {
      icon: Home,
      title: 'Real Estate',
      shortLabel: 'Real Estate',
      description: 'Property inquiries, showing coordination, document management across listings.',
      benefit: 'Organize leads and automate follow-ups',
      href: '/services#real-estate',
      image: '/industries/industries-real-estate.jpg',
    },
    {
      icon: Scale,
      title: 'Law Offices',
      shortLabel: 'Legal',
      description: 'Complex intake, government forms, documentation of every client touchpoint.',
      benefit: 'Auto-fill legal forms from call transcripts',
      href: '/services#insurance',
      image: '/industries/industries-law-offices.jpg',
    },
    {
      icon: Building2,
      title: 'Professional Services',
      shortLabel: 'Professional',
      description: 'Client onboarding, document collection, and routine communications.',
      benefit: 'Reduce admin overhead by 85%',
      href: '/services',
      image: '/industries/industries-professional-services.jpg',
    },
  ];

  const threePillars = [
    {
      icon: PhoneCall,
      title: 'Capture & Intake',
      description: 'Clients call or text your number. We record, transcribe, and extract structured data automatically.',
      examples: ['New client calls → details captured and structured', 'Text/email inquiries → parsed into actionable fields', 'Voice notes → transcribed and filed'],
    },
    {
      icon: CalendarCheck,
      title: 'Schedule & Coordinate',
      description: 'We coordinate times, send reminders, and surface critical messages so nothing falls through.',
      examples: ['Automatic appointment reminders via text', 'Smart rescheduling and waitlist management', 'Critical message alerts surfaced immediately'],
    },
    {
      icon: FileText,
      title: 'Forms & Documents',
      description: 'We pre-fill your PDFs and forms from call and text transcripts. One conversation fills 5+ forms.',
      examples: ['Pre-fill insurance applications from intake calls', 'Generate consent forms with patient details', 'Populate government/legal documents automatically'],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip bg-white min-h-screen">

        {/* ============================================ */}
        {/* HERO — WordOrbit tagline                    */}
        {/* ============================================ */}
        <section className="relative flex flex-col items-center px-4 sm:px-8 lg:px-16 pt-32 md:pt-48 pb-32 md:pb-48 overflow-hidden">
          {/* Soft gradient wash */}
          <div className="absolute top-0 left-0 right-0 h-[900px] bg-gradient-to-b from-blue-50/80 via-blue-50/20 to-transparent pointer-events-none" />
          <div className="absolute top-40 left-1/4 w-[32rem] h-[32rem] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-80 right-1/4 w-[28rem] h-[28rem] bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-16 scroll-reveal">
              <Sparkles className="w-4 h-4" />
              <span>Custom AI systems for service businesses</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.05] mb-16 scroll-reveal stagger-1">
              <span className="block text-slate-400 font-medium text-2xl sm:text-3xl md:text-4xl mb-16">
                One system to
              </span>
              <span className="block py-16 md:py-24">
                <WordOrbit
                  word="capture"
                  logos={HERO_CAPTURE_LOGOS}
                  gradient="blue-gradient-text"
                />
              </span>
              <span className="block py-16 md:py-24">
                <WordOrbit
                  word="coordinate"
                  logos={HERO_COORDINATE_LOGOS}
                  gradient="text-amber-600"
                />
              </span>
              <span className="block py-16 md:py-24">
                <WordOrbit
                  word="& complete."
                  logos={HERO_COMPLETE_LOGOS}
                  gradient="blue-gradient-text"
                />
              </span>
            </h1>

            <div className="scroll-reveal stagger-3 mt-20">
              <CTABlock openCalendly={openCalendly} />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* HERO SUBTEXT — moved out of the hero         */}
        {/* ============================================ */}
        <section className="py-24 md:py-40 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white via-slate-50/60 to-white">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-5">
              What we actually do
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
              Stop drowning in{' '}
              <span className="blue-gradient-text">calls, forms &amp; follow-ups.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-3xl mx-auto">
              We build custom AI admin systems that capture your client
              interactions, turn them into structured data, and automatically
              fill your forms and workflows — so your team can focus on real
              work, not paperwork.
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* SOCIAL PROOF BAR                             */}
        {/* ============================================ */}
        <section className="py-10 px-4 border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '400%', label: 'Productivity Gains' },
                { value: '30 days', label: 'To First Results' },
                { value: '85%', label: 'Less Admin Work' },
                { value: '5+ forms', label: 'Filled Per Intake' },
              ].map((stat) => (
                <div key={stat.label} className="scroll-reveal">
                  <p className="text-2xl md:text-3xl font-bold text-blue-700">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* THREE PILLARS — What We Do                  */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                <span className="text-slate-900">Three things we do for you</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Every service business has the same core bottlenecks. We automate all three.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {threePillars.map((pillar, index) => (
                <div key={pillar.title} className={`scroll-reveal stagger-${index + 1}`}>
                  <div className="value-card p-8 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                      <pillar.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                    <p className="text-slate-500 mb-5 leading-relaxed">{pillar.description}</p>
                    <ul className="space-y-2.5">
                      {pillar.examples.map((example) => (
                        <li key={example} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CHATBOT PROMPT — Pre-consult AI              */}
        {/* ============================================ */}
        <section className="py-16 md:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
          <div className="max-w-4xl mx-auto">
            <div className="scroll-reveal">
              <div className="rounded-2xl border border-blue-200 bg-white p-8 md:p-10 text-center shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 text-sm font-medium">AI Pre-Consultation</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  Ask our AI how you&apos;d get value
                </h2>
                <p className="text-slate-500 text-base md:text-lg mb-6 max-w-xl mx-auto leading-relaxed">
                  Tell it about your workflows and it will outline concrete ways we can help — in under 2 minutes. No commitment required.
                </p>

                <button onClick={openCalendly} className="mb-6">
                  <Button variant="outline" size="lg" className="cta-outline text-base px-6 py-4 rounded-xl font-semibold">
                    <CalendarCheck className="mr-2 w-4 h-4" />
                    Or Book a Call Directly
                  </Button>
                </button>
              </div>

              {/* Mini chat — same backend as /i-want-my-time-and-energy-back */}
              <div className="mt-6">
                <MiniChat />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* VALUE PROPS — Why Salience                  */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                <span className="text-slate-900">Save </span>
                <span className="gold-accent">Money</span>
                <span className="text-slate-900"> and </span>
                <span className="gold-accent">Time</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Measurable outcomes within 30 days of your pilot
              </p>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-20">
              <div className="scroll-reveal stagger-1">
                <AnimatedGauge value={90} max={100} label="Productivity Increase" color="#2563eb" icon={TrendingUp} />
              </div>
              <div className="scroll-reveal stagger-2">
                <AnimatedGauge value={42} max={100} label="Cost Savings" color="#10b981" icon={Timer} />
              </div>
              <div className="scroll-reveal stagger-3">
                <AnimatedGauge value={85} max={100} label="Admin Tasks Automated" color="#06b6d4" icon={Bot} />
              </div>
              <div className="scroll-reveal stagger-4">
                <AnimatedGauge value={73} max={100} label="Faster Processing" color="#7c3aed" icon={Zap} />
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="scroll-reveal stagger-1">
                <div className="value-card p-7 h-full">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Costs Less Than a New Hire</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    No salary, benefits, onboarding, or training. An always-on workforce at a fraction of what a single VA would run you.
                  </p>
                </div>
              </div>
              <div className="scroll-reveal stagger-2">
                <div className="value-card p-7 h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                    <BrainCircuit className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Multiplies Your Output</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Intake, follow-ups, scheduling, document processing — handled in parallel, 24/7. Your team focuses on high-value work.
                  </p>
                </div>
              </div>
              <div className="scroll-reveal stagger-3">
                <div className="value-card p-7 h-full">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Less Cognitive Load</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    One source of truth. No more juggling tools and logins. The system tracks and maintains everything so you don&apos;t have to.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHO WE HELP — Industry Carousel             */}
        {/* ============================================ */}
        <IndustryCarousel items={whoWeHelp} />

        {/* ============================================ */}
        {/* CTA — Primary Conversion                    */}
        {/* ============================================ */}
        <section className="py-16 md:py-24 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-3xl mx-auto">
            <div className="scroll-reveal">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative px-8 py-14 md:px-14 md:py-20 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Free to start</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                    See what&apos;s possible.
                  </h2>
                  <p className="text-white/80 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                    Book a quick call. We&apos;ll map your workflow, show you where AI creates leverage, and give you a clear picture — no strings attached.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={openCalendly}>
                      <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl font-semibold shadow-lg">
                        <CalendarCheck className="mr-2 w-5 h-5" />
                        Book a Free Consultation
                      </Button>
                    </button>
                    <a href="sms:+14087180712?body=Hi, I want to learn more about Salience">
                      <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                        <MessageSquare className="mr-2 w-5 h-5" />
                        Text Us
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CONSULTATION — What You Get                 */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                <span className="text-slate-900">Free Workflow Consultation</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                We start with a quick overview of your current operations. We&apos;ll show you exactly where AI creates leverage — and how you get value that feels at least 5x what we&apos;d charge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
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
                  desc: 'A clear picture of cost savings, time recovered, and revenue potential — before you spend a dollar.',
                },
              ].map((item, i) => (
                <div key={item.title} className={`scroll-reveal stagger-${i + 1}`}>
                  <div className="value-card p-7 h-full">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
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
        {/* OUR PROCESS — Scroll-driven phases           */}
        {/* ============================================ */}
        <ProcessSection />

        {/* ============================================ */}
        {/* FINAL CTA                                   */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="scroll-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                <span className="text-slate-900">Ready to Get Your </span>
                <span className="gold-accent">Time</span>
                <span className="text-slate-900"> Back?</span>
              </h2>
              <p className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                We&apos;ll audit your workflow, identify the bottlenecks, and deploy AI exactly where it matters. You keep full control — always.
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
