import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, ShieldAlert, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Role } from '../../security/roles/roles';
import { attendanceService } from '../../services/attendance.service';
import { syncLocalData, addNotification } from '../../store/attendanceSlice';
import { RootState } from '../../app/store';

export const ManagerApprovals: React.FC = () => {
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const { corrections } = useSelector((state: RootState) => state.attendance);

  const [comment, setComment] = useState<Record<string, string>>({});
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  const employeeId = user?.id || 'emp-001';
  const reviewerName = user?.name || 'Manager';
  const managerDept = user?.department || 'Engineering & Technology';

  useEffect(() => {
    dispatch(syncLocalData({ employeeId }));
  }, [dispatch, employeeId]);

  // Enforce access control permissions:
  // Managers can only see requests from their department (DBAC boundary)
  // HR & Admin have wider system-wide access to all requests.
  const isHRorAdmin = role === Role.HR || role === Role.ADMIN;
  const isManager = role === Role.MANAGER || role === Role.TEAM_LEAD;

  if (!isHRorAdmin && !isManager) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center font-sans space-y-3">
        <ShieldAlert className="mx-auto text-rose-500" size={32} />
        <h4 className="text-sm font-black text-white">Access Denied</h4>
        <p className="text-xs text-slate-400">
          Only Managers, HR Ops, and Administrators are authorized to access the approval workflows.
        </p>
      </div>
    );
  }

  const filtered = corrections.filter((req) => {
    // 1. Department checks
    if (!isHRorAdmin) {
      if (req.department !== managerDept) return false;
    } else {
      if (filterDept !== 'All' && req.department !== filterDept) return false;
    }

    // 2. Status checks
    if (filterStatus !== 'All' && req.status !== filterStatus) return false;

    return true;
  });

  const handleReview = async (reqId: string, status: 'Approved' | 'Rejected') => {
    const reqComment = comment[reqId]?.trim() || '';
    if (status === 'Rejected' && !reqComment) {
      dispatch(addNotification({ message: 'Please provide a comment for rejection.', type: 'warning' }));
      return;
    }

    try {
      await attendanceService.reviewCorrectionRemote(reqId, status, reqComment || `${status} by ${reviewerName}`);
      dispatch(addNotification({ message: `Request successfully ${status.toLowerCase()}!`, type: 'success' }));
      dispatch(syncLocalData({ employeeId }));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleCommentChange = (reqId: string, text: string) => {
    setComment((prev) => ({ ...prev, [reqId]: text }));
  };

  // Get unique list of departments for filtering (if HR/Admin)
  const departmentsList = Array.from(new Set(corrections.map((c) => c.department)));

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 font-sans text-slate-100">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white">Pending Attendance Corrections</h3>
          <p className="text-xs text-slate-400">
            {isHRorAdmin ? 'System-Wide Dashboard (HR & Admin Scopes)' : `Departmental Scope: ${managerDept}`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {isHRorAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter size={12} /> Dept:
              </span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests table list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <AlertCircle size={20} className="text-slate-600" />
          <span>No matching correction requests pending your review.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{req.employeeName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    {req.department}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-slate-400">
                  <div>
                    <span className="text-slate-500 font-medium">Request Date:</span>{' '}
                    <span className="font-bold text-slate-300">{req.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Req. Shift:</span>{' '}
                    <span className="font-mono font-bold text-blue-400">
                      {req.requestedCheckIn} - {req.requestedCheckOut}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 italic bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                  <span className="text-slate-500 not-italic font-bold">Reason:</span> "{req.reason}"
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {req.status === 'Pending' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Add reviewer comment..."
                      value={comment[req.id] || ''}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none w-full sm:w-[180px]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(req.id, 'Approved')}
                        className="flex-1 sm:flex-initial p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(req.id, 'Rejected')}
                        className="flex-1 sm:flex-initial p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      req.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {req.status}
                    </span>
                    <p className="text-[10px] text-slate-500 italic max-w-[200px] truncate">
                      {req.managerComment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
