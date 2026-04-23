'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import {
  ArrowRight,
  Home,
  CheckCircle2,
  Phone,
  FileText,
  CalendarCheck,
  MessageSquare,
  Users,
  Search,
} from 'lucide-react';

export default function RealEstatePage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="relative pt-32 md:pt-40 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-blue-50/60 via-purple-50/30 to-white overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8">
                <Home className="w-4 h-4" />
                <span>Real Estate</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                For property brokers{' '}
                <span className="blue-gradient-text">&amp; property management.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                Real estate runs on speed and follow-through. We build systems that
                capture every lead, coordinate showings, manage documents, and keep
                tenants informed — so you close more deals with less effort.
              </p>
              <a href="mailto:aqeel@aqeelali.com?subject=Real Estate AI - Free Consultation">
                <Button className="cta-button px-7 py-5 text-base font-semibold rounded-xl">
                  Get a Free Real Estate Consult
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Two-column body ── */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal-right order-2 lg:order-1">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    What we handle for real estate:
                  </h3>
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
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Close more deals with less follow-up work.
                </h2>
                <div className="space-y-4">
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
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Ready to stop losing leads to slow follow-up?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Every system is custom-built for your brokerage. Start with a free
              consultation and we&apos;ll map exactly where AI creates the most value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Real Estate AI - Free Consultation">
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
