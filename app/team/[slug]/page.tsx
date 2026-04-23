import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, Mail, MessageSquare, Globe, ArrowLeft } from 'lucide-react';
import { getTeamMember, teamMembers, type TeamMember } from '@/lib/team';

export function generateStaticParams() {
  return teamMembers.map((m) => ({ slug: m.slug }));
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (ten.length !== 10) return raw;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMember(slug);
  if (!member) return { title: 'Team — Salience' };
  return {
    title: `${member.name} — Salience`,
    description: member.tagline,
    openGraph: {
      title: `${member.name} — Salience`,
      description: member.tagline,
      images: member.image ? [member.image] : undefined,
    },
  };
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface LinkButtonProps {
  href: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  primary?: boolean;
  external?: boolean;
}

function LinkButton({ href, label, sublabel, icon, primary, external = true }: LinkButtonProps) {
  const base =
    'group relative flex items-center gap-4 w-full rounded-2xl px-5 py-4 transition-all duration-300 active:scale-[0.98]';
  const styles = primary
    ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] hover:-translate-y-0.5'
    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 backdrop-blur-sm';

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles}`}
    >
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${
          primary ? 'bg-white/15' : 'bg-white/5 border border-white/10'
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-left min-w-0">
        <span className="block font-semibold text-base leading-tight truncate">{label}</span>
        {sublabel && (
          <span
            className={`block text-xs mt-0.5 truncate ${primary ? 'text-blue-100' : 'text-slate-400'}`}
          >
            {sublabel}
          </span>
        )}
      </span>
    </a>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300"
    >
      {children}
    </a>
  );
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member: TeamMember | undefined = getTeamMember(slug);
  if (!member) notFound();

  const hasPrimaryActions = member.calendly || member.email || member.phone;

  return (
    <main className="relative min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] max-w-[140vw] rounded-full bg-gradient-radial from-blue-600/30 via-blue-900/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-indigo-500/20 via-transparent to-transparent blur-3xl" />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-8 max-w-xl mx-auto">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Team</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/assets/eyes-favicon.png"
            alt="Salience"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span className="text-sm font-semibold tracking-wide">Salience</span>
        </Link>
      </div>

      {/* Card container */}
      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* Hero photo with gradient fade */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 576px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
              <span className="text-7xl font-bold text-white/30">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
          )}
          {/* Bottom blend to page bg — strong fade so text stays readable over any photo */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[78%] pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, #0a0f1e 0%, #0a0f1e 38%, rgba(10,15,30,0.92) 55%, rgba(10,15,30,0.55) 75%, rgba(10,15,30,0) 100%)',
            }}
          />

          {/* Name + tagline overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white"
              style={{
                textShadow:
                  '0 2px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {member.name}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-semibold text-blue-300 uppercase tracking-[0.18em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {member.role}
            </p>
            <p className="mt-3 text-slate-200/90 text-sm sm:text-base max-w-md mx-auto leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {member.tagline}
            </p>
          </div>
        </div>

        {/* Social icon row */}
        {(member.linkedin || member.github || member.x) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {member.linkedin && (
              <SocialIcon href={member.linkedin} label="LinkedIn">
                <LinkedInIcon className="w-5 h-5" />
              </SocialIcon>
            )}
            {member.github && (
              <SocialIcon href={member.github} label="GitHub">
                <GitHubIcon className="w-5 h-5" />
              </SocialIcon>
            )}
            {member.x && (
              <SocialIcon href={member.x} label="X / Twitter">
                <XIcon className="w-4 h-4" />
              </SocialIcon>
            )}
          </div>
        )}

        {/* Primary actions */}
        {hasPrimaryActions && (
          <div className="mt-7 space-y-3">
            {member.calendly && (
              <LinkButton
                href={member.calendly}
                label="Book a call"
                sublabel="30-min consult"
                icon={<Calendar className="w-5 h-5" />}
                primary
              />
            )}
            {member.email && (
              <LinkButton
                href={`mailto:${member.email}`}
                label="Email"
                sublabel={member.email}
                icon={<Mail className="w-5 h-5" />}
                external={false}
              />
            )}
            {member.phone && (
              <LinkButton
                href={`sms:${member.phone}?&body=${encodeURIComponent(
                  `Hi ${member.name.split(' ')[0]}, I want to learn more about Salience`
                )}`}
                label="Text"
                sublabel={formatPhone(member.phone)}
                icon={<MessageSquare className="w-5 h-5" />}
                external={false}
              />
            )}
          </div>
        )}

        {/* Secondary links */}
        {member.website && (
          <div className="mt-3">
            <LinkButton
              href={member.website.url}
              label={member.website.label}
              sublabel="Website"
              icon={<Globe className="w-5 h-5" />}
            />
          </div>
        )}

        {/* Bio */}
        {member.bio && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-300/80 mb-3">
              About
            </p>
            <p className="text-slate-300 text-sm sm:text-[0.95rem] leading-relaxed">{member.bio}</p>
            {member.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {member.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors tracking-wide"
          >
            <Image
              src="/assets/eyes-favicon.png"
              alt=""
              width={14}
              height={14}
              className="w-3.5 h-3.5 opacity-60"
            />
            Powered by Salience Ventures
          </Link>
        </div>
      </div>
    </main>
  );
}
