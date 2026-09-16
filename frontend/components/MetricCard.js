'use client';

import React from 'react';

export const MetricCard = ({
  title,
  badge,
  value,
  unit,
  subtitle,
  glowColor = 'teal',
  icon: Icon,
}) => {
  const glowShadow =
    glowColor === 'teal'   ? 'hover:shadow-[0_8px_32px_rgba(0,245,212,0.15)]' :
    glowColor === 'purple' ? 'hover:shadow-[0_8px_32px_rgba(138,43,226,0.15)]' :
    glowColor === 'blue'   ? 'hover:shadow-[0_8px_32px_rgba(0,117,255,0.15)]' :
                             'hover:shadow-[0_8px_32px_rgba(238,93,80,0.15)]';

  const badgeStyle =
    glowColor === 'teal'   ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/30' :
    glowColor === 'purple' ? 'bg-[#8A2BE2]/15 text-[#A855F7] border-[#8A2BE2]/30' :
    glowColor === 'blue'   ? 'bg-[#0075FF]/10 text-[#60A5FA] border-[#0075FF]/30' :
                             'bg-[#EE5D50]/10 text-[#EE5D50] border-[#EE5D50]/30';

  const iconBoxStyle =
    glowColor === 'teal'   ? 'from-[#00F5D4]/20 to-[#007A6A]/10 border-[#00F5D4]/20' :
    glowColor === 'purple' ? 'from-[#8A2BE2]/25 to-[#3D0080]/10 border-[#8A2BE2]/20' :
    glowColor === 'blue'   ? 'from-[#0075FF]/20 to-[#002080]/10 border-[#0075FF]/20' :
                             'from-[#EE5D50]/20 to-[#800000]/10 border-[#EE5D50]/20';

  const iconColor =
    glowColor === 'teal'   ? 'text-[#00F5D4]' :
    glowColor === 'purple' ? 'text-[#A855F7]' :
    glowColor === 'blue'   ? 'text-[#60A5FA]' :
                             'text-[#EE5D50]';

  const valueColor =
    glowColor === 'teal'   ? 'text-[#00F5D4]' :
    glowColor === 'purple' ? 'text-[#A855F7]' :
    glowColor === 'blue'   ? 'text-white' :
                             'text-[#EE5D50]';

  return (
    <div className={`vui-card p-5 transition-all duration-300 cursor-default ${glowShadow}`}>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 ${iconBoxStyle}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        {badge && (
          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ml-auto ${badgeStyle}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-[#A0AEC0] uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-black tracking-tight font-mono ${valueColor}`}>
            {value}
          </span>
          {unit && <span className="text-xs font-mono text-[#A0AEC0]">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#A0AEC0] font-mono truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
