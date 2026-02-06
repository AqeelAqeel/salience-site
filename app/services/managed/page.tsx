'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Headphones,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Phone,
  Shield,
  Clock,
  TrendingUp,
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

const managedServices = [
  {
    icon: BarChart3,
    title: '24/7 Monitoring',
    description: 'Round-the-clock monitoring of all your AI agents and automated workflows.',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Optimization',
    description: 'Regular performance reviews and optimizations to improve results over time.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Direct access to our team for questions, adjustments, and strategic guidance.',
  },
  {
    icon: Shield,
    title: 'Compliance Updates',
    description: 'Stay compliant with automatic updates as regulations change.',
  },
];

const features = [
  '24/7 system monitoring and alerting',
  'Monthly performance reports',
  'Continuous workflow optimization',
  'Priority support response',
  'Regular strategy reviews',
  'Compliance and security updates',
];

export default function ManagedPage() {
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
                <Headphones className="w-4 h-4" />
                <span>Managed Services</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Managed AI{' '}
                <span className="text-amber-500">Operations</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8">
                Ongoing support, monitoring, and optimization for your AI automation. We keep everything running smoothly so you can focus on growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:aqeel@aqeelali.com?subject=Managed Services Inquiry">
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                    Learn More
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
                What&apos;s <span className="text-amber-500">Included</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managedServices.map((service, index) => (
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

        {/* Features */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal-left">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  Peace of Mind{' '}
                  <span className="text-amber-500">Included</span>
                </h2>
                <ul className="space-y-4">
                  {features.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="scroll-reveal-right">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
                  <Clock className="w-12 h-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Always Improving</h3>
                  <p className="text-white/90 mb-6">
                    Our managed services don&apos;t just maintain—they continuously optimize your automation for better results month over month.
                  </p>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="w-5 h-5" />
                    <span>Average 15% improvement per quarter</span>
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
              Want Hands-Off{' '}
              <span className="text-amber-400">AI Management?</span>
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Let us handle the ongoing operations while you focus on growing your practice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=Managed Services Inquiry">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                  Get Started
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
                <p className="text-white/50 text-sm">Managed AI Operations</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/services/consulting" className="hover:text-amber-400 transition-colors">Consulting</Link>
                <Link href="/services/deployment" className="hover:text-amber-400 transition-colors">Deployment</Link>
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
