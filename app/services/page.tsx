'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import {
  ArrowRight,
  Stethoscope,
  Home,
  Shield,
  Phone,
  FileText,
  CalendarCheck,
  MessageSquare,
  Bell,
  Layers,
} from 'lucide-react';

const VERTICALS = [
  {
    slug: 'insurance',
    label: 'Insurance',
    tagline: 'One system to quote, renew & retain.',
    description:
      'Agency management, email, phone, forms, and carrier intelligence — routed through one brain. 5-10× output at the same headcount.',
    icon: Shield,
    tone: 'from-amber-50 via-blue-50 to-white',
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    featured: true,
  },
  {
    slug: 'healthcare',
    label: 'Healthcare & Telehealth',
    tagline: 'From first call to follow-up.',
    description:
      'Voice-to-EMR, intake, insurance verification, scheduling, and patient communication — all automated without replacing your clinicians.',
    icon: Stethoscope,
    tone: 'from-emerald-50 via-blue-50 to-white',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    featured: false,
  },
  {
    slug: 'real-estate',
    label: 'Real Estate',
    tagline: 'Lead in, showing booked, contract filled.',
    description:
      'Every inquiry captured, every showing coordinated, every disclosure pre-filled — so you close more deals with less follow-up.',
    icon: Home,
    tone: 'from-blue-50 via-purple-50 to-white',
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
    featured: false,
  },
];

export default function ServicesPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="relative pt-32 md:pt-40 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-blue-50/70 to-white overflow-hidden">
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700 mb-8">
                <Layers className="w-4 h-4" />
                <span>Our Services</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Custom AI admin{' '}
                <span className="blue-gradient-text">systems.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                We don&apos;t sell generic SaaS. We learn your process, map your
                intakes, forms, and follow-ups, and build a tailored system that
                feels like it was designed for your business from day one.
              </p>
            </div>
          </div>
        </section>

        {/* ── Vertical picker (insurance featured) ── */}
        <section className="py-20 md:py-28 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Featured: Insurance — full-width */}
            {VERTICALS.filter((v) => v.featured).map((v) => (
              <Link
                key={v.slug}
                href={`/services/${v.slug}`}
                className="group block scroll-reveal"
              >
                <div className={`relative rounded-3xl bg-gradient-to-br ${v.tone} border border-slate-200 overflow-hidden p-10 md:p-14 hover:shadow-xl transition-shadow`}>
                  <div className="absolute top-0 right-0 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider mb-5 ${v.accent}`}>
                        <v.icon className="w-3.5 h-3.5" />
                        <span>Featured · {v.label}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
                        {v.tagline}
                      </h2>
                      <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                        {v.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button className="cta-button px-7 py-5 text-base font-semibold rounded-xl group-hover:translate-x-0.5 transition-transform">
                        Explore Insurance
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Other verticals: compact grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VERTICALS.filter((v) => !v.featured).map((v) => (
                <Link
                  key={v.slug}
                  href={`/services/${v.slug}`}
                  className="group block scroll-reveal"
                >
                  <div className={`h-full rounded-2xl bg-gradient-to-br ${v.tone} border border-slate-200 p-8 hover:shadow-lg transition-shadow`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-5 ${v.accent}`}>
                      <v.icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {v.label}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight">
                      {v.tagline}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5">
                      {v.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 group-hover:gap-2.5 transition-all">
                      Explore
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Every Client Gets ── */}
        <section className="py-20 md:py-28 px-4 sm:px-8 lg:px-16 border-t border-slate-100 bg-slate-50/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                What every client gets
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Regardless of your industry, our systems handle the same core
                admin burdens.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Phone,         title: 'Call & Text Capture', desc: 'Every client interaction recorded, transcribed, and structured automatically.' },
                { icon: FileText,      title: 'Auto Form-Filling',    desc: 'One intake conversation fills 5+ PDFs and forms. No more retyping.' },
                { icon: CalendarCheck, title: 'Smart Scheduling',     desc: 'Coordinate times, send reminders, manage waitlists without manual effort.' },
                { icon: Bell,          title: 'Critical Alerts',      desc: 'Important messages surface immediately. Nothing falls through the cracks.' },
              ].map((item, i) => (
                <div key={item.title} className={`scroll-reveal stagger-${(i % 4) + 1}`}>
                  <div className="value-card p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Ready to see what we can build for you?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Every system is custom-built for your business. Start with a free
              consultation and we&apos;ll map exactly where AI creates the most value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=I'd like a free consultation">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg">
                  Book Free Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
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
