import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { ExportReport } from '../../reports/components/ExportReport';
import { FileText, Download } from 'lucide-react';

export const HRReports: React.FC = () => {
  const reportsList = [
    { name: 'Monthly Payroll & Work Hours Audit', date: 'Jul 2026', size: '2.4 MB' },
    { name: 'Equal Opportunity & Diversity Headcount', date: 'Q2 2026', size: '1.8 MB' },
    { name: 'Quarterly Workforce Turnover Analysis', date: 'Q2 2026', size: '3.1 MB' },
    { name: 'Department Capacity & Overtime Compliance', date: 'Jul 2026', size: '1.2 MB' },
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.REPORT_VIEW}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">HR Intelligence & Compliance Reports</h2>
          <p className="text-sm text-slate-400">Pre-built executive workforce summaries and regulatory exports</p>
        </div>

        <ExportReport title="Generate Custom HR Report Export" />

        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Archived Regulatory Reports</h3>
          <div className="space-y-3">
            {reportsList.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{r.name}</h4>
                    <p className="text-xs text-slate-400">Generated: {r.date} • Size: {r.size}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-200">
                  <Download size={14} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
