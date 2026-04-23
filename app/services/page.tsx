'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
import SalientHub from '@/components/insurance/salient-hub';
import WordOrbit, { type WordOrbitLogo } from '@/components/insurance/word-orbit';
import ClientFlow from '@/components/insurance/client-flow';
import ArtPlaceholder from '@/components/insurance/art-placeholder';
import {
  ArrowRight,
  Stethoscope,
  Home,
  Shield,
  CheckCircle2,
  Phone,
  FileText,
  CalendarCheck,
  MessageSquare,
  ClipboardCheck,
  Users,
  Mic,
  Database,
  Bell,
  Search,
  Layers,
  Building2,
  Mail,
  Zap,
  LineChart,
  RefreshCcw,
  Clock,
  Inbox,
  ClipboardList,
  MessageCircle,
  Smartphone,
  Calendar,
} from 'lucide-react';

const QUOTE_LOGOS: WordOrbitLogo[] = [
  { label: 'Web Form',    src: '/insurance/logos/logos-typeform.png',    icon: ClipboardList },
  { label: 'Phone',       src: '/insurance/logos/logos-ringcentral.png', icon: Phone },
  { label: 'ACORD',       src: '/insurance/logos/logos-acord.png',       icon: FileText },
  { label: 'SMS',         src: '/insurance/logos/logos-twilio.png',      icon: MessageCircle },
];

const RENEW_LOGOS: WordOrbitLogo[] = [
  { label: 'HawkSoft',    src: '/insurance/logos/logos-hawksoft.png',    icon: Building2 },
  { label: 'EzLynx',      src: '/insurance/logos/logos-ezlynx.png',      icon: Building2 },
  { label: 'Calendar',    src: '/insurance/logos/logos-google-calendar.png', icon: Calendar },
  { label: 'Outlook',     src: '/insurance/logos/logos-outlook.png',     icon: Mail },
];

const RETAIN_LOGOS: WordOrbitLogo[] = [
  { label: 'Gmail',       src: '/insurance/logos/logos-gmail.png',       icon: Mail },
  { label: 'SMS',         src: '/insurance/logos/logos-twilio.png',      icon: Smartphone },
  { label: 'AMS360',      src: '/insurance/logos/logos-ams360.png',      icon: Building2 },
  { label: 'Applied Epic',src: '/insurance/logos/logos-applied-epic.png',icon: Building2 },
];

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

export default function ServicesPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="pt-32 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-blue-50/80 to-white relative">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700 mb-6">
                <Layers className="w-4 h-4" />
                <span>Our Services</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Custom AI Admin{' '}
                <span className="blue-gradient-text">Systems</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-2xl leading-relaxed">
                We don&apos;t sell generic SaaS. We learn your specific process, map your intakes, forms, and follow-ups, and build a tailored solution that feels like it was designed for your business from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:aqeel@aqeelali.com?subject=I'd like to discuss services">
                  <Button className="cta-button px-8 py-6 text-lg font-semibold rounded-xl">
                    Book a Free Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Link href="#insurance">
                  <Button variant="outline" className="cta-outline px-8 py-6 text-lg font-semibold rounded-xl">
                    See Insurance System
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── What We Build ── */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                What Every Client Gets
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Regardless of your industry, our systems handle the same core admin burdens.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Phone, title: 'Call & Text Capture', desc: 'Every client interaction is recorded, transcribed, and structured automatically.' },
                { icon: FileText, title: 'Auto Form-Filling', desc: 'One intake conversation fills 5+ PDFs and forms. No more retyping.' },
                { icon: CalendarCheck, title: 'Smart Scheduling', desc: 'Coordinate times, send reminders, and manage waitlists without manual effort.' },
                { icon: Bell, title: 'Critical Alerts', desc: 'Important messages surface immediately. Nothing falls through the cracks.' },
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

        {/* ══════════════════════════════════════════ */}
        {/* HEALTHCARE                                */}
        {/* ══════════════════════════════════════════ */}
        <section id="healthcare" className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-5">
                  <Stethoscope className="w-4 h-4" />
                  <span>Healthcare &amp; Telehealth</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
                  For Clinicians, Practices &amp; Telehealth Providers
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Your staff shouldn&apos;t spend their day re-typing patient information into forms. We build systems that capture everything from the first call and carry it through intake, insurance verification, scheduling, and follow-ups.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'Voice note transcription directly into your EMR/EHR systems',
                    'Knowledge, work, and research aggregation in one place',
                    'Intake, insurance verification, and schedule coordination — automated',
                    'Reminders, follow-ups, and pharmacy coordination handled by AI',
                    'Customized to your practice, done for you with your review',
                    'Handles nuance, edge cases, and escalation protocols',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="mailto:aqeel@aqeelali.com?subject=Healthcare AI - Free Consultation">
                  <Button className="cta-button px-6 py-5 text-base font-semibold rounded-xl">
                    Get a Free Healthcare Consult
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">What we handle for healthcare:</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Mic, label: 'Voice-to-System', desc: 'Clinicians speak, notes go directly to their main systems' },
                      { icon: Database, label: 'Knowledge Aggregation', desc: 'Research, work notes, and clinical data — all in one source of truth' },
                      { icon: ClipboardCheck, label: 'Intake & Insurance', desc: 'Patient intake forms, insurance verification, prior auth — automated' },
                      { icon: CalendarCheck, label: 'Schedule & Reminders', desc: 'Appointment coordination, no-show reduction, waitlist management' },
                      { icon: MessageSquare, label: 'Patient Communication', desc: 'Follow-ups, prescription reminders, and care coordination' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-emerald-100">
                          <item.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* REAL ESTATE                               */}
        {/* ══════════════════════════════════════════ */}
        <section id="real-estate" className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 bg-slate-50/50 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal-right order-2 lg:order-1">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">What we handle for real estate:</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Phone, label: 'Lead Capture', desc: 'Every call, text, and email inquiry captured and structured' },
                      { icon: Search, label: 'Property Matching', desc: 'AI matches inquiries to available listings and surfaces best fits' },
                      { icon: CalendarCheck, label: 'Showing Coordination', desc: 'Schedule viewings, send confirmations, manage cancellations' },
                      { icon: FileText, label: 'Document Management', desc: 'Contracts, disclosures, and applications auto-populated' },
                      { icon: Users, label: 'Tenant Communication', desc: 'Maintenance requests, lease renewals, and payment reminders' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <item.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="scroll-reveal-left order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-5">
                  <Home className="w-4 h-4" />
                  <span>Real Estate</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
                  For Property Brokers &amp; Property Management
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Real estate runs on speed and follow-through. We build systems that capture every lead, coordinate showings, manage documents, and keep tenants informed — so you close more deals with less effort.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'Capture every inquiry across phone, text, email, and web forms',
                    'Auto-schedule property viewings with confirmation and reminders',
                    'Pre-fill contracts, disclosures, and applications from lead data',
                    'Tenant communication: maintenance requests, renewals, payment reminders',
                    'CRM integration that updates itself from every interaction',
                    'Never lose a lead to slow follow-up again',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="mailto:aqeel@aqeelali.com?subject=Real Estate AI - Free Consultation">
                  <Button className="cta-button px-6 py-5 text-base font-semibold rounded-xl">
                    Get a Free Real Estate Consult
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* INSURANCE                                 */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="insurance"
          className="relative scroll-mt-24 bg-gradient-to-b from-white via-blue-50/40 to-white overflow-hidden"
        >
          {/* ── Word-orbit Hero ── */}
          <div className="relative px-4 sm:px-8 lg:px-16 pt-24 md:pt-32 pb-16 md:pb-24">
            <div className="absolute top-10 left-1/3 w-[32rem] h-[32rem] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto text-center scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-10">
                <Shield className="w-4 h-4" />
                <span>Insurance · Agencies &amp; Brokerages</span>
              </div>

              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-10">
                <span className="block text-slate-400 font-medium text-2xl sm:text-3xl md:text-4xl mb-8">
                  One system to
                </span>
                <span className="block py-6 md:py-10">
                  <WordOrbit
                    word="quote"
                    logos={QUOTE_LOGOS}
                    gradient="blue-gradient-text"
                  />
                </span>
                <span className="block py-6 md:py-10">
                  <WordOrbit
                    word="renew"
                    logos={RENEW_LOGOS}
                    gradient="text-amber-600"
                  />
                </span>
                <span className="block py-6 md:py-10">
                  <WordOrbit
                    word="& retain."
                    logos={RETAIN_LOGOS}
                    gradient="blue-gradient-text"
                  />
                </span>
              </h2>

              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8 mt-12">
                Bring your AMS, email, phone, forms, and carrier intelligence into a
                single living, breathing system — so your team produces 5-10×
                more with the same hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:aqeel@aqeelali.com?subject=Insurance AI - Free Consultation">
                  <Button className="cta-button px-7 py-5 text-base font-semibold rounded-xl">
                    Book a Free Agency Audit
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Link href="#client-flow">
                  <Button variant="outline" className="cta-outline px-7 py-5 text-base font-semibold rounded-xl">
                    See the flow
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Stat strip ── */}
          <div className="relative z-10 px-4 sm:px-8 lg:px-16 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-reveal">
              {[
                { value: '5-10×', label: 'More output, same hours', tone: 'text-blue-600', bg: 'from-blue-50 to-white' },
                { value: '0', label: 'Dropped client communications', tone: 'text-amber-600', bg: 'from-amber-50 to-white' },
                { value: '1', label: 'Source of truth — not 4+ tabs', tone: 'text-emerald-600', bg: 'from-emerald-50 to-white' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`value-card bg-gradient-to-br ${stat.bg} border border-slate-200 rounded-2xl p-8 text-center`}
                >
                  <p className={`text-5xl md:text-6xl font-bold ${stat.tone} leading-none mb-3`}>
                    {stat.value}
                  </p>
                  <p className="text-sm md:text-base text-slate-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Client flow pipeline ── */}
          <div
            id="client-flow"
            className="relative z-10 px-4 sm:px-8 lg:px-16 py-16 md:py-24 scroll-mt-24"
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 scroll-reveal">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  The loop that runs while you sleep
                </p>
                <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
                  From headcount in the door to{' '}
                  <span className="blue-gradient-text">commission in the bank.</span>
                </h3>
                <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-5">
                  Prospects enter, intake is captured, policies bind, your book
                  compounds — continuously, automatically.
                </p>
              </div>
              <div className="scroll-reveal">
                <ClientFlow />
              </div>
            </div>
          </div>

          {/* ── Central hub visual ── */}
          <div
            id="salient-system"
            className="relative z-10 px-4 sm:px-8 lg:px-16 py-16 md:py-24 scroll-mt-24"
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 scroll-reveal">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  The architecture
                </p>
                <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Every tool you pay for,{' '}
                  <span className="blue-gradient-text">routed through one brain.</span>
                </h3>
              </div>
              <div className="scroll-reveal-scale">
                <SalientHub />
              </div>
            </div>
          </div>

          {/* ── Feature pillars ── */}
          <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 scroll-reveal">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Five pillars. One agency.
                </h3>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Each runs 24/7, talks to the rest, and gets sharper every week.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Inbox,
                    title: 'Intake',
                    desc: 'Async forms + AI-guided qualification. Every prospect captured, probed, and structured before it hits your desk.',
                    art: '/insurance/infographics/infographics-intake-flow.png',
                    tone: 'from-blue-50 to-white',
                    iconTone: 'text-blue-600 bg-blue-50',
                  },
                  {
                    icon: FileText,
                    title: 'Form Processing',
                    desc: 'One intake fills 5-6 ACORDs and carrier apps. Re-typing client info across portals is over.',
                    art: '/insurance/infographics/infographics-form-processing.png',
                    tone: 'from-amber-50 to-white',
                    iconTone: 'text-amber-600 bg-amber-50',
                  },
                  {
                    icon: Clock,
                    title: '24/7 Client Updates',
                    desc: 'Status, policy questions, and FAQ — handled at 2am. Escalations route to your cell. Nothing dropped, ever.',
                    art: '/insurance/infographics/infographics-247-updates.png',
                    tone: 'from-emerald-50 to-white',
                    iconTone: 'text-emerald-600 bg-emerald-50',
                  },
                  {
                    icon: RefreshCcw,
                    title: 'Renewals',
                    desc: 'Policies tracked end-to-end. Renewal windows, missing docs, endorsements, and carrier shopping — automated.',
                    art: '/insurance/infographics/infographics-renewals.png',
                    tone: 'from-purple-50 to-white',
                    iconTone: 'text-purple-600 bg-purple-50',
                  },
                  {
                    icon: LineChart,
                    title: 'Agency Intelligence',
                    desc: 'Commissions reconciled. Carrier appetite mapped. Book-of-business trends surfaced. Run your agency on data.',
                    art: '/insurance/infographics/infographics-agency-intelligence.png',
                    tone: 'from-rose-50 to-white',
                    iconTone: 'text-rose-600 bg-rose-50',
                  },
                  {
                    icon: Zap,
                    title: 'Built for your carriers',
                    desc: 'We wire it to your specific AMS, your email, your carriers, your forms. Not a generic SaaS — your system.',
                    art: null,
                    tone: 'from-slate-50 to-white',
                    iconTone: 'text-slate-700 bg-slate-100',
                  },
                ].map((pillar, i) => (
                  <div
                    key={pillar.title}
                    className={`scroll-reveal stagger-${(i % 4) + 1}`}
                  >
                    <div className={`value-card bg-gradient-to-br ${pillar.tone} border border-slate-200 rounded-2xl overflow-hidden h-full flex flex-col`}>
                      {pillar.art && (
                        <div className="relative w-full aspect-[4/3] bg-white/50 border-b border-slate-100 overflow-hidden">
                          <ArtPlaceholder
                            src={pillar.art}
                            alt={pillar.title}
                            icon={pillar.icon}
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className={`w-11 h-11 rounded-xl ${pillar.iconTone} flex items-center justify-center mb-4`}>
                          <pillar.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">
                          {pillar.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Unify-subscriptions banner ── */}
          <div className="relative z-10 px-4 sm:px-8 lg:px-16 pb-24 md:pb-32">
            <div className="max-w-6xl mx-auto">
              <div className="scroll-reveal rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 md:p-14 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-3">
                      The end of the subscription stack
                    </p>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                      Bring every tool you pay for into{' '}
                      <span className="text-amber-300">one living system.</span>
                    </h3>
                    <p className="text-blue-100/80 text-base md:text-lg leading-relaxed mb-6">
                      Not another dashboard. A self-autonomous agent that reads your
                      inbox, answers your clients, fills your forms, tracks your
                      renewals, and watches your commissions — all while you do the
                      work only you can do.
                    </p>
                    <a href="mailto:aqeel@aqeelali.com?subject=Insurance AI - Agency audit">
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 px-7 py-5 text-base font-semibold rounded-xl shadow-lg">
                        Audit my agency stack
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </a>
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <ArtPlaceholder
                      src="/insurance/infographics/infographics-unified-system.png"
                      alt="Chaotic stack unified into one system"
                      icon={Layers}
                      tone="from-blue-900/40 via-slate-900 to-slate-900"
                    />
                  </div>
                </div>
              </div>
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
              Every system is custom-built for your business. Start with a free consultation and we&apos;ll map exactly where AI creates the most value.
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
