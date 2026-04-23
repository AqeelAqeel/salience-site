'use client';

import {
  UserPlus,
  ScanLine,
  ShieldCheck,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';
import ArtPlaceholder from './art-placeholder';

interface Stage {
  step: string;
  title: string;
  caption: string;
  icon: LucideIcon;
  art: string;
  artTone: string;
  accent: string;
  chipTone: string;
}

const STAGES: Stage[] = [
  {
    step: '01',
    title: 'Prospect in',
    caption: 'Web form, phone, referral — every head captured and qualified.',
    icon: UserPlus,
    art: '/insurance/infographics/flow-stage-1-prospect.png',
    artTone: 'from-blue-100 via-white to-blue-50',
    accent: 'text-blue-600',
    chipTone: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    step: '02',
    title: 'Info captured',
    caption: 'Intake probed by AI. Fields structured. ACORDs auto-filled.',
    icon: ScanLine,
    art: '/insurance/infographics/flow-stage-2-capture.png',
    artTone: 'from-amber-100 via-white to-amber-50',
    accent: 'text-amber-600',
    chipTone: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    step: '03',
    title: 'Policy underwritten',
    caption: 'Carriers shopped, quotes returned, bind docs issued — live.',
    icon: ShieldCheck,
    art: '/insurance/infographics/flow-stage-3-underwrite.png',
    artTone: 'from-emerald-100 via-white to-emerald-50',
    accent: 'text-emerald-600',
    chipTone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    step: '04',
    title: 'Firm earns more',
    caption: 'Commissions reconciled, renewals queued, retention compounds.',
    icon: TrendingUp,
    art: '/insurance/infographics/flow-stage-4-revenue.png',
    artTone: 'from-rose-100 via-white to-rose-50',
    accent: 'text-rose-600',
    chipTone: 'bg-rose-50 border-rose-200 text-rose-700',
  },
];

function TravelingPulse({ delay, color }: { delay: string; color: string }) {
  return (
    <span
      className={`absolute -top-[5px] w-3 h-3 rounded-full ${color} shadow-[0_0_12px_currentColor] animate-flow-pulse`}
      style={{ animationDelay: delay }}
    />
  );
}

export default function ClientFlow() {
  return (
    <div className="relative w-full">
      {/* Desktop horizontal flow */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-6 mb-8 relative">
          {STAGES.map((stage) => (
            <div key={stage.step} className="relative">
              <div className="value-card bg-white border border-slate-200 rounded-2xl overflow-hidden h-full flex flex-col">
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${stage.artTone} border-b border-slate-100`}>
                  <ArtPlaceholder
                    src={stage.art}
                    alt={stage.title}
                    icon={stage.icon}
                  />
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${stage.chipTone}`}
                  >
                    Step {stage.step}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <stage.icon className={`w-5 h-5 ${stage.accent}`} />
                    <h4 className="text-base font-bold text-slate-900">
                      {stage.title}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {stage.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline rail with traveling dots */}
        <div className="relative h-4 mx-12">
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full animate-flow-shimmer"
            style={{
              background:
                'linear-gradient(90deg, #60a5fa 0%, #f59e0b 33%, #10b981 66%, #e11d48 100%)',
            }}
          />
          <TravelingPulse delay="0s" color="text-blue-500 bg-blue-500" />
          <TravelingPulse delay="1.5s" color="text-amber-500 bg-amber-500" />
          <TravelingPulse delay="3s" color="text-emerald-500 bg-emerald-500" />
          <TravelingPulse delay="4.5s" color="text-rose-500 bg-rose-500" />
        </div>

        {/* Rail axis labels */}
        <div className="flex justify-between mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider px-2">
          <span>T₀ — inquiry</span>
          <span>Intake complete</span>
          <span>Bound</span>
          <span>Revenue realized →</span>
        </div>
      </div>

      {/* Mobile vertical flow */}
      <div className="lg:hidden space-y-4">
        {STAGES.map((stage, i) => (
          <div key={stage.step} className="relative">
            <div className="value-card bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${stage.artTone} border-b border-slate-100`}>
                <ArtPlaceholder
                  src={stage.art}
                  alt={stage.title}
                  icon={stage.icon}
                />
                <span
                  className={`absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${stage.chipTone}`}
                >
                  Step {stage.step}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <stage.icon className={`w-5 h-5 ${stage.accent}`} />
                  <h4 className="text-base font-bold text-slate-900">
                    {stage.title}
                  </h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {stage.caption}
                </p>
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="w-[2px] h-10 bg-gradient-to-b from-slate-300 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
