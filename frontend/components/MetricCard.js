'use client';

import React from 'react';

export const MetricCard = ({
  title,
  badge,
  value,
  unit,
  subtitle,
  glowColor = 'teal',
}) => {
  const borderHover =
    glowColor === 'teal'
      ? 'hover:border-[#00F5D4]/60 hover:shadow-[0_0_35px_rgba(0,245,212,0.2)]'
      : glowColor === 'purple'
      ? 'hover:border-[#8A2BE2]/60 hover:shadow-[0_0_35px_rgba(138,43,226,0.2)]'
      : glowColor === 'blue'
      ? 'hover:border-[#0075FF]/60 hover:shadow-[0_0_35px_rgba(0,117,255,0.2)]'
      : 'hover:border-[#FF0055]/60 hover:shadow-[0_0_35px_rgba(255,0,85,0.2)]';

  const badgeBg =
    glowColor === 'teal'
      ? 'bg-[#00F5D4]/15 text-[#00F5D4] border-[#00F5D4]/40'
      : glowColor === 'purple'
      ? 'bg-[#8A2BE2]/15 text-[#8A2BE2] border-[#8A2BE2]/40'
      : glowColor === 'blue'
      ? 'bg-[#0075FF]/15 text-[#0075FF] border-[#0075FF]/40'
      : 'bg-[#FF0055]/15 text-[#FF0055] border-[#FF0055]/40';

  return (
    <div
      className={`relative group rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl transition-all duration-300 overflow-hidden ${borderHover}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {glowColor === 'teal' && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F5D4]"></span>
            </span>
          )}
          {glowColor === 'purple' && (
            <span className="w-2 h-2 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_#8A2BE2]"></span>
          )}
          {glowColor === 'blue' && (
            <span className="w-2 h-2 rounded-full bg-[#0075FF] shadow-[0_0_8px_#0075FF]"></span>
          )}
          {glowColor === 'red' && (
            <span className="w-2 h-2 rounded-full bg-[#FF0055] shadow-[0_0_8px_#FF0055]"></span>
          )}
          <h3 className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase truncate">
            {title}
          </h3>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${badgeBg}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-black tracking-tight text-white font-mono">
            {value}
          </span>
          {unit && <span className="text-xs font-mono font-normal text-slate-400">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 font-mono truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
