import React from 'react';

export interface MaterialStatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBgColor?: 'black' | 'blue' | 'green' | 'rose' | 'amber' | 'purple';
}

export const MaterialStatCard: React.FC<MaterialStatCardProps> = ({
  title,
  value,
  trend,
  trendType = 'positive',
  icon,
  iconBgColor = 'blue',
}) => {
  const iconBgClasses = {
    black: 'bg-slate-900 text-white shadow-slate-900/30',
    blue: 'bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/30',
    green: 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-emerald-500/30',
    rose: 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-rose-500/30',
    amber: 'bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-amber-500/30',
    purple: 'bg-gradient-to-tr from-purple-600 to-purple-400 text-white shadow-purple-500/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative pt-2 p-4">
      {/* Top Floating Icon & Value Header */}
      <div className="flex items-start justify-between">
        {/* Floating Top-Left Badge */}
        <div
          className={`-mt-6 ml-1 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 ${iconBgClasses[iconBgColor]}`}
        >
          {icon}
        </div>

        {/* Value and Label */}
        <div className="text-right space-y-0.5">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-slate-100 dark:border-slate-800/80" />

      {/* Footer Trend */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span
          className={`font-bold ${
            trendType === 'positive'
              ? 'text-emerald-500'
              : trendType === 'negative'
              ? 'text-rose-500'
              : 'text-slate-400'
          }`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
};
