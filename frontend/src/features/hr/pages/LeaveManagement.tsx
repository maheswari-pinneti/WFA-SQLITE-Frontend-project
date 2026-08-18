import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { FileText } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { LeaveRequest, workforceApi } from '../../../api/endpoints/workforce.api';

export const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const loadRequests = async () => setRequests(await workforceApi.getLeaveRequests());
  useEffect(() => { void loadRequests().catch(() => setRequests([])); }, []);

  const handleAction = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    await workforceApi.reviewLeaveRequest(id, newStatus);
    await loadRequests();
  };

  return (
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <FileText className="text-blue-400" size={24} />
              Enterprise Leave Policy & Request Management
            </h2>
            <p className="text-sm text-slate-400">
              Review company-wide PTO balances, approve leave applications, and set holiday calendars.
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Leave Requests Inbox</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approve / Reject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100">{req.employeeName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{Math.max(1, Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000) + 1)} Days</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{req.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {req.status === 'PENDING' ? (
                        <>
                          <Button variant="primary" size="sm" onClick={() => handleAction(req.id, 'APPROVED')}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-400" onClick={() => handleAction(req.id, 'REJECTED')}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold">Processed</span>
                      )}
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
