'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Linkedin, Twitter, Mail, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

interface ClientWork {
  name: string;
  industry: string;
  description: string;
  link?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Aqeel Ali',
    role: 'Founder & CEO',
    bio: 'Building AI automation systems that give business owners their time back. Focused on high-leverage solutions for insurance and healthcare practices.',
    linkedin: 'https://linkedin.com/in/aqeelali',
    twitter: 'https://twitter.com/aqeelali',
    email: 'aqeel@aqeelali.com',
  },
  {
    name: 'Team Member',
    role: 'Head of Engineering',
    bio: 'Leading the technical architecture of our AI automation platform. Expert in building scalable systems that integrate seamlessly with existing workflows.',
  },
  {
    name: 'Team Member',
    role: 'Operations Lead',
    bio: 'Ensuring smooth deployment and ongoing optimization of client automation systems. Focused on measurable results and client success.',
  },
];

const clientWork: ClientWork[] = [
  {
    name: 'Regional Insurance Agency',
    industry: 'Insurance',
    description: 'Automated policy renewals and claims follow-ups, reducing processing time by 73%.',
  },
  {
    name: 'Multi-Location Healthcare Practice',
    industry: 'Healthcare',
    description: 'Deployed AI for patient intake and appointment scheduling, cutting no-shows by 60%.',
  },
  {
    name: 'Professional Services Firm',
    industry: 'Professional Services',
    description: 'Streamlined client onboarding and document collection, saving 85% admin overhead.',
  },
];

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

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
      {videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
          <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center mb-4 shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <p className="text-neutral-600 font-medium">Video Coming Soon</p>
          <p className="text-neutral-400 text-sm mt-1">Enter YouTube video ID to embed</p>
        </div>
      )}
    </div>
  );
}

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <div className={`scroll-reveal stagger-${index + 1}`}>
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Avatar Placeholder */}
        <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
          <p className="text-amber-600 font-medium mb-3">{member.role}</p>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">{member.bio}</p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-amber-500 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-amber-500 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-amber-500 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  useScrollReveal();

  // Replace with actual YouTube video ID
  const youtubeVideoId = '';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-neutral-50 to-white">
          <div className="max-w-6xl mx-auto text-center">
            <div className="scroll-reveal">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                Our Team
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
                Meet the <span className="text-amber-500">People</span> Behind Salience
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto">
                We&apos;re a team of automation experts, engineers, and operators dedicated to helping private practices reclaim their time and scale their operations.
              </p>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto scroll-reveal">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                See How We Work
              </h2>
              <p className="text-neutral-600">
                Watch our approach to transforming business operations with AI
              </p>
            </div>
            <YouTubeEmbed videoId={youtubeVideoId} />
          </div>
        </section>

        {/* Team Members Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                The <span className="text-amber-500">Team</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Experts in AI, automation, and business operations working together to deliver results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={member.name + index} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Our Work Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Who We&apos;ve <span className="text-amber-500">Worked With</span>
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Real results from real businesses who trusted us with their automation needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clientWork.map((client, index) => (
                <div
                  key={client.name}
                  className={`scroll-reveal stagger-${index + 1} bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium mb-4">
                    {client.industry}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{client.name}</h3>
                  <p className="text-neutral-600 text-sm">{client.description}</p>
                  {client.link && (
                    <a
                      href={client.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium mt-4 hover:text-amber-700"
                    >
                      View Case Study <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join Our Success Stories?
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how we can transform your practice with AI automation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:aqeel@aqeelali.com?subject=I want to learn more about Salience">
                <Button className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-6 text-lg font-semibold rounded-xl">
                  Get in Touch
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-8 lg:px-16 bg-neutral-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-white font-bold text-xl mb-2">Salience</p>
                <p className="text-white/50 text-sm">AI Automation for Private Practices</p>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/products/insurance" className="hover:text-amber-400 transition-colors">Insurance</Link>
                <Link href="/products/healthcare" className="hover:text-amber-400 transition-colors">Healthcare</Link>
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
