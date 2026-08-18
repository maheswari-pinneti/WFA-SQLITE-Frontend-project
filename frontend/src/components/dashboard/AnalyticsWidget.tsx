import React from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';

interface AnalyticsWidgetProps {
  title: string;
  metric: string;
  subtext: string;
  trend?: string;
  icon?: React.ReactNode;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  title,
  metric,
  subtext,
  trend = '+4.2%',
  icon,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl space-y-3 font-sans transition-all hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-[var(--text-primary)]">{title}</span>
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
          {icon || <Activity size={18} />}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-[var(--text-primary)]">{metric}</span>
        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-0.5">
          <ArrowUpRight size={14} /> {trend}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>
    </div>
  );
};
