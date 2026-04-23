'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import FooterSpotlight from '@/components/footer-spotlight';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import {
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  CalendarCheck,
  MessageSquare,
  ClipboardCheck,
  Mic,
  Database,
} from 'lucide-react';

export default function HealthcarePage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="relative pt-32 md:pt-40 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-emerald-50/60 via-blue-50/30 to-white overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 left-1/4 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
                <Stethoscope className="w-4 h-4" />
                <span>Healthcare &amp; Telehealth</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                For clinicians,{' '}
                <span className="blue-gradient-text">practices &amp; telehealth.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                Your staff shouldn&apos;t spend their day re-typing patient information
                into forms. We build systems that capture everything from the first
                call and carry it through intake, insurance verification, scheduling,
                and follow-ups.
              </p>
              <a href="mailto:aqeel@aqeelali.com?subject=Healthcare AI - Free Consultation">
                <Button className="cta-button px-7 py-5 text-base font-semibold rounded-xl">
                  Get a Free Healthcare Consult
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Two-column body ── */}
        <section className="py-24 md:py-32 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal-left">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  From first call to follow-up, in one system.
                </h2>
                <div className="space-y-4">
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
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    What we handle for healthcare:
                  </h3>
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

        {/* ── Final CTA ── */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-emerald-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Ready to give your clinicians their time back?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Every system is custom-built for your practice. Start with a free
              consultation and we&apos;ll map exactly where AI creates the most value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Healthcare AI - Free Consultation">
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg">
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
