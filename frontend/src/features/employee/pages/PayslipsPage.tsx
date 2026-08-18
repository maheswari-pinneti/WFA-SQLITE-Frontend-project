import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { DollarSign, Download } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const PayslipsPage: React.FC = () => {
  const payslips = [
    { period: 'July 2026', basic: '$8,500', allowance: '$1,200', deduction: '$1,800', net: '$7,900', status: 'PAID', date: '2026-07-31' },
    { period: 'June 2026', basic: '$8,500', allowance: '$1,200', deduction: '$1,800', net: '$7,900', status: 'PAID', date: '2026-06-30' },
    { period: 'May 2026', basic: '$8,500', allowance: '$1,200', deduction: '$1,800', net: '$7,900', status: 'PAID', date: '2026-05-31' },
  ];

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={24} />
              My Confidential Payslips & Earnings Statements
            </h2>
            <p className="text-sm text-slate-400">
              Access encrypted digital salary slips, tax withholding records, and annual W2/1099 statements.
            </p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} /> Download YTD Statement
          </Button>
        </div>

        {/* Payslips Table */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Salary History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Take-Home</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {payslips.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100">{p.period}</td>
                    <td className="py-3 px-4 text-slate-300">{p.basic}</td>
                    <td className="py-3 px-4 text-indigo-400">{p.allowance}</td>
                    <td className="py-3 px-4 text-rose-400">-{p.deduction}</td>
                    <td className="py-3 px-4 text-emerald-400 font-extrabold">{p.net}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <Button variant="ghost" size="sm" className="text-blue-400 flex items-center gap-1 ml-auto">
                        <Download size={14} /> PDF Slip
                      </Button>
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
