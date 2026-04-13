'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
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
  BrainCircuit,
  ClipboardCheck,
  Users,
  Mic,
  Database,
  Bell,
  Building2,
  Search,
  Layers,
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
                <Link href="/case-studies">
                  <Button variant="outline" className="cta-outline px-8 py-6 text-lg font-semibold rounded-xl">
                    See Case Studies
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
        <section id="insurance" className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-5">
                  <Shield className="w-4 h-4" />
                  <span>Insurance</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
                  For Insurance Brokers &amp; Agencies
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Your team handles dozens of quote calls a day, each requiring 5-6 different forms across multiple carriers. We capture the call, extract the data, and fill every form automatically.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'Client intake calls transcribed and structured into policy fields',
                    'Auto-fill carrier applications from a single intake conversation',
                    'Policy renewals, claims follow-ups, and documentation tracked',
                    'Multiple carrier forms populated from one data source',
                    'Compliance documentation generated and filed automatically',
                    'Custom-built for your specific carriers and form requirements',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:aqeel@aqeelali.com?subject=Insurance AI - Free Consultation">
                    <Button className="cta-button px-6 py-5 text-base font-semibold rounded-xl">
                      Get a Free Insurance Consult
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <Link href="/case-studies">
                    <Button variant="outline" className="cta-outline px-6 py-5 text-base font-semibold rounded-xl">
                      Read the Case Study
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">What we handle for insurance:</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Phone, label: 'Quote Call Capture', desc: 'Calls transcribed, client details extracted, structured into fields' },
                      { icon: FileText, label: 'Multi-Form Auto-Fill', desc: 'One intake fills applications across all your carriers' },
                      { icon: Database, label: 'Policy Tracking', desc: 'Renewals, endorsements, and claims tracked in one system' },
                      { icon: Bell, label: 'Follow-Up Automation', desc: 'Missing docs, pending signatures, renewal reminders — all automated' },
                      { icon: ClipboardCheck, label: 'Compliance & Filing', desc: 'Documentation standards maintained, audit-ready at all times' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-amber-100">
                          <item.icon className="w-5 h-5 text-amber-600" />
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
