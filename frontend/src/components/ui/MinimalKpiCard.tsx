import React from 'react';

export interface MinimalKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'indigo' | 'cyan' | 'teal';
  trend?: string;
  trendType?: 'positive' | 'negative';
  onClick?: () => void;
}

export const MinimalKpiCard: React.FC<MinimalKpiCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'blue',
  trend,
  trendType = 'positive',
  onClick,
}) => {
  const bgGradientMap = {
    emerald: 'bg-gradient-to-tr from-emerald-500/20 via-emerald-400/10 to-teal-300/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20',
    blue: 'bg-gradient-to-tr from-blue-500/20 via-blue-400/10 to-sky-300/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20',
    amber: 'bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-yellow-300/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20',
    rose: 'bg-gradient-to-tr from-rose-500/20 via-rose-400/10 to-pink-300/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20',
    purple: 'bg-gradient-to-tr from-purple-500/20 via-purple-400/10 to-fuchsia-300/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/20',
    indigo: 'bg-gradient-to-tr from-indigo-500/20 via-indigo-400/10 to-violet-300/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20',
    cyan: 'bg-gradient-to-tr from-cyan-500/20 via-cyan-400/10 to-sky-300/20 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-500/20',
    teal: 'bg-gradient-to-tr from-teal-500/20 via-teal-400/10 to-emerald-300/20 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`kpi-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 flex items-center justify-between gap-4 group ${
        onClick ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
      }`}
    >
      {/* 3D Glass Soft Colored Icon Sphere */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner ${bgGradientMap[iconBgColor]}`}
      >
        {icon}
      </div>

      {/* Numerical Value & Subtitle */}
      <div className="text-right space-y-0.5 flex-1 min-w-0">
        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
          {value}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>

        {trend && (
          <p
            className={`text-[11px] font-extrabold pt-0.5 ${
              trendType === 'positive' ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};
