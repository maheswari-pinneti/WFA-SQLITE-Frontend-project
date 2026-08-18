import React from 'react';
import { Lock, ShieldCheck, AlertTriangle, History, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { auditLogger } from '../../../security/audit/auditLogger';

export const SecurityAdminDashboard: React.FC = () => {
  const auditLogs = auditLogger.getLogs();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-admin mb-1">Security Governance</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Security & Access Governance Desk
          </h1>
          <p className="text-xs text-slate-400">
            Manage MFA policies, password rules, role assignments, security keys, and security audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
            MFA Enforced • 100% Compliance
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>MFA Verification</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">100% Enforced</p>
          <p className="text-[11px] text-emerald-400 font-bold">Zero Non-Compliant Users</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Access Policies</span>
            <Lock size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">13 ABAC Policies</p>
          <p className="text-[11px] text-blue-400 font-bold">Scope Restrictions Active</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Flagged Attempts</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">1 Blocked</p>
          <p className="text-[11px] text-slate-400">Auto-contained by PolicyEngine</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Audit Trail Entries</span>
            <History size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{auditLogs.length} Events</p>
          <p className="text-[11px] text-emerald-400 font-bold">Real-time Stream</p>
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <History size={18} className="text-purple-400" /> Real-time Security Event Audit Stream
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {log.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{log.action}</p>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-slate-400 block">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-[10px] font-bold text-purple-400 uppercase">{log.userRole}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
