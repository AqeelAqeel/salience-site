'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Rocket,
  Bot,
  Settings,
  CheckCircle2,
  Phone,
  Zap,
  Shield,
  RefreshCw,
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

const deploymentServices = [
  {
    icon: Bot,
    title: 'Custom AI Agents',
    description: 'Purpose-built AI agents tailored to your specific workflows and business processes.',
  },
  {
    icon: Settings,
    title: 'System Integration',
    description: 'Seamless integration with your existing tools, CRMs, and business systems.',
  },
  {
    icon: Shield,
    title: 'Compliance Ready',
    description: 'HIPAA, SOC 2, and industry-specific compliance built into every deployment.',
  },
  {
    icon: RefreshCw,
    title: 'Gradual Rollout',
    description: 'Phased deployment approach that minimizes disruption to your current operations.',
  },
];

const features = [
  'AI agents custom-built for your workflows',
  'Integration with existing systems (EHR, CRM, etc.)',
  'Zero disruption deployment strategy',
  'Staff training and onboarding',
  'Real-time monitoring dashboards',
  'Post-deployment optimization',
];

export default function DeploymentPage() {
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
                <Rocket className="w-4 h-4" />
                <span>Deployment Services</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Custom AI{' '}
                <span className="text-amber-500">Deployment</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8">
                We deploy AI agents precisely where they create the biggest impact—custom-built for your workflows, integrated with your systems, and designed for zero disruption.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:aqeel@aqeelali.com?subject=AI Deployment Inquiry">
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl">
                    Start Your Deployment
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
                What We <span className="text-amber-500">Deploy</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deploymentServices.map((service, index) => (
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
                  Full-Service{' '}
                  <span className="text-amber-500">Deployment</span>
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
                  <Zap className="w-12 h-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Zero Disruption Guarantee</h3>
                  <p className="text-white/90 mb-6">
                    Our phased deployment approach ensures your operations continue smoothly while AI takes over manual tasks.
                  </p>
                  <a href="mailto:aqeel@aqeelali.com?subject=AI Deployment Inquiry">
                    <Button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold">
                      Learn More
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
              Ready to Deploy{' '}
              <span className="text-amber-400">AI in Your Practice?</span>
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Let&apos;s discuss how we can deploy custom AI agents tailored to your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=AI Deployment Inquiry">
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
                <p className="text-white/50 text-sm">Custom AI Deployment</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/services/consulting" className="hover:text-amber-400 transition-colors">Consulting</Link>
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
