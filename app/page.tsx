'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
  ClipboardCheck,
  Building2,
  Stethoscope,
  Shield,
  Zap,
  Bot,
  Phone,
  Mail
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '@/components/header';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { value: '90%', label: 'Increase in Productivity', icon: TrendingUp, color: 'text-amber-400' },
    { value: '42%', label: 'Cost Savings', icon: Clock, color: 'text-emerald-400' },
    { value: '10x', label: 'More Capacity', icon: Users, color: 'text-cyan-400' },
    { value: '24/7', label: 'Autonomous Operations', icon: Bot, color: 'text-purple-400' },
  ];

  const workflowSteps = [
    {
      icon: FileText,
      title: 'Workflow Audit',
      description: 'We map your entire operation to find the exact lever points where AI creates the biggest impact.',
      features: ['Process documentation', 'Bottleneck identification', 'ROI analysis per automation'],
    },
    {
      icon: Calendar,
      title: 'Targeted AI Deployment',
      description: 'AI agents deployed precisely where they matter—intake, follow-ups, scheduling, communications.',
      features: ['Custom-fit to your process', 'Gradual rollout option', 'Zero disruption to current ops'],
    },
    {
      icon: ClipboardCheck,
      title: 'Monitor & Control',
      description: 'Real-time dashboards show exactly what\'s happening. You approve, override, or adjust anytime.',
      features: ['Live activity feeds', 'One-click overrides', 'Full audit trails'],
    },
  ];

  const industries = [
    {
      icon: Shield,
      title: 'Insurance Agencies',
      description: 'Automate policy renewals, claims follow-ups, and client communications.',
      stats: '73% faster claims processing',
    },
    {
      icon: Stethoscope,
      title: 'Healthcare Practices',
      description: 'Patient intake, appointment scheduling, and insurance verification on autopilot.',
      stats: '60% reduction in no-shows',
    },
    {
      icon: Building2,
      title: 'Professional Services',
      description: 'Client onboarding, document collection, and routine follow-ups handled.',
      stats: '85% less admin overhead',
    },
  ];

  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-[#0a0a0a] min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-radial from-amber-900/20 via-transparent to-transparent" />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 relative pt-8">
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">AI-Powered Automation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-white">Run Your Practice Like You Have</span>
            <br />
            <span className="hero-gradient-text">10 Versions of Yourself</span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-white/60 mb-4 max-w-3xl mx-auto">
            We audit your workflow, identify your <span className="text-amber-400">main lever points</span>, and deploy AI to resolve operational bottlenecks—while you stay in control with
            <span className="text-white"> real-time dashboards</span> and
            <span className="text-white"> full visibility</span>.
          </p>

          <p className="text-base md:text-lg text-amber-400/80 mb-12 italic">
            Soon the person you&apos;ll be spending the most time with is your tax advisor 😉
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto cta-button text-lg px-8 py-6 rounded-xl font-semibold"
              >
                I&apos;m Ready to Make More Money
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a
              href="sms:+14087180712?body=Hi, I want to learn more about automating my practice"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                <Phone className="mr-2 w-5 h-5" />
                Text Us Now
              </Button>
            </a>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50">
            <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Mail className="w-4 h-4" />
              <span>aqeel@aqeelali.com</span>
            </a>
            <span className="hidden sm:block">|</span>
            <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+1 (408) 718-0712</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="section-gradient-text">Transforming Business Operations</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Real results from practices that automated their workflows
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`metric-card p-6 md:p-8 text-center transition-all duration-500 ${
                  activeMetric === index ? 'metric-card-active' : ''
                }`}
                onMouseEnter={() => setActiveMetric(index)}
              >
                <metric.icon className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 ${metric.color}`} />
                <p className={`text-3xl md:text-5xl font-bold mb-2 ${metric.color}`}>{metric.value}</p>
                <p className="text-sm md:text-base text-white/60">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-amber-900/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="section-gradient-text">How We Work</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Audit first. Deploy AI at your lever points. You stay in control.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="workflow-card group">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg">
                  {index + 1}
                </div>

                <div className="p-6 md:p-8">
                  <step.icon className="w-12 h-12 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 mb-6">{step.description}</p>

                  <ul className="space-y-2">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow connector (not on last item) */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Result callout */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
              <span className="text-4xl">🎯</span>
              <div className="text-left">
                <p className="text-white font-semibold text-lg">The Result?</p>
                <p className="text-white/70">Bottlenecks resolved. Operations running 24/7. Full visibility in your dashboard. You focus on growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="section-gradient-text">Built for Your Industry</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Tailored automation for the practices that need it most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {industries.map((industry) => (
              <div key={industry.title} className="industry-card group">
                <div className="p-6 md:p-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                    <industry.icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{industry.title}</h3>
                  <p className="text-white/60 mb-4">{industry.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">{industry.stats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo/Visual Section */}
      <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="demo-card p-8 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                  Your Command Center
                </h2>
                <p className="text-white/60 text-lg mb-6">
                  Full visibility. Total control. Real-time monitoring of every AI action:
                </p>
                <ul className="space-y-4">
                  {[
                    'See every task completed in real-time',
                    'Override or adjust any automation instantly',
                    'Track ROI and performance metrics',
                    'Exceptions flagged—you decide what happens',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                {/* Mock dashboard preview */}
                <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-white/80 text-sm">12 intakes completed</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-white/80 text-sm">3 items need review</span>
                      <span className="text-amber-400 text-sm font-medium">Review</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span className="text-white/80 text-sm">8 appointments scheduled</span>
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-white/80 text-sm">47 follow-ups sent</span>
                      <Mail className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 px-4 sm:px-8 lg:px-16 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Ready to Get Your</span>
            <br />
            <span className="hero-gradient-text">Time Back?</span>
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
            We&apos;ll audit your workflow, identify the bottlenecks, and deploy AI exactly where it matters. You keep full control with real-time dashboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="mailto:aqeel@aqeelali.com?subject=I'm ready to make more money and get my time back"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto cta-button text-lg px-10 py-7 rounded-xl font-semibold"
              >
                I&apos;m Ready to Make More Money
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a
              href="sms:+14087180712?body=Hi, I want to learn more about automating my practice"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-7 rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                <Phone className="mr-2 w-5 h-5" />
                Text Us
              </Button>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 mb-8">
            <a href="mailto:aqeel@aqeelali.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Mail className="w-4 h-4" />
              <span>aqeel@aqeelali.com</span>
            </a>
            <span className="hidden sm:block">|</span>
            <a href="tel:+14087180712" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+1 (408) 718-0712</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 lg:px-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-white font-bold text-xl mb-2">Salience</p>
              <p className="text-white/50 text-sm">AI Automation for Private Practices</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-sm italic">
                &quot;Soon the person you&apos;ll spend the most time with is your tax advisor&quot; 😉
              </p>
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
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">© 2026 Salience. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
