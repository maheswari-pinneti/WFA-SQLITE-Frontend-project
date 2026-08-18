import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { DollarSign, Download } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const PayrollReports: React.FC = () => {
  const payrollSummary = [
    { month: 'July 2026', totalGross: '$1,850,000', totalNet: '$1,420,000', taxDeductions: '$310,000', status: 'COMPLETED' },
    { month: 'June 2026', totalGross: '$1,820,000', totalNet: '$1,390,000', taxDeductions: '$305,000', status: 'COMPLETED' },
    { month: 'May 2026', totalGross: '$1,790,000', totalNet: '$1,365,000', taxDeductions: '$300,000', status: 'COMPLETED' },
  ];

  return (
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={24} />
              Enterprise Payroll & Compensation Reports
            </h2>
            <p className="text-sm text-slate-400">
              Monthly payroll breakdowns, tax withholding summaries, and compensation analytics.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Download size={16} /> Export Payroll Ledger (.CSV)
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Current Month Payroll (Est.)</div>
            <div className="text-2xl font-black mt-1">$1,850,000</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-indigo-500">
            <div className="text-xs font-semibold text-slate-400">Total Tax & Benefits Withheld</div>
            <div className="text-2xl font-black mt-1">$430,000</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-purple-500">
            <div className="text-xs font-semibold text-slate-400">Average Salary per Head</div>
            <div className="text-2xl font-black mt-1">$112,500 / Yr</div>
          </div>
        </div>

        {/* Monthly Summary Table */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Historical Payroll Batches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Payroll Cycle</th>
                  <th className="py-3 px-4">Total Gross</th>
                  <th className="py-3 px-4">Total Net Pay</th>
                  <th className="py-3 px-4">Tax Withholdings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {payrollSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100">{item.month}</td>
                    <td className="py-3 px-4 text-slate-200">{item.totalGross}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{item.totalNet}</td>
                    <td className="py-3 px-4 text-slate-400">{item.taxDeductions}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <Button variant="ghost" size="sm" className="text-blue-400">Download Slip Batch</Button>
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
