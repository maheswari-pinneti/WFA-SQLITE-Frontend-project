import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Clock, CheckSquare, Calendar, AlertTriangle } from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const attendanceLogs = [
    { employee: 'Jane Doe', date: '2026-08-11', checkIn: '09:00 AM', checkOut: '05:00 PM', duration: '8h 0m', status: 'ON_TIME' },
    { employee: 'John Smith', date: '2026-08-11', checkIn: '09:30 AM', checkOut: '06:00 PM', duration: '8h 30m', status: 'LATE' },
    { employee: 'Bob Johnson', date: '2026-08-11', checkIn: '09:05 AM', checkOut: '05:05 PM', duration: '8h 0m', status: 'ON_TIME' },
    { employee: 'Alice Brown', date: '2026-08-11', checkIn: '—', checkOut: '—', duration: '—', status: 'ABSENT' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Time Roster database</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Attendance History Logs
            </h1>
            <p className="text-xs text-slate-400">
              Database logs of employee clock-in, clock-out events, geographical accuracy, and shift durations.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Avg Check-in Time" value="09:12 AM" icon={<Clock size={26} />} iconBgColor="emerald" trend="Standard variance" trendType="positive" />
          <MinimalKpiCard title="On-time Rate" value="94.2%" icon={<CheckSquare size={26} />} iconBgColor="blue" trend="Within boundary limit" trendType="positive" />
          <MinimalKpiCard title="Late Check-ins" value="12 cases" icon={<AlertTriangle size={26} />} iconBgColor="amber" trend="Alerts dispatched" trendType={undefined} />
          <MinimalKpiCard title="Approved Leaves" value="4 Employees" icon={<Calendar size={26} />} iconBgColor="purple" trend="Active leave balance" trendType="positive" />
        </div>

        {/* Log Table */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Daily Attendance Log Stream</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Total Duration</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{log.employee}</td>
                    <td className="p-3 text-slate-300 font-mono">{log.date}</td>
                    <td className="p-3 text-slate-400 font-bold">{log.checkIn}</td>
                    <td className="p-3 text-slate-400 font-bold">{log.checkOut}</td>
                    <td className="p-3 text-slate-400 font-mono">{log.duration}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${log.status === 'ON_TIME' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : log.status === 'LATE' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {log.status.replace('_', ' ')}
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
