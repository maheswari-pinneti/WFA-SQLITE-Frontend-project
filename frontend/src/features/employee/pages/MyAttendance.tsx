import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store';
import { fetchAttendanceDataThunk } from '../../../store/attendanceSlice';
import { useAuth } from '../../../auth/hooks/useAuth';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const MyAttendance: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { records } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    if (user?.id) dispatch(fetchAttendanceDataThunk(user.id));
  }, [dispatch, user?.id]);

  const history = records.map((record) => ({
    date: new Date(record.date).toLocaleDateString(),
    in: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    out: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
    hours: `${record.checkOutTime ? Math.max(0, (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / 3600000).toFixed(2) : '—'} hrs`,
    mode: record.workMode,
    status: record.status
  }));

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">My Personal Attendance & Shift Tracker</h2>
        <p className="text-xs text-slate-400 mt-1">Review live check-in timestamps, total hours in office, break times, and monthly calendar history.</p>
      </div>

      {/* Live Check-In / Check-Out Widget */}
      <LiveCheckInWidget />

      {/* Monthly Attendance Calendar */}
      <AttendanceCalendarView />

      <AnalyticsOverview title="My Attendance Analytics" subtitle="Personal attendance trends and authorized workforce context" compact />

      {/* Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Recent Daily Punch Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Total Office Hours</th>
                <th className="py-3 px-4">Work Mode</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{h.date}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.in}</td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold">{h.out}</td>
                  <td className="py-3 px-4 font-mono text-blue-400 font-bold">{h.hours}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{h.mode}</span></td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      h.status === 'Checked In' || h.status === 'Working' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
