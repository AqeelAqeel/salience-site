'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  CalendarCheck,
  LineChart,
  LucideIcon,
} from 'lucide-react';

interface HubNode {
  label: string;
  sublabel: string;
  icon: LucideIcon;
  logoSrc?: string;
  angle: number;
}

const NODES: HubNode[] = [
  {
    label: 'Agency Management',
    sublabel: 'HawkSoft · EzLynx · Epic',
    icon: Building2,
    logoSrc: '/insurance/logos/logos-hawksoft.png',
    angle: -90,
  },
  {
    label: 'Email',
    sublabel: 'Gmail · Outlook · IMAP',
    icon: Mail,
    logoSrc: '/insurance/logos/logos-gmail.png',
    angle: -30,
  },
  {
    label: 'Phone & SMS',
    sublabel: 'RingCentral · Twilio',
    icon: Phone,
    logoSrc: '/insurance/logos/logos-ringcentral.png',
    angle: 30,
  },
  {
    label: 'Intake Forms',
    sublabel: 'ACORD · Carrier apps',
    icon: FileText,
    angle: 90,
  },
  {
    label: 'Renewals',
    sublabel: 'Calendar · Reminders',
    icon: CalendarCheck,
    angle: 150,
  },
  {
    label: 'Carrier Intelligence',
    sublabel: 'Appetite · Commissions',
    icon: LineChart,
    angle: 210,
  },
];

function NodeCard({ node }: { node: HubNode }) {
  const Icon = node.icon;
  const [imgFailed, setImgFailed] = useState(false);
  const showLogo = node.logoSrc && !imgFailed;

  return (
    <div className="value-card bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 p-4 flex items-center gap-3 min-w-[220px]">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
        {showLogo ? (
          <Image
            src={node.logoSrc!}
            alt={node.label}
            width={28}
            height={28}
            className="object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Icon className="w-5 h-5 text-blue-600" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
          {node.label}
        </p>
        <p className="text-xs text-slate-500 truncate">{node.sublabel}</p>
      </div>
    </div>
  );
}

export default function SalientHub() {
  const size = 560;
  const center = size / 2;
  const radius = 220;

  return (
    <div className="relative w-full flex justify-center">
      {/* Desktop: radial layout */}
      <div
        className="relative hidden lg:block"
        style={{ width: size, height: size }}
      >
        {/* Connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="orb-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#fde68a" />
            </radialGradient>
          </defs>
          {NODES.map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const x = center + radius * Math.cos(rad);
            const y = center + radius * Math.sin(rad);
            return (
              <line
                key={node.label}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="url(#line-grad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}
          {/* Central orb background */}
          <circle
            cx={center}
            cy={center}
            r="90"
            fill="url(#orb-grad)"
            opacity="0.6"
            className="animate-pulse-slow"
          />
          <circle
            cx={center}
            cy={center}
            r="70"
            fill="url(#orb-grad)"
            opacity="0.9"
          />
        </svg>

        {/* Central label */}
        <div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{
            left: center - 90,
            top: center - 90,
            width: 180,
            height: 180,
          }}
        >
          <div className="relative w-12 h-12 mb-2">
            <Image
              src="/assets/eyes-favicon.png"
              alt="Salient"
              fill
              className="object-contain animate-float"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your
          </p>
          <p className="text-xl font-bold blue-gradient-text leading-tight">
            Salient System
          </p>
        </div>

        {/* Outer nodes */}
        {NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);
          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <NodeCard node={node} />
            </div>
          );
        })}
      </div>

      {/* Mobile / tablet: stacked grid */}
      <div className="lg:hidden w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-blue-100 via-white to-amber-100 flex items-center justify-center shadow-lg shadow-blue-200/40 animate-pulse-slow">
            <div className="relative w-12 h-12">
              <Image
                src="/assets/eyes-favicon.png"
                alt="Salient"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your
          </p>
          <p className="text-2xl font-bold blue-gradient-text">
            Salient System
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NODES.map((node) => (
            <NodeCard key={node.label} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}
