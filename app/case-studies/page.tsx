'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  CalendarCheck,
  Timer,
  Database,
  Zap,
  BarChart3,
} from 'lucide-react';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function CaseStudiesPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="pt-32 pb-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-blue-50/80 to-white relative">
          <div className="absolute top-20 left-1/3 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700 mb-6">
                <BarChart3 className="w-4 h-4" />
                <span>Case Studies</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Real Results from{' '}
                <span className="blue-gradient-text">Real Businesses</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
                See how service businesses like yours have transformed their operations with custom AI admin systems.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* CASE STUDY: INSURANCE BROKERAGE           */}
        {/* ══════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="scroll-reveal mb-16">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6 md:px-12 md:py-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-white" />
                    <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Insurance Brokerage</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Commercial Insurance Agency
                  </h2>
                  <p className="text-white/80 text-base md:text-lg max-w-2xl">
                    How a mid-size insurance brokerage cut intake time by 70% and eliminated form-filling bottlenecks with a custom AI system.
                  </p>
                </div>
              </div>
            </div>

            {/* The Challenge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
              <div className="scroll-reveal-left">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">The Challenge</h3>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">
                  Drowning in paperwork, losing clients to slow follow-up
                </h4>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  This commercial insurance brokerage was processing 50+ quote requests per week, each requiring 5-6 different carrier forms. Staff spent the majority of their day re-entering the same client data across multiple systems. Follow-up delays were costing them new business, and the cognitive load on the team was unsustainable.
                </p>
                <div className="space-y-3">
                  {[
                    'Agents spending 60%+ of their day on manual data entry',
                    'Average 3-day turnaround on new quote requests',
                    'Missed follow-ups leading to lost clients',
                    'Information scattered across 4+ different tools and systems',
                    'Staff burnout from repetitive admin work',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="scroll-reveal-right">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">The Solution</h3>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">
                  Async AI intake with 24/7 client assistance
                </h4>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  We built a custom async intake system where clients fill out a tailored form with 24/7 AI assistance for FAQs and common questions. The AI handles clarification and probing, while escalations route to the company&apos;s operated cell line. All data flows into a single source of truth.
                </p>
                <div className="space-y-3">
                  {[
                    'Custom intake form with AI-powered guidance for clients',
                    '24/7 AI assistant handles FAQs and qualification questions',
                    'Escalation routing to the brokerage\'s direct cell line',
                    'Automatic form population across all carrier applications',
                    'Unified dashboard as single source of truth',
                    'Time-based tracking for every client interaction',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="scroll-reveal mb-20">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 md:p-12">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-8 text-center">Results After 30 Days</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { icon: TrendingUp, value: '3x', label: 'Client Intake Throughput', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: FileText, value: '70%', label: 'Faster Form Processing', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: BrainCircuit, value: 'Less', label: 'Cognitive Load Reported', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: Database, value: '1', label: 'Source of Truth (not 4+)', color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Outcomes */}
            <div className="scroll-reveal mb-20">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Key Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: TrendingUp,
                    title: 'More Client Intake Throughput',
                    desc: 'The async system allowed clients to submit intake at any hour. The AI pre-qualified and probed for missing information, meaning agents received complete, actionable submissions.',
                  },
                  {
                    icon: FileText,
                    title: 'Faster Form-Filling',
                    desc: 'One intake submission now auto-populates all 5-6 carrier forms. What used to take 45 minutes of manual entry per client now happens in seconds.',
                  },
                  {
                    icon: BrainCircuit,
                    title: 'Reduced Cognitive Load',
                    desc: 'Staff reported significantly less mental fatigue. The system tracks and maintains everything in one source of truth, eliminating the need to context-switch between tools.',
                  },
                  {
                    icon: Zap,
                    title: 'Fewer Tools & Logins',
                    desc: 'The team went from juggling 4+ different systems to one unified dashboard. Less switching, less confusion, fewer dropped balls.',
                  },
                  {
                    icon: Timer,
                    title: 'Time-Based Tracking',
                    desc: 'Every client interaction is timestamped and tracked. The agency now has clear visibility into response times, processing speed, and staff productivity.',
                  },
                  {
                    icon: Users,
                    title: 'Better Client Experience',
                    desc: 'Clients get 24/7 AI assistance for common questions, immediate confirmation of their submissions, and faster turnaround on quotes.',
                  },
                ].map((outcome) => (
                  <div key={outcome.title} className="value-card p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <outcome.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">{outcome.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{outcome.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote / Testimonial placeholder */}
            <div className="scroll-reveal mb-20">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8 md:p-12 text-center">
                <p className="text-xl md:text-2xl text-slate-700 font-medium italic leading-relaxed max-w-3xl mx-auto">
                  &ldquo;The system just handles it. Our agents focus on selling now instead of typing the same name into six different forms. The AI intake catches things we used to miss on the phone.&rdquo;
                </p>
                <p className="text-slate-500 text-sm mt-6">
                  &mdash; Agency Principal, Commercial Insurance Brokerage
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Want results like these?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Every system is custom-built. Book a free consultation and we&apos;ll map your workflows, identify quick wins, and show you what&apos;s possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=I'd like results like the insurance case study">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg">
                  <CalendarCheck className="mr-2 w-5 h-5" />
                  Book Free Consultation
                </Button>
              </a>
              <Link href="/i-want-my-time-and-energy-back">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                  <MessageSquare className="mr-2 w-5 h-5" />
                  Chat with AI First
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <FooterSpotlight />
      </main>
    </>
  );
}
