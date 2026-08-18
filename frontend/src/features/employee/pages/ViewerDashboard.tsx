import React from 'react';
import { Eye, BarChart3, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const ViewerDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Read-Only Observer Scope</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Executive Read-Only Overview
          </h1>
          <p className="text-xs text-slate-400">
            High-level workforce analytics and organizational summaries in read-only observation mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold flex items-center gap-1.5">
            <Eye size={14} /> Read-Only Mode (No Edit Rights)
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Workforce Health</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">96.4% Rating</p>
          <p className="text-[11px] text-emerald-400 font-bold">Stable Operational Output</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Staff</span>
            <BarChart3 size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">301 Employees</p>
          <p className="text-[11px] text-slate-400">4 Active Global Hubs</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Attendance Rate</span>
            <CheckCircle2 size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">98.2%</p>
          <p className="text-[11px] text-emerald-400 font-bold">Optimal Daily Presence</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Permissions</span>
            <ShieldAlert size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">Restricted</p>
          <p className="text-[11px] text-slate-400">Modification Disabled</p>
        </div>
      </div>

      <AnalyticsOverview title="Read-Only Workforce Intelligence" subtitle="Live organization analytics with modification rights disabled" compact />
    </div>
  );
};
