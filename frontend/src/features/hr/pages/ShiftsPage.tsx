import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Clock, ShieldCheck, Activity, Users } from 'lucide-react';

export const ShiftsPage: React.FC = () => {
  const corporateShifts = [
    { name: 'Standard Day Shift', schedule: '09:00 AM - 05:00 PM', compliance: '100% compliant', allocated: 215 },
    { name: 'US Core Business Hours', schedule: '06:30 PM - 02:30 AM', compliance: '98.5% compliant', allocated: 58 },
    { name: 'UK Support Hours', schedule: '01:30 PM - 09:30 PM', compliance: '100% compliant', allocated: 28 }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-manager mb-1">Operations Planning</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Shifts & Rosters Registry
            </h1>
            <p className="text-xs text-slate-400">
              Configure organizational shifts, business hours rules, and team member schedule allocations.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Configured Shifts" value="3 Core Shifts" icon={<Clock size={26} />} iconBgColor="blue" trend="Day, Late, Night shifts" trendType="positive" />
          <MinimalKpiCard title="Allocated Headcount" value="301 Employees" icon={<Users size={26} />} iconBgColor="emerald" trend="100% rostered" trendType="positive" />
          <MinimalKpiCard title="Roster Adherence" value="98.5%" icon={<ShieldCheck size={26} />} iconBgColor="purple" trend="Zero missing allocations" trendType="positive" />
          <MinimalKpiCard title="Schedule Variance" value="Low" icon={<Activity size={26} />} iconBgColor="amber" trend="Consistent timeline" trendType="positive" />
        </div>

        {/* Shift Roster */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Standard Corporate Roster Rules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Shift Name</th>
                  <th className="p-3">Standard Schedule Hours</th>
                  <th className="p-3">Average compliance</th>
                  <th className="p-3">Allocated Headcount</th>
                </tr>
              </thead>
              <tbody>
                {corporateShifts.map((shift, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{shift.name}</td>
                    <td className="p-3 text-slate-300 font-mono">{shift.schedule}</td>
                    <td className="p-3 text-emerald-400 font-bold uppercase">{shift.compliance}</td>
                    <td className="p-3 font-bold text-blue-400">{shift.allocated} Staff</td>
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
