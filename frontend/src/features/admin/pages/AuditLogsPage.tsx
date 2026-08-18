import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { History, Download } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { auditLogger } from '../../../security/audit/auditLogger';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ id: string; timestamp: string; actor: string; role: string; action: string; target: string; ip: string; status: string }>>([]);
  
  useEffect(() => {
    analyticsApi.getAuditLogs()
      .then((items) => {
        if (!items || items.length === 0) throw new Error('No items');
        setLogs(items.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          actor: item.employeeId,
          role: 'AUDIT',
          action: item.action,
          target: item.details,
          ip: 'server',
          status: 'SUCCESS'
        })));
      })
      .catch(() => {
        // Fallback to local live audit logs if api fails
        const localEvents = auditLogger.getLogs();
        setLogs(localEvents.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          actor: item.userId,
          role: item.userRole,
          action: item.action,
          target: item.details,
          ip: item.ipAddress,
          status: item.status
        })));
      });
  }, []);

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}>
      <div className="w-full space-y-6 animate-fadeIn font-sans pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--text-primary)]">
              <History className="text-amber-400" size={24} />
              Enterprise Security Audit Log Trail
            </h2>
            <p className="text-xs text-slate-400">
              Immutable forensic log stream tracking all authentication, RBAC policy edits, and data accesses.
            </p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} /> Export Audit Log (.CSV)
          </Button>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action Triggered</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{log.actor}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-300">{log.action}</td>
                    <td className="py-3 px-4 text-slate-400">{log.target}</td>
                    <td className="py-3 px-4 text-slate-400">{log.ip}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
