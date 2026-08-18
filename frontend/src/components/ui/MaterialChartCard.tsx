import React from 'react';
import { Clock } from 'lucide-react';

export interface MaterialChartCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  chartBgColor?: 'blue' | 'green' | 'dark';
  children: React.ReactNode;
}

export const MaterialChartCard: React.FC<MaterialChartCardProps> = ({
  title,
  subtitle,
  footerText,
  chartBgColor = 'blue',
  children,
}) => {
  const chartBgClasses = {
    blue: 'bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 shadow-blue-500/30',
    green: 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-emerald-500/30',
    dark: 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 shadow-slate-900/40 border border-slate-700/50',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 pt-0">
      {/* Floating Vibrant Chart Container */}
      <div
        className={`-mt-6 mb-4 rounded-2xl p-4 shadow-xl text-white overflow-hidden ${chartBgClasses[chartBgColor]}`}
      >
        <div className="h-44 w-full flex items-center justify-center">
          {children}
        </div>
      </div>

      {/* Card Info & Title */}
      <div className="px-1 space-y-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-slate-100 dark:border-slate-800/80" />

      {/* Footer Timestamp */}
      <div className="px-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Clock size={14} className="shrink-0" />
        <span>{footerText}</span>
      </div>
    </div>
  );
};
