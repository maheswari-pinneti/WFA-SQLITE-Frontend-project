import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Briefcase, Plus } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const RecruitmentManagement: React.FC = () => {
  const [candidates] = useState([
    { id: 'cand-1', name: 'Sophia Martinez', position: 'Senior Staff Engineer', dept: 'Engineering', stage: 'INTERVIEW', priority: 'URGENT' },
    { id: 'cand-2', name: 'Daniel Kim', position: 'Lead Product Designer', dept: 'Design', stage: 'SCREENING', priority: 'HIGH' },
    { id: 'cand-3', name: 'Emily Chen', position: 'HR Business Partner', dept: 'Human Resources', stage: 'OFFER', priority: 'MEDIUM' },
    { id: 'cand-4', name: 'James Wilson', position: 'DevOps Specialist', dept: 'Engineering', stage: 'HIRED', priority: 'URGENT' },
  ]);

  return (
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Briefcase className="text-amber-400" size={24} />
              Talent Acquisition & Candidate Pipeline
            </h2>
            <p className="text-sm text-slate-400">
              Manage open requisitions, candidate Kanban pipeline stages, and interview schedules.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Open New Job Requisition
          </Button>
        </div>

        {/* Pipeline Stage Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 border-t-4 border-blue-500">
            <div className="text-xs font-bold text-slate-400">Screening</div>
            <div className="text-2xl font-black text-slate-100 mt-1">12 Candidates</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-purple-500">
            <div className="text-xs font-bold text-slate-400">Interviewing</div>
            <div className="text-2xl font-black text-slate-100 mt-1">8 Active</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-amber-500">
            <div className="text-xs font-bold text-slate-400">Offers Extended</div>
            <div className="text-2xl font-black text-slate-100 mt-1">3 Pending</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-emerald-500">
            <div className="text-xs font-bold text-slate-400">Hired (This Month)</div>
            <div className="text-2xl font-black text-slate-100 mt-1">6 Onboarded</div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Active Applicants</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100">{cand.name}</td>
                    <td className="py-3 px-4 text-slate-300">{cand.position}</td>
                    <td className="py-3 px-4 text-slate-400">{cand.dept}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {cand.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${cand.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {cand.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">Review Profile</Button>
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
