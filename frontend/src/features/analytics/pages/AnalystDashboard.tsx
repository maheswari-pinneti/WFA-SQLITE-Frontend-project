import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const AnalystDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Business Intelligence & Analytics Scope</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Workforce Intelligence & BI Analytics Hub
          </h1>
          <p className="text-xs text-slate-400">
            Build custom reports, analyze headcount trends, predict attrition models, and export analytics datasets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm flex items-center gap-2">
            <Download size={14} /> Export Dataset (CSV / JSON)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Analyzed Records</span>
            <BarChart3 size={18} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">14,280 Logs</p>
          <p className="text-[11px] text-emerald-400 font-bold">100% Data Integrity</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Predictive Model</span>
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">98.4% Accuracy</p>
          <p className="text-[11px] text-purple-400 font-bold">ML Attrition Predictor Active</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Custom Reports</span>
            <FileSpreadsheet size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">12 Saved</p>
          <p className="text-[11px] text-blue-400 font-bold">Scheduled Weekly Export</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Data Exports</span>
            <Download size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">240 Downloads</p>
          <p className="text-[11px] text-slate-400">Read-Only Analytics Allowed</p>
        </div>
      </div>

      <AnalyticsOverview title="Live Workforce Intelligence" subtitle="Scope-filtered analytics for authorized business intelligence users" />
    </div>
  );
};
