import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { ClipboardList, ShieldCheck, Activity, Users } from 'lucide-react';

export const AttendanceCorrectionsPage: React.FC = () => {
  const correctionRequests = [
    { employeeName: 'John Smith', date: '2026-08-10', originalTime: '09:42 AM', requestedTime: '09:05 AM', reason: 'Mobile GPS validation delay', status: 'PENDING' },
    { employeeName: 'Bob Johnson', date: '2026-08-09', originalTime: '—', requestedTime: '09:00 AM', reason: 'Missed card swipe at entrance lobby', status: 'PENDING' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-manager mb-1">Time Oversight Desk</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Attendance Correction Desk
            </h1>
            <p className="text-xs text-slate-400">
              Audit and process clock-in/out correction requests submitted by employees.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Pending Requests" value="2 Requests" icon={<ClipboardList size={26} />} iconBgColor="blue" trend="Requires processing" trendType={undefined} />
          <MinimalKpiCard title="Processing Rate" value="98.5%" icon={<ShieldCheck size={26} />} iconBgColor="emerald" trend="Optimal time compliance" trendType="positive" />
          <MinimalKpiCard title="Dispute Rate" value="Low" icon={<Activity size={26} />} iconBgColor="amber" trend="Minimal friction logs" trendType="positive" />
          <MinimalKpiCard title="Active Auditors" value="4 Staff" icon={<Users size={26} />} iconBgColor="purple" trend="Audit desk staffed" trendType="positive" />
        </div>

        {/* Corrections Stream */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Pending Clock Correction Requests</h3>
          <div className="space-y-3">
            {correctionRequests.map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{req.employeeName}</span>
                  <p className="text-xs text-slate-300">
                    Date: <span className="font-mono font-bold text-blue-400">{req.date}</span> — Original Clock: <span className="font-bold text-rose-400">{req.originalTime}</span>, Requested: <span className="font-bold text-emerald-400">{req.requestedTime}</span>
                  </p>
                  <p className="text-xs text-slate-400 italic">"Reason: {req.reason}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all">Approve</button>
                  <button className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
