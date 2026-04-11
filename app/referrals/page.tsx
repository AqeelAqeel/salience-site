'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Search,
  Phone,
  FileText,
  Repeat,
  CheckCircle2,
  Stethoscope,
  Shield,
  Home,
  Calculator,
  Scale,
  Building2,
  Wrench,
  Dumbbell,
  Ear,
  Handshake,
  Coins,
} from 'lucide-react';

// ------------------------------------------------------------------
// Text-me CTA — the entire page points here. iOS + Android compatible.
// ------------------------------------------------------------------
const PHONE = '+14087180712';
const smsLink = (body: string) =>
  `sms:${PHONE}?&body=${encodeURIComponent(body)}`;

const PRIMARY_SMS_BODY =
  "Hey Aqeel — I've got someone for Salience. Quick context: ";

// ------------------------------------------------------------------
// Data
// ------------------------------------------------------------------

const industries = [
  {
    icon: Shield,
    name: 'Insurance Brokerages',
    pain: 'Carrier form filling, intake processing, document routing between agents and carriers.',
  },
  {
    icon: Stethoscope,
    name: 'Medical & Dental',
    pain: 'Patient intake, scheduling, insurance verification, follow-up reminders.',
  },
  {
    icon: Home,
    name: 'Property Management',
    pain: 'Tenant applications, maintenance requests, lease renewals, vendor coordination.',
  },
  {
    icon: Calculator,
    name: 'Bookkeeping & Accounting',
    pain: 'Receipt processing, invoice matching, client document collection, report generation.',
  },
  {
    icon: Scale,
    name: 'Small Law Firms',
    pain: 'Client intake, document assembly, deadline tracking, billing reconciliation.',
  },
  {
    icon: Building2,
    name: 'Real Estate Agencies',
    pain: 'Lead follow-up, listing management, transaction coordination, document handling.',
  },
  {
    icon: Wrench,
    name: 'Trades & Contractors',
    pain: 'Estimate generation, job scheduling, invoicing, customer communication.',
  },
  {
    icon: Dumbbell,
    name: 'Wellness & Fitness',
    pain: 'Class booking, membership management, client progress tracking.',
  },
];

const spotSignals = [
  {
    icon: Clock,
    title: 'They complain about time',
    body: '“I spend half my day on paperwork.” “We’re drowning in admin.” “I wish I could clone myself.”',
  },
  {
    icon: Zap,
    title: '“We do it manually.”',
    body: 'Any version of this is a green light. Manual data entry, manual follow-ups, manual anything.',
  },
  {
    icon: Users,
    title: 'Staff doing repetitive work',
    body: 'Someone whose main job is copying info between systems, refilling the same forms, or sending the same emails.',
  },
  {
    icon: Search,
    title: 'Curious about AI, stuck on where to start',
    body: 'They’ve heard about ChatGPT and automation but either don’t know where to begin or tried and gave up.',
  },
  {
    icon: TrendingUp,
    title: 'Growing — and systems are cracking',
    body: 'What worked at 5 clients doesn’t work at 50. Things are falling through the cracks.',
  },
  {
    icon: Ear,
    title: 'Message & call fatigue',
    body: 'Most calls and inbound messages are redundant, but every customer matters. Owner picks up every time, just in case.',
  },
];

const scripts = [
  {
    label: 'The casual intro',
    body:
      '“I work with a team that builds custom automation for small businesses. They basically take the repetitive stuff your team does manually and make it run on its own. Fixed price, done in a couple of weeks. Want me to connect you?”',
  },
  {
    label: 'The problem-aware version',
    body:
      '“You mentioned you’re spending a ton of time on [specific pain]. I know a team that specializes in exactly that — they come in, map your process, and build a custom system that handles it automatically. Clients usually get hours back every week. Want an intro?”',
  },
  {
    label: 'The ROI angle',
    body:
      '“You know how you said you might need to hire for [admin / ops task]? Before you do, talk to my guy. He builds AI systems that do what that hire would do, for a fraction of what a full-time seat costs.”',
  },
];

const process = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'You make the intro',
    body: 'Email, text, or a warm handoff. You just connect us.',
  },
  {
    step: '02',
    icon: Phone,
    title: 'We run a free discovery call',
    body: '15–30 minutes. We learn their process, spot what to automate, and confirm fit. No pitch.',
  },
  {
    step: '03',
    icon: FileText,
    title: 'We scope and quote',
    body: 'Fixed-price proposal. No surprises. They know exactly what they’re getting.',
  },
  {
    step: '04',
    icon: Zap,
    title: 'We build and deliver',
    body: 'Custom system with documentation, training videos, and a live walkthrough. Fast turnaround.',
  },
  {
    step: '05',
    icon: Repeat,
    title: 'We expand into a retainer',
    body: 'When the client sees real value — and they do — we move into an ongoing partnership. Your recurring cut starts here.',
  },
];

const commissionTiers = [
  {
    icon: Handshake,
    title: 'Process Audit & Starter Build',
    sub: 'Fixed-price pilot',
    body:
      'A tight, accessible first engagement designed to remove friction and show real value fast. You earn a referral fee on every pilot that closes.',
    payout: 'One-time referral fee',
  },
  {
    icon: Repeat,
    title: 'Annual Partnership',
    sub: 'Ongoing retainer',
    body:
      'When the pilot works, we roll into a long-term retainer: maintenance, new automations, priority support, and infrastructure we manage. You earn a recurring cut every month the client stays.',
    payout: 'Passive, recurring commission',
  },
  {
    icon: Coins,
    title: 'Bigger Deals, Bigger Cut',
    sub: 'Context multiplies your commission',
    body:
      'The more context you bring — team size, existing admin spend, pain depth — the bigger the deal we can close. Your commission scales with the contract value.',
    payout: 'Scales with deal size',
  },
];

const closingTips = [
  {
    title: 'Budget & payroll signals',
    body:
      'Do they have an admin, office manager, or VA? Are they trying to hire for ops? Are they already paying for software they don’t fully use? If they’re already spending on the problem, we aren’t asking for new budget — we’re redirecting existing budget to something that actually works.',
  },
  {
    title: 'Pain depth signals',
    body:
      'Specific time estimates (“I lose 10 hours a week to paperwork”), missed revenue (“we’re too slow to follow up”), compliance/risk worries, and growth plans that current systems can’t handle. The more specific the pain, the bigger the engagement we can scope.',
  },
];

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

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

function TextMeButton({
  body = PRIMARY_SMS_BODY,
  label = 'Text Me Your Referral',
  className = '',
}: {
  body?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a href={smsLink(body)} className={className}>
      <Button className="cta-button bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold px-8 py-6 text-base rounded-xl transition-all duration-300">
        <MessageSquare className="mr-2 w-5 h-5" />
        {label}
      </Button>
    </a>
  );
}

export default function ReferralsPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* ------------------------------------------------ Hero */}
        <section className="relative pt-36 pb-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-amber-500/8 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-6">
                Salience Referral Program
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.05]">
                Make money from{' '}
                <span className="hero-gradient-text">a few texts.</span>
              </h1>
              <p className="text-white/50 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-4">
                We handle the plumbing — the custom builds, the empathetic
                discovery, the deployment and support. Your job is just to make
                the introduction to a business owner you already know.
              </p>
              <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed mb-10">
                Everyone has a family dentist. A friend with a private practice.
                A neighbor running a brokerage. A cousin managing rentals. Every
                single one of them is drowning in work we can automate away.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <TextMeButton
                  body={PRIMARY_SMS_BODY}
                  label="Text Me Your Referral"
                />
                <a
                  href="#how-it-works"
                  className="text-white/50 hover:text-amber-400 transition-colors text-sm font-medium inline-flex items-center gap-2"
                >
                  See how it works
                  <span aria-hidden="true">→</span>
                </a>
              </div>
              <p className="text-white/30 text-xs mt-4 tracking-wide">
                Opens your Messages app, pre-addressed to {PHONE}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Opportunity bar */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 text-center">
              <div className="scroll-reveal stagger-1">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  A few minutes
                </p>
                <p className="text-white/40 text-sm">
                  Of your time per referral
                </p>
              </div>
              <div className="scroll-reveal stagger-2">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  We do the closing
                </p>
                <p className="text-white/40 text-sm">
                  Discovery, scoping, build, delivery
                </p>
              </div>
              <div className="scroll-reveal stagger-3">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  Recurring cut
                </p>
                <p className="text-white/40 text-sm">
                  Every month the client stays
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ What we build */}
        <section
          id="how-it-works"
          className="py-24 px-4 sm:px-8 lg:px-16 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                What We Actually Build
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Custom AI systems{' '}
                <span className="section-gradient-text">for small teams</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Not off-the-shelf software. Not a chatbot. We sit with the
                business owner, learn their operation inside and out, and build
                something that fits their workflow like it was always there.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Phone answering & routing',
                  body:
                    'Systems that answer, route, handle common questions, or escalate to the right party — so owners and staff stop getting interrupted all day.',
                },
                {
                  title: 'Text messaging automation',
                  body:
                    'Scheduling, appointment reminders, viewing confirmations — all handled by a brand-aligned AI that sounds like them, not a robot.',
                },
                {
                  title: 'Intake & onboarding flows',
                  body:
                    'Collect client info, populate the right forms, and route everything without anyone copying and pasting between screens.',
                },
                {
                  title: 'Document processing',
                  body:
                    'Incoming paperwork gets read, data extracted, and filed where it belongs — CRM, carrier portal, shared drive.',
                },
                {
                  title: 'Automated reporting & follow-ups',
                  body:
                    'Triggered by events or schedules. Nothing falls through the cracks. No one has to remember to send the email.',
                },
                {
                  title: 'It plugs into what they already use',
                  body:
                    'No forced migrations, no learning a new platform. We make their current stack work better together.',
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`scroll-reveal stagger-${(index % 5) + 1} rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all duration-500`}
                >
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Industries */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                Sweet Spot
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Small teams,{' '}
                <span className="section-gradient-text">big manual load</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Any small business or professional practice of roughly 1–15
                people running on manual processes — who know they should
                modernize but don&apos;t have the technical chops to do it
                themselves.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry, index) => {
                const Icon = industry.icon;
                return (
                  <div
                    key={industry.name}
                    className={`scroll-reveal stagger-${(index % 5) + 1} group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all duration-500`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                      {industry.name}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {industry.pain}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ How to spot a fit */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                How To Spot A Good Fit
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                You don&apos;t need to be technical.{' '}
                <span className="section-gradient-text">Just listen.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Here&apos;s what to listen for in a normal conversation with
                anyone running a small business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spotSignals.map((signal, index) => {
                const Icon = signal.icon;
                return (
                  <div
                    key={signal.title}
                    className={`scroll-reveal stagger-${(index % 5) + 1} rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 transition-all duration-500`}
                  >
                    <Icon className="w-5 h-5 text-amber-400 mb-3" />
                    <h3 className="text-base font-bold text-white mb-2">
                      {signal.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {signal.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ How to start (3 steps) */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                How To Start
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                No sales strategy.{' '}
                <span className="section-gradient-text">
                  No pitch deck.
                </span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Just two things: think about who you already know, and have
                normal conversations.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Scroll through your phone',
                  body:
                    "Open your contacts, your texts, your socials. Ask yourself: who runs their own business? Who just started something? Who always seems stressed about work? You already know and trust these people — a text from you isn't a sales pitch, it's a friend sharing something useful.",
                },
                {
                  step: '02',
                  title: 'Think about where YOU go',
                  body:
                    "Your dentist. Your insurance agent. Your accountant. Your doctor, barber, trainer, chiropractor, landlord. You're already in rooms with these people. Next time you're there, just ask — “Hey, do you guys still do everything by hand, or have you looked into automating any of this?”",
                },
                {
                  step: '03',
                  title: 'Ask your network',
                  body:
                    "“Hey, do you know anyone running a small business who's buried in admin work?” That's the whole question. Friends, family, coworkers — people love connecting people. Post casually on social and you'll be surprised who replies.",
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={`scroll-reveal stagger-${index + 1} relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-white/10 transition-all duration-500`}
                >
                  <span className="text-6xl md:text-7xl font-black text-white/[0.04] absolute top-4 right-6 select-none">
                    {item.step}
                  </span>
                  <p className="text-amber-400 text-sm font-semibold tracking-wide mb-2">
                    Step {item.step}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed max-w-3xl">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ What you say (scripts) */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                What You Say
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Scripts you can use{' '}
                <span className="section-gradient-text">word for word</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                You&apos;re not selling technology. You&apos;re connecting them
                with someone who saves them time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scripts.map((script, index) => (
                <div
                  key={script.label}
                  className={`scroll-reveal stagger-${index + 1} relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-amber-500/20 transition-all duration-500 flex flex-col`}
                >
                  <p className="text-amber-400 text-xs font-semibold tracking-[0.15em] uppercase mb-3">
                    {script.label}
                  </p>
                  <p className="text-white/70 text-base leading-relaxed italic flex-1">
                    {script.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ How you get paid */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                How You Get Paid
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Upfront, and then{' '}
                <span className="section-gradient-text">recurring.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                The more context you bring, the bigger the deal, and the bigger
                your cut. Exact numbers are arranged per deal — talk to us
                directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {commissionTiers.map((tier, index) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.title}
                    className={`scroll-reveal stagger-${index + 1} relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-amber-500/30 hover:bg-amber-500/[0.04] transition-all duration-500 flex flex-col`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="text-amber-400/80 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                      {tier.sub}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {tier.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">
                      {tier.body}
                    </p>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-white text-sm font-semibold">
                        {tier.payout}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="scroll-reveal rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-transparent p-8 md:p-10 text-center max-w-3xl mx-auto">
              <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-2">
                Referrals compound. Every annual contract that closes keeps
                paying you out — month after month, for as long as the client
                stays.
              </p>
              <p className="text-amber-400/90 text-base font-medium">
                All you did? Ask for info. Make the intro.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Help us close bigger */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                Bring Us Context
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                How you help us{' '}
                <span className="section-gradient-text">close bigger</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                You&apos;re not selling — you&apos;re an inquisitive friend,
                just asking and listening. What you pick up in a casual chat
                determines how big the deal can be.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closingTips.map((tip, index) => (
                <div
                  key={tip.title}
                  className={`scroll-reveal stagger-${index + 1} rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-white/10 transition-all duration-500`}
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Process after referral */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                What Happens After You Refer
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Your job ends at{' '}
                <span className="section-gradient-text">the introduction</span>
              </h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Total time you spend? A few messages and a casual chat. Here&apos;s
                what we take it from there.
              </p>
            </div>

            <div className="space-y-4">
              {process.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className={`scroll-reveal stagger-${(index % 5) + 1} flex flex-col sm:flex-row gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8 hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all duration-500`}
                  >
                    <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 sm:min-w-[80px]">
                      <span className="text-3xl md:text-4xl font-black text-amber-400/20 tabular-nums">
                        {item.step}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/50 text-base leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Common questions */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-amber-400/80 font-medium tracking-[0.2em] uppercase text-sm mb-4">
                In Case They Ask
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Common questions from{' '}
                <span className="section-gradient-text">prospects</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Is this just ChatGPT?',
                  a: 'No. ChatGPT is a chatbot. We build complete systems that integrate into your existing tools and workflows. Think of it as hiring an operations specialist who never sleeps and never forgets.',
                },
                {
                  q: 'What if it doesn’t work?',
                  a: 'The initial project is scoped tightly and priced accessibly on purpose — so you see the value before committing to anything bigger. Low risk, high visibility.',
                },
                {
                  q: 'Do I have to change all my systems?',
                  a: 'No. We work with what you already use. The whole point is to make your current tools work better together, not replace everything.',
                },
                {
                  q: 'How long does it take?',
                  a: 'Fast. The initial build is typically delivered in a matter of weeks, and you see progress within days.',
                },
                {
                  q: 'What about my data and security?',
                  a: 'Your data stays in your systems. We set up automations that work within your existing tools and permissions. Nothing gets sent off to random third parties.',
                },
              ].map((item, index) => (
                <div
                  key={item.q}
                  className={`scroll-reveal stagger-${(index % 5) + 1} rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-7 hover:border-white/10 transition-all duration-500`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-2">
                        {item.q}
                      </h3>
                      <p className="text-white/50 text-sm md:text-base leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Final CTA — TEXT ME */}
        <section className="py-24 px-4 sm:px-8 lg:px-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center scroll-reveal">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <MessageSquare className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Got someone in mind?{' '}
              <span className="section-gradient-text">Shoot me a text.</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Send their name, what they do, and any context you picked up. I&apos;ll
              take it from there — free discovery call, custom proposal, the
              whole flow. You just collect.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <TextMeButton
                body={PRIMARY_SMS_BODY}
                label="Text Me Your Referral"
              />
              <a
                href={`tel:${PHONE}`}
                className="text-white/50 hover:text-amber-400 transition-colors text-sm font-medium inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Or call {PHONE}
              </a>
            </div>

            <p className="text-white/30 text-xs tracking-wide">
              Aqeel Ali · Salience · {PHONE}
            </p>
          </div>
        </section>

        {/* ------------------------------------------------ Footer */}
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
                <Link
                  href="/team"
                  className="hover:text-amber-400 transition-colors"
                >
                  Team
                </Link>
                <Link
                  href="/services/consulting"
                  className="hover:text-amber-400 transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/referrals"
                  className="hover:text-amber-400 transition-colors"
                >
                  Referrals
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-white/20 text-sm">
                &copy; 2026 Salience. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
