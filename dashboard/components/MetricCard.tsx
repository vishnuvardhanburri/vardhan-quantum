'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  badge: string;
  value: string;
  unit?: string;
  subtitle: string;
  glowColor?: 'teal' | 'purple' | 'crimson';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  badge,
  value,
  unit,
  subtitle,
  glowColor = 'teal',
}) => {
  const borderHover =
    glowColor === 'teal'
      ? 'hover:border-[#00F5D4]/50 hover:shadow-[0_0_30px_rgba(0,245,212,0.15)]'
      : glowColor === 'purple'
      ? 'hover:border-[#8A2BE2]/50 hover:shadow-[0_0_30px_rgba(138,43,226,0.15)]'
      : 'hover:border-[#FF0055]/50 hover:shadow-[0_0_30px_rgba(255,0,85,0.15)]';

  const badgeBg =
    glowColor === 'teal'
      ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/30'
      : glowColor === 'purple'
      ? 'bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/30'
      : 'bg-[#FF0055]/10 text-[#FF0055] border-[#FF0055]/30';

  return (
    <div
      className={`relative group rounded-xl bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 p-6 shadow-2xl transition-all duration-300 overflow-hidden ${borderHover}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {glowColor === 'teal' && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F5D4]"></span>
            </span>
          )}
          <h3 className="text-[11px] font-mono font-semibold tracking-widest text-slate-400 uppercase">
            {title}
          </h3>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full border ${badgeBg}`}>
          {badge}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {value} {unit && <span className="text-xs font-normal text-slate-500">{unit}</span>}
        </p>
        <p className="text-xs text-slate-400 font-mono">{subtitle}</p>
      </div>
    </div>
  );
};
