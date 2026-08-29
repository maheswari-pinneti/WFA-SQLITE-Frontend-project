import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { ClipboardList, ShieldCheck, Activity, Users, CheckCircle2, XCircle } from 'lucide-react';
import { attendanceApi, CorrectionRequest } from '../../../api/attendanceApi';

export const AttendanceCorrectionsPage: React.FC = () => {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.getCorrections();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await attendanceApi.reviewCorrection(id, status, `Reviewed and ${status.toLowerCase()} by manager`);
      await loadRequests();
    } catch (err) {
      console.error('Failed to review correction:', err);
    }
  };

  const pendingRequests = requests.filter(r => r.status.toLowerCase() === 'pending');

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10 font-sans">
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
          <MinimalKpiCard title="Pending Requests" value={`${pendingRequests.length} Requests`} icon={<ClipboardList size={26} />} iconBgColor="blue" trend="Requires processing" trendType={undefined} />
          <MinimalKpiCard title="Total Audited" value={`${requests.length - pendingRequests.length} Requests`} icon={<ShieldCheck size={26} />} iconBgColor="emerald" trend="Completed audits" trendType="positive" />
          <MinimalKpiCard title="Total Received" value={`${requests.length} Logs`} icon={<Activity size={26} />} iconBgColor="amber" trend="Overall request volume" trendType="positive" />
          <MinimalKpiCard title="Access Policy" value="Audit Mode" icon={<Users size={26} />} iconBgColor="purple" trend="Manager & HR Authorized" trendType="positive" />
        </div>

        {/* Corrections Stream */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Clock Correction Streams</h3>
          
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 font-semibold">
              No correction requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-slate-800">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{req.employeeName}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">ID: {req.employeeId}</span>
                    <p className="text-xs text-slate-300">
                      Date: <span className="font-mono font-bold text-blue-400">{req.date}</span> — Requested Clock: <span className="font-bold text-emerald-400">{req.requestedCheckIn || '—'} - {req.requestedCheckOut || '—'}</span>
                    </p>
                    <p className="text-xs text-slate-400 italic">"Reason: {req.reason}"</p>
                    {req.managerComment && (
                      <p className="text-[11px] text-slate-500 mt-1">Comment: <span className="italic">"{req.managerComment}"</span></p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {req.status.toLowerCase() === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleReview(req.id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReview(req.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        req.status.toLowerCase() === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {req.status.toLowerCase() === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};
