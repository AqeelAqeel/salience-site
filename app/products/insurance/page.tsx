'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Shield,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  BarChart3,
  Bot,
  Zap,
  RefreshCw,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    icon: RefreshCw,
    title: 'Policy Renewal Automation',
    description: 'Automated tracking and follow-up for policy renewals. Never miss a renewal date again.',
    stat: '95% renewal tracking',
  },
  {
    icon: FileText,
    title: 'Claims Follow-up',
    description: 'AI-powered claims processing and follow-up communications with clients and carriers.',
    stat: '73% faster processing',
  },
  {
    icon: MessageSquare,
    title: 'Client Communications',
    description: 'Automated email sequences, SMS reminders, and personalized outreach at scale.',
    stat: '85% response rate',
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    description: 'Smart scheduling that syncs with your calendar and sends automatic reminders.',
    stat: '60% fewer no-shows',
  },
  {
    icon: Users,
    title: 'Lead Qualification',
    description: 'AI agents that qualify incoming leads and route them to the right team members.',
    stat: '3x lead conversion',
  },
  {
    icon: BarChart3,
    title: 'Real-time Dashboards',
    description: 'Full visibility into every automated process. Monitor, adjust, and override anytime.',
    stat: '24/7 monitoring',
  },
];

const benefits = [
  'Automate policy renewals and never lose a client to missed follow-ups',
  'Process claims 73% faster with AI-assisted workflows',
  'Scale client communications without adding staff',
  'Real-time dashboards give you full visibility and control',
  'Gradual rollout—no disruption to your current operations',
  'Custom-fit to your agency\'s specific workflows',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Workflow Audit',
    description: 'We analyze your current processes to identify the highest-impact automation opportunities.',
  },
  {
    step: '02',
    title: 'AI Deployment',
    description: 'Custom AI agents are deployed at your lever points—renewals, claims, communications.',
  },
  {
    step: '03',
    title: 'Monitor & Optimize',
    description: 'Real-time dashboards let you track everything. We continuously optimize for results.',
  },
];

export default function InsuranceProductPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-200/20 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  <span>Insurance Automation</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                  Full AI Automation for{' '}
                  <span className="text-amber-500">Insurance Brokerages</span>
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 mb-8">
                  Automate policy renewals, claims follow-ups, and client communications. Get 73% faster claims processing while maintaining full control.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:aqeel@aqeelali.com?subject=Insurance Automation Demo Request">
                    <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-amber-500/25">
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
                    <div className="text-4xl font-bold text-amber-500 mb-2">73%</div>
                    <div className="text-neutral-600">Faster Claims Processing</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-red-500 mb-2">95%</div>
                    <div className="text-neutral-600">Renewal Tracking</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-amber-500 mb-2">85%</div>
                    <div className="text-neutral-600">Less Admin Work</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100">
                    <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
                    <div className="text-neutral-600">AI Working for You</div>
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
                <span className="text-amber-500">Scale Your Agency</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                AI automation designed specifically for insurance brokerages. Every feature built for real-world agency workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`scroll-reveal stagger-${(index % 3) + 1} group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                    <feature.icon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4">{feature.description}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-sm">
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
                How It <span className="text-amber-500">Works</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                A proven process to automate your agency without disrupting current operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.step} className={`scroll-reveal stagger-${index + 1} relative`}>
                  <div className="bg-white rounded-2xl p-8 border border-neutral-200 h-full">
                    <span className="text-6xl font-bold text-amber-100">{step.step}</span>
                    <h3 className="text-xl font-bold text-neutral-900 mt-4 mb-3">{step.title}</h3>
                    <p className="text-neutral-600">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-amber-300" />
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
                  Why Insurance Agencies{' '}
                  <span className="text-amber-500">Choose Us</span>
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl p-8 text-white">
                  <Bot className="w-12 h-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Your AI Workforce</h3>
                  <p className="text-white/90 mb-6">
                    Imagine having 10 versions of yourself handling renewals, claims, and client communications 24/7. That&apos;s what our AI automation delivers.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">200+</div>
                      <div className="text-white/70 text-sm">Daily Tasks Automated</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">$440</div>
                      <div className="text-white/70 text-sm">Avg Revenue/Day Gained</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-900">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your{' '}
              <span className="text-amber-400">Insurance Agency?</span>
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Get a free workflow audit and see exactly how AI can automate your biggest bottlenecks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Free Workflow Audit for Insurance Agency">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                  Get Free Workflow Audit
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
                <p className="text-white/50 text-sm">AI Automation for Insurance Agencies</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/products/healthcare" className="hover:text-amber-400 transition-colors">Healthcare</Link>
                <Link href="/team" className="hover:text-amber-400 transition-colors">Team</Link>
              </div>
              <div className="flex items-center gap-4">
                <a href="mailto:aqeel@aqeelali.com" className="text-white/50 hover:text-amber-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+14087180712" className="text-white/50 hover:text-amber-400 transition-colors">
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
