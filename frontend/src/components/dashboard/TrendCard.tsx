import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface TrendCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  title,
  value,
  change,
  trend,
  subtitle,
  icon,
}) => {
  const isUp = trend === 'up';

  return (
    <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl space-y-3 font-sans transition-all hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-[var(--text-primary)]">{title}</span>
        <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-400">
          {icon || <TrendingUp size={18} />}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{value}</span>
        <span
          className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
            isUp ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </span>
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
    </div>
  );
};
