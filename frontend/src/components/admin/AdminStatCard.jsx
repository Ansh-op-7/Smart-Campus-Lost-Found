import React from 'react';

export default function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'teal', // 'teal' | 'rose' | 'amber' | 'cyan' | 'purple' | 'emerald'
}) {
  const schemeStyles = {
    teal: {
      bg: 'from-teal-500/10 to-teal-500/5',
      border: 'border-teal-500/20 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/15 text-teal-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-500/5',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.teal;

  return (
    <div
      className={`p-5 rounded-3xl bg-gradient-to-br ${currentScheme.bg} border ${currentScheme.border} backdrop-blur-xl transition-all duration-200 space-y-3 group shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl ${currentScheme.iconBg} transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          {value !== undefined && value !== null ? value.toLocaleString() : '—'}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
