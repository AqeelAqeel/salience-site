'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Search,
  FileText,
  Target,
  CheckCircle2,
  Phone,
  Mail,
  BarChart3,
  Lightbulb,
  TrendingUp,
  ClipboardList,
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

const consultingServices = [
  {
    icon: Search,
    title: 'Process Discovery',
    description: 'Deep dive into your current workflows to understand every step of your operations.',
  },
  {
    icon: Target,
    title: 'Bottleneck Identification',
    description: 'Pinpoint the exact processes that are slowing you down and costing you money.',
  },
  {
    icon: BarChart3,
    title: 'ROI Analysis',
    description: 'Calculate the potential return on investment for each automation opportunity.',
  },
  {
    icon: ClipboardList,
    title: 'Implementation Roadmap',
    description: 'Get a clear, step-by-step plan for implementing automation in your practice.',
  },
];

const deliverables = [
  'Comprehensive workflow documentation',
  'Bottleneck analysis report',
  'Automation opportunity matrix',
  'ROI projections for each opportunity',
  'Prioritized implementation roadmap',
  'Technology stack recommendations',
];

export default function ConsultingPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                <Lightbulb className="w-4 h-4" />
                <span>Consulting Services</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                AI Automation{' '}
                <span className="text-amber-500">Consulting</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8">
                Before we automate anything, we understand everything. Our workflow audits identify the highest-impact automation opportunities in your practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:aqeel@aqeelali.com?subject=Workflow Audit Request">
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                    Book a Free Audit
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                What We <span className="text-amber-500">Analyze</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consultingServices.map((service, index) => (
                <div
                  key={service.title}
                  className={`scroll-reveal stagger-${(index % 2) + 1} group bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-amber-200 transition-all duration-300`}
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                    <service.icon className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{service.title}</h3>
                  <p className="text-neutral-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal-left">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  What You <span className="text-amber-500">Get</span>
                </h2>
                <ul className="space-y-4">
                  {deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
                  <FileText className="w-12 h-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Free Workflow Audit</h3>
                  <p className="text-white/90 mb-6">
                    Start with a complimentary audit to see exactly where AI can make the biggest impact in your practice.
                  </p>
                  <a href="mailto:aqeel@aqeelali.com?subject=Free Workflow Audit Request">
                    <Button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-900">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Discover Your{' '}
              <span className="text-amber-400">Automation Opportunities?</span>
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Book a free workflow audit and get a clear picture of how AI can transform your practice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Workflow Audit Request">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                  Book Free Audit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="tel:+14087180712">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Us
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
                <p className="text-white/50 text-sm">AI Automation Consulting</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/services/deployment" className="hover:text-amber-400 transition-colors">Deployment</Link>
                <Link href="/services/managed" className="hover:text-amber-400 transition-colors">Managed</Link>
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
