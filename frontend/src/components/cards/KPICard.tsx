import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose' | 'red';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  subtitle,
  icon,
  accentColor = 'blue',
  onClick
}) => {
  const accentClasses = {
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 flex flex-col justify-between transition-all border-slate-800/80 group ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-blue-500/60 hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors flex items-center gap-1">
          {title} {onClick && <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />}
        </span>
        <div className={`p-2.5 rounded-xl border ${accentClasses[accentColor]} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100">{value}</div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs font-medium">
          {subtitle && <span className="text-slate-400 truncate max-w-[150px]">{subtitle}</span>}
          {change !== undefined && (
            <span className={`inline-flex items-center gap-1 font-bold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
              {trend === 'up' && <TrendingUp size={14} />}
              {trend === 'down' && <TrendingDown size={14} />}
              {trend === 'neutral' && <Minus size={14} />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
