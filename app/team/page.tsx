'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TeamMember {
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  image?: string;
  linkedin?: string;
}

interface Vertical {
  name: string;
  years: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Aqeel Ali',
    role: 'Managing Partner',
    expertise: ['AI Systems Architecture', 'Enterprise Automation', 'Strategic Advisory'],
    bio: 'Architect of large-scale AI automation systems deployed across insurance, healthcare, financial services, and professional practices. Deep technical background in machine learning infrastructure with hands-on experience building and shipping AI products used by thousands. Connects cutting-edge research to real business outcomes.',
    image: '/assets/team/aqeel-ali.jpeg',
    linkedin: 'https://linkedin.com/in/aqeelali',
  },
  {
    name: 'Danara Buvaeva',
    role: 'Partner',
    expertise: ['Ecommerce Operations', 'Supply Chain Optimization', 'Logistics AI'],
    bio: 'Ecommerce and supply chain expert with deep domain knowledge in inventory optimization, demand forecasting, and fulfillment automation. Has driven operational transformations for brands scaling from seven to nine figures, applying AI at every link in the chain from procurement to last-mile delivery.',
    image: '/assets/team/danara-buvaeva.png',
    linkedin: 'https://www.linkedin.com/in/danarab/',
  },
  {
    name: 'George Mazur',
    role: 'Partner',
    expertise: ['B2B SaaS Sales', 'Go-to-Market Strategy', 'Revenue Operations'],
    bio: 'Full-cycle commercial AE with deep experience across B2B SaaS, MarTech, HCM, and fintech. Runs quantified discovery tied to conversion and pipeline levers — visitor-to-lead, MQL-to-SQL, speed-to-lead, attribution. Expert at multi-threading complex deals across Marketing, RevOps, Sales leadership, and Finance. Brings MEDDIC discipline and GTM strategy to every engagement.',
    image: '/assets/team/george-mazur.jpeg',
    linkedin: 'https://www.linkedin.com/in/george-m-b69586159/',
  },
];

const verticals: Vertical[] = [
  {
    name: 'Insurance & Risk',
    years: '8+',
    description: 'Policy lifecycle automation, claims processing, underwriting workflows, and compliance documentation across P&C, life, and specialty lines.',
  },
  {
    name: 'Healthcare & Clinical',
    years: '6+',
    description: 'Patient intake, scheduling optimization, clinical documentation, referral management, and revenue cycle automation for multi-location practices.',
  },
  {
    name: 'Financial Services',
    years: '7+',
    description: 'Client onboarding, portfolio reporting, regulatory compliance, document generation, and advisory workflow automation for RIAs, broker-dealers, and banks.',
  },
  {
    name: 'Ecommerce & DTC',
    years: '5+',
    description: 'Inventory planning, demand forecasting, fulfillment routing, customer service automation, and catalog management for high-growth brands.',
  },
  {
    name: 'Supply Chain & Logistics',
    years: '6+',
    description: 'Procurement automation, vendor management, shipment tracking, warehouse optimization, and predictive analytics for complex distribution networks.',
  },
  {
    name: 'Professional Services',
    years: '5+',
    description: 'Client engagement automation, document workflows, proposal generation, time tracking, and knowledge management for law firms, consultancies, and agencies.',
  },
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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

    const elements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <div className={`scroll-reveal stagger-${index + 1}`}>
      <div
        className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
      >
        {/* Photo */}
        <div className="relative w-full max-w-[320px] lg:max-w-[380px] flex-shrink-0">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 group">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 320px, 380px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/30">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          {/* Decorative accent */}
          <div
            className={`absolute -z-10 top-4 ${isEven ? '-right-4' : '-left-4'} w-full h-full rounded-2xl border border-amber-500/20`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <h3 className="text-3xl sm:text-4xl font-bold text-white">{member.name}</h3>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/5 transition-all duration-300"
                aria-label={`${member.name} on LinkedIn`}
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-amber-400 font-semibold text-lg mb-4 tracking-wide uppercase">
            {member.role}
          </p>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
            {member.expertise.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="text-white/60 leading-relaxed text-base max-w-xl mx-auto lg:mx-0">
            {member.bio}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative pt-36 pb-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-amber-500/8 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-6">
                World-Class AI Expertise, Applied
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.05]">
                We don&apos;t just build AI.{' '}
                <span className="hero-gradient-text">We ship it into your workflows.</span>
              </h1>
              <p className="text-white/50 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-4">
                Our team includes globally recognized AI practitioners who have contributed to the field&apos;s most important advances. We bring that same rigor to your operations — not as a science project, but as working infrastructure that compounds value from day one.
              </p>
              <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
                We&apos;re not here to sell you a platform and walk away. We embed into your team, understand your workflows inside-out, and deploy AI that your people actually use.
              </p>
            </div>
          </div>
        </section>

        {/* Value Proposition Bar */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 text-center">
              <div className="scroll-reveal stagger-1">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">40+</p>
                <p className="text-white/40 text-sm">Combined Years of Domain Expertise</p>
              </div>
              <div className="scroll-reveal stagger-2">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">6</p>
                <p className="text-white/40 text-sm">Industry Verticals Covered</p>
              </div>
              <div className="scroll-reveal stagger-3">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">100%</p>
                <p className="text-white/40 text-sm">Hands-On, Embedded Delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                Leadership
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                The people behind <span className="section-gradient-text">the work</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Senior practitioners who&apos;ve built, deployed, and scaled AI in production — not theorists, operators.
              </p>
            </div>

            <div className="space-y-24">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Industry Verticals */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                Domain Depth
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Industries we <span className="section-gradient-text">know cold</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                We don&apos;t parachute in and learn your industry on your dime. We bring years of vertical expertise, existing relationships, and pattern recognition from dozens of similar deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verticals.map((vertical, index) => (
                <div
                  key={vertical.name}
                  className={`scroll-reveal stagger-${(index % 5) + 1} group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all duration-500`}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                      {vertical.name}
                    </h3>
                    <span className="text-amber-400/70 text-sm font-semibold tabular-nums">
                      {vertical.years} yrs
                    </span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{vertical.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                Our Approach
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                We add to your team,{' '}
                <span className="section-gradient-text">not replace it</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                No rip-and-replace. No six-month discovery phases. We plug into your existing workflows, find the highest-leverage automation opportunities, and get you running.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  step: '01',
                  title: 'Workflow Audit',
                  desc: 'We sit with your team, shadow their processes, and map every manual touchpoint. No surveys — direct observation.',
                },
                {
                  step: '02',
                  title: 'Targeted Deployment',
                  desc: 'We build and deploy AI into 2-3 high-impact workflows first. You see results in weeks, not quarters.',
                },
                {
                  step: '03',
                  title: 'Team Enablement',
                  desc: 'Your people learn to work alongside the AI. We train, document, and make sure adoption sticks.',
                },
                {
                  step: '04',
                  title: 'Scale & Optimize',
                  desc: 'Once the first wins land, we expand across your operations. Every deployment gets smarter from the last.',
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={`scroll-reveal stagger-${index + 1} relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-white/10 transition-all duration-500`}
                >
                  <span className="text-5xl font-black text-white/[0.04] absolute top-4 right-6 select-none">
                    {item.step}
                  </span>
                  <p className="text-amber-400 text-sm font-semibold tracking-wide mb-2">
                    Step {item.step}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to put AI to work?
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
              Tell us about your operations and we&apos;ll show you exactly where AI creates the most leverage — no pitch deck, just a real conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=I want to learn more about Salience">
                <Button className="cta-button bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold px-8 py-6 text-base rounded-xl transition-all duration-300">
                  Start a Conversation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 px-8 py-6 text-base rounded-xl transition-all duration-300"
                >
                  Explore Our Work
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-white font-bold text-xl mb-1">Salience</p>
                <p className="text-white/30 text-sm">AI Automation, Deployed.</p>
              </div>
              <div className="flex items-center gap-6 text-white/30 text-sm">
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
                <Link href="/services/consulting" className="hover:text-amber-400 transition-colors">
                  Services
                </Link>
                <Link href="/products/insurance" className="hover:text-amber-400 transition-colors">
                  Insurance
                </Link>
                <Link href="/products/healthcare" className="hover:text-amber-400 transition-colors">
                  Healthcare
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-white/20 text-sm">&copy; 2026 Salience. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
