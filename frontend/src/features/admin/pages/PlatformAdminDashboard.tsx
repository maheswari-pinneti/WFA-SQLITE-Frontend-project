import React, { useState } from 'react';
import { Layers, Sliders, ToggleLeft, ToggleRight, Cpu, Zap, CheckCircle2 } from 'lucide-react';

export const PlatformAdminDashboard: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag-1', name: 'Predictive Attrition Analytics Engine', category: 'Analytics', enabled: true },
    { id: 'flag-2', name: 'Real-time Facial Recognition Attendance', category: 'Attendance', enabled: false },
    { id: 'flag-3', name: 'Automated Payroll Sync Interceptor', category: 'Payroll', enabled: true },
    { id: 'flag-4', name: 'Glassmorphism Dark Theme Engine v3.0', category: 'UI', enabled: true },
    { id: 'flag-5', name: 'Granular ABAC Clearance Validator', category: 'Security', enabled: true },
  ]);

  const toggleFlag = (id: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Level 1 Security Scope</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Platform & Module Administration
          </h1>
          <p className="text-xs text-slate-400">
            Configure application feature flags, dynamic modules, UI themes, and workflow automations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
            Platform Engine v5.4.2
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Modules</span>
            <Layers size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">14 / 16</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
            <CheckCircle2 size={12} /> 87.5% Platform Health
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Feature Flags</span>
            <Sliders size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">28 Flags</p>
          <p className="text-[11px] text-blue-400 font-bold">4 Active Experiments</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>API Rate Limit</span>
            <Zap size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">10,000 / min</p>
          <p className="text-[11px] text-slate-400">Peak Load 18%</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>CPU & Memory</span>
            <Cpu size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">34.2%</p>
          <p className="text-[11px] text-emerald-400 font-bold">Optimal Server Load</p>
        </div>
      </div>

      {/* Feature Flag Management Table */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sliders size={18} className="text-blue-500" /> Feature Flags & Module Toggles
          </h3>
          <span className="text-xs text-slate-400 font-mono">Hot-reload active</span>
        </div>

        <div className="space-y-2">
          {featureFlags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{flag.name}</span>
                  <span className="badge badge-info text-[9px] uppercase">{flag.category}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {flag.enabled ? 'Module active and serving live platform traffic.' : 'Module disabled.'}
                </p>
              </div>

              <button
                onClick={() => toggleFlag(flag.id)}
                className="p-1 text-slate-300 hover:text-white transition-colors"
              >
                {flag.enabled ? (
                  <ToggleRight size={32} className="text-blue-500" />
                ) : (
                  <ToggleLeft size={32} className="text-slate-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
