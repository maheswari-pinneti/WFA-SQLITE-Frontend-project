import React, { useEffect, useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (user?.id) dispatch(fetchAttendanceDataThunk(user.id));
  }, [dispatch, user?.id]);

  const history = records.map((record) => {
    const totalBreakMs = record.breaks ? record.breaks.reduce((acc: number, b: any) => {
      const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
      const start = new Date(b.startTime).getTime();
      return acc + (end - start);
    }, 0) : 0;
    
    const breakHours = (totalBreakMs / 3600000).toFixed(2);
    const breakStr = `${breakHours} hrs`;

    const totalWorkMs = record.checkOutTime 
      ? (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) 
      : (Date.now() - new Date(record.checkInTime).getTime());
    
    const netWorkMs = Math.max(0, totalWorkMs - totalBreakMs);
    const workingHours = (netWorkMs / 3600000).toFixed(2);
    const workingTimeStr = `${workingHours} hrs`;

    // Late calculation (Shift start: 9:00 AM)
    const checkInDate = new Date(record.checkInTime);
    const checkInHour = checkInDate.getHours();
    const checkInMin = checkInDate.getMinutes();
    const lateMinutes = (checkInHour * 60 + checkInMin) - (9 * 60);
    const lateStr = lateMinutes > 0 ? `${lateMinutes} mins` : 'On Time';

    // Overtime calculation (Standard work day: 8 hours)
    const netHours = netWorkMs / 3600000;
    const overtimeHrs = netHours > 8 ? (netHours - 8).toFixed(2) : '0.00';
    const overtimeStr = `${overtimeHrs} hrs`;

    return {
      date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      in: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      out: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
      workingTime: workingTimeStr,
      break: breakStr,
      late: lateStr,
      overtime: overtimeStr,
      status: (record.status || (record.checkOutTime ? 'Checked Out' : 'Working')) as string
    };
  });

  // Extract unique statuses for dropdown filtering
  const availableStatuses = ['All', ...Array.from(new Set(history.map(h => h.status)))];

  const filteredHistory = history.filter(h => 
    statusFilter === 'All' || h.status.toLowerCase() === statusFilter.toLowerCase()
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-white">Recent Daily Punch Logs</h3>
          
          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer font-semibold"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Working Time</th>
                <th className="py-3 px-4">Break</th>
                <th className="py-3 px-4">Late</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredHistory.map((h, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{h.date}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.in}</td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold">{h.out}</td>
                  <td className="py-3 px-4 font-mono text-blue-400 font-bold">{h.workingTime}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{h.break}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.late === 'On Time' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {h.late}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-400">{h.overtime}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      h.status === 'Checked In' || h.status === 'Working' || h.status === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : h.status === 'Absent'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
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
