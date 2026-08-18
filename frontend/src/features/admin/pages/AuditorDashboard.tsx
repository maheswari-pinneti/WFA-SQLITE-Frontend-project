import React from 'react';
import { History, ShieldCheck, Lock, FileText } from 'lucide-react';
import { auditLogger } from '../../../security/audit/auditLogger';

export const AuditorDashboard: React.FC = () => {
  const logs = auditLogger.getLogs();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-warning mb-1">Compliance & Audit Scope</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Compliance & Security Audit Portal
          </h1>
          <p className="text-xs text-slate-400">
            Read-only compliance verification, security policy logs, access history, and SOC2 / ISO audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            SOC2 Type II Compliant
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Audit Status</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">100% Compliant</p>
          <p className="text-[11px] text-emerald-400 font-bold">Zero Critical Violations</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Audited Log Events</span>
            <History size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{logs.length} Events</p>
          <p className="text-[11px] text-slate-400">Immutable Audit Trail</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Data Rights</span>
            <Lock size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">Read Only</p>
          <p className="text-[11px] text-blue-400 font-bold">No Modification Access</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Compliance Certs</span>
            <FileText size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">ISO 27001</p>
          <p className="text-[11px] text-emerald-400 font-bold">Verified Active</p>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <History size={18} className="text-amber-400" /> Immutable Access History & Security Logs
        </h3>

        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-300">{log.id}</span>
                  <span className="font-bold text-[var(--text-primary)]">{log.action}</span>
                </div>
                <p className="text-xs text-slate-400">{log.details}</p>
              </div>
              <div className="text-right">
                <span className="badge badge-success text-[9px] mb-1">{log.status}</span>
                <p className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
