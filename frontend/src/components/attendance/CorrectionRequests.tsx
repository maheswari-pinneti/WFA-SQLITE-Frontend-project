import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { attendanceService } from '../../services/attendance.service';
import { fetchAttendanceDataThunk, addNotification } from '../../store/attendanceSlice';
import { RootState } from '../../app/store';

export const CorrectionRequests: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { user } = useAuth();
  
  const [date, setDate] = useState('');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [reason, setReason] = useState('');

  const employeeId = user?.id || 'emp-001';
  const employeeName = user?.name || 'Alex Mercer';
  const department = user?.department || 'Engineering & Technology';

  const { corrections } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    dispatch(fetchAttendanceDataThunk(employeeId));
  }, [dispatch, employeeId]);

  // Filter requests to show only current employee's requests
  const myRequests = corrections.filter((c) => c.employeeId === employeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !checkIn || !checkOut || !reason) {
      dispatch(addNotification({ message: 'Please fill in all details.', type: 'warning' }));
      return;
    }

    try {
      await attendanceService.submitCorrectionRemote({
        employeeId,
        employeeName,
        department,
        date,
        requestedCheckIn: checkIn,
        requestedCheckOut: checkOut,
        reason,
      });
      dispatch(addNotification({ message: 'Correction request submitted for approval.', type: 'success' }));
      setDate('');
      setReason('');
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-slate-100">
      
      {/* Request Form */}
      <div className="lg:col-span-1 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" /> Request Attendance Correction
        </h3>
        <p className="text-xs text-slate-400">
          Request corrections for missing check-in/out records, network disruptions, or incorrect entries.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Req. Check-In Time</label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Req. Check-Out Time</label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Reason for correction</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Forgot to clock in / power outage"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send size={13} /> Submit Request
          </button>
        </form>
      </div>

      {/* History log */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-black text-white">Your Correction Logs</h3>
        <p className="text-xs text-slate-400">
          Track the approval progress of your submitted correction logs.
        </p>

        {myRequests.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No correction requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Requested Hours</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Manager Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-semibold text-white">{req.date}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {req.requestedCheckIn} - {req.requestedCheckOut}
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-[150px] truncate">{req.reason}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {req.status === 'Approved' && <CheckCircle2 size={10} />}
                        {req.status === 'Rejected' && <XCircle size={10} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 italic">
                      {req.managerComment || <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
