import React from 'react';
import { Building2, BarChart3, TrendingUp, Users, Download } from 'lucide-react';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const DeptHeadDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-manager mb-1">Executive Department Scope</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Engineering Department Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            High-level department performance, headcount allocation, team productivity, and strategic summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm flex items-center gap-2">
            <Download size={14} /> Export Executive Brief
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Department Staff</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">142 Engineers</p>
          <p className="text-[11px] text-emerald-400 font-bold">+8 Added this Quarter</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Delivery Velocity</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">94.8% SLA</p>
          <p className="text-[11px] text-emerald-400 font-bold">+2.4% vs Target</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Sub-Teams</span>
            <Building2 size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">6 Teams</p>
          <p className="text-[11px] text-slate-400">Frontend, Backend, AI, DevOps...</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Department Rating</span>
            <BarChart3 size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">4.85 / 5.0</p>
          <p className="text-[11px] text-emerald-400 font-bold">Top Performing Dept</p>
        </div>
      </div>

      <AnalyticsOverview title="Department Sub-Team Intelligence" subtitle="Live department comparison, productivity and retention-risk analytics" compact />
    </div>
  );
};
