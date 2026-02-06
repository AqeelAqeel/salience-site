'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Stethoscope,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  BarChart3,
  Bot,
  FileText,
  MessageSquare,
  ClipboardCheck,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

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

const features = [
  {
    icon: ClipboardCheck,
    title: 'Patient Intake Automation',
    description: 'Digital intake forms that pre-populate records and sync with your EHR system automatically.',
    stat: '90% time saved',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling with automatic reminders and intelligent rescheduling.',
    stat: '60% fewer no-shows',
  },
  {
    icon: FileText,
    title: 'Insurance Verification',
    description: 'Automated insurance eligibility checks and prior authorization workflows.',
    stat: '80% faster verification',
  },
  {
    icon: MessageSquare,
    title: 'Patient Communications',
    description: 'HIPAA-compliant automated messaging for appointments, follow-ups, and care instructions.',
    stat: '95% delivery rate',
  },
  {
    icon: Users,
    title: 'Patient Follow-up',
    description: 'Automated post-visit follow-ups, care plan reminders, and satisfaction surveys.',
    stat: '3x engagement',
  },
  {
    icon: BarChart3,
    title: 'Practice Analytics',
    description: 'Real-time dashboards showing patient flow, revenue metrics, and operational KPIs.',
    stat: '24/7 visibility',
  },
];

const benefits = [
  'Reduce patient no-shows by 60% with automated reminders',
  'Automate insurance verification and prior authorizations',
  'HIPAA-compliant communications at scale',
  'Digital intake that saves 90% of admin time',
  'Real-time dashboards with full visibility into operations',
  'Seamless integration with your existing EHR system',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Practice Audit',
    description: 'We analyze your patient flow, admin tasks, and identify the highest-impact automation opportunities.',
  },
  {
    step: '02',
    title: 'AI Deployment',
    description: 'HIPAA-compliant AI agents deployed for intake, scheduling, insurance, and communications.',
  },
  {
    step: '03',
    title: 'Monitor & Optimize',
    description: 'Real-time dashboards and continuous optimization to maximize patient satisfaction.',
  },
];

export default function HealthcareProductPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-red-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-6">
                  <Heart className="w-4 h-4" />
                  <span>Healthcare Automation</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                  AI Automation for{' '}
                  <span className="text-red-500">Healthcare Practices</span>
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 mb-8">
                  Automate patient intake, scheduling, insurance verification, and communications. Reduce no-shows by 60% while delivering better patient care.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:aqeel@aqeelali.com?subject=Healthcare Automation Demo Request">
                    <Button className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-red-500/25">
                      Request a Demo
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <a href="tel:+14087180712">
                    <Button variant="outline" className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-8 py-6 text-lg rounded-xl">
                      <Phone className="mr-2 w-5 h-5" />
                      Call Us
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="scroll-reveal-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-red-500 mb-2">60%</div>
                    <div className="text-neutral-600">Fewer No-Shows</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-amber-500 mb-2">90%</div>
                    <div className="text-neutral-600">Intake Time Saved</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-red-500 mb-2">80%</div>
                    <div className="text-neutral-600">Faster Verification</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-amber-500 mb-2">100%</div>
                    <div className="text-neutral-600">HIPAA Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Everything You Need to{' '}
                <span className="text-red-500">Scale Your Practice</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                HIPAA-compliant AI automation designed specifically for healthcare practices. Every feature built for real-world clinical workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`scroll-reveal stagger-${(index % 3) + 1} group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300`}
                >
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 group-hover:bg-red-500 transition-colors">
                    <feature.icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4">{feature.description}</p>
                  <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {feature.stat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                How It <span className="text-red-500">Works</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                A proven process to automate your practice without disrupting patient care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.step} className={`scroll-reveal stagger-${index + 1} relative`}>
                  <div className="bg-white rounded-2xl p-8 border border-neutral-200 h-full">
                    <span className="text-6xl font-bold text-red-100">{step.step}</span>
                    <h3 className="text-xl font-bold text-neutral-900 mt-4 mb-3">{step.title}</h3>
                    <p className="text-neutral-600">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-red-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits List */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal-left">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  Why Healthcare Practices{' '}
                  <span className="text-red-500">Choose Us</span>
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white">
                  <Stethoscope className="w-12 h-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Focus on Patient Care</h3>
                  <p className="text-white/90 mb-6">
                    Let AI handle the administrative burden while you focus on what matters most—delivering exceptional patient care.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-white/70 text-sm">Appointments/Day Managed</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-white/70 text-sm">Patient Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HIPAA Compliance Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-50">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Security & Compliance Built In
            </h2>
            <p className="text-neutral-600 text-lg mb-8">
              All our healthcare automation solutions are fully HIPAA compliant. Your patient data is encrypted, secure, and handled with the highest standards of privacy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-lg px-6 py-3 border border-neutral-200">
                <span className="text-neutral-700 font-medium">End-to-End Encryption</span>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 border border-neutral-200">
                <span className="text-neutral-700 font-medium">BAA Available</span>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 border border-neutral-200">
                <span className="text-neutral-700 font-medium">SOC 2 Compliant</span>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 border border-neutral-200">
                <span className="text-neutral-700 font-medium">Audit Trails</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-900">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your{' '}
              <span className="text-red-400">Healthcare Practice?</span>
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Get a free practice audit and see exactly how AI can automate your biggest operational bottlenecks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Free Practice Audit for Healthcare">
                <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                  Get Free Practice Audit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="tel:+14087180712">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                  <Phone className="mr-2 w-5 h-5" />
                  +1 (408) 718-0712
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-8 lg:px-16 bg-neutral-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-white font-bold text-xl mb-2">Salience</p>
                <p className="text-white/50 text-sm">AI Automation for Healthcare Practices</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-red-400 transition-colors">Home</Link>
                <Link href="/products/insurance" className="hover:text-red-400 transition-colors">Insurance</Link>
                <Link href="/team" className="hover:text-red-400 transition-colors">Team</Link>
              </div>
              <div className="flex items-center gap-4">
                <a href="mailto:aqeel@aqeelali.com" className="text-white/50 hover:text-red-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+14087180712" className="text-white/50 hover:text-red-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-white/30 text-sm">&copy; 2026 Salience. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
