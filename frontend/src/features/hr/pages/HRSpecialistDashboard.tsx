import React from 'react';
import { Users, Calendar, Briefcase, Clock, FileSpreadsheet } from 'lucide-react';

export const HRSpecialistDashboard: React.FC = () => {
  const candidates = [
    { name: 'Michael Faraday', role: 'Staff Frontend Engineer', stage: 'Technical Interview', status: 'SCHEDULED' },
    { name: 'Ada Lovelace', role: 'Principal Systems Architect', stage: 'Final Leadership Round', status: 'IN_REVIEW' },
    { name: 'Alan Turing', role: 'Senior AI Specialist', stage: 'Offer Stage', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-hr mb-1">HR Specialist Desk</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Recruitment & Operations Operations Desk
          </h1>
          <p className="text-xs text-slate-400">
            Manage active candidate pipelines, interview schedules, shift rotations, and salary reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
            Recruitment Desk Scope
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Candidates</span>
            <Users size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">18 Pipeline</p>
          <p className="text-[11px] text-emerald-400 font-bold">3 Offers Pending</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Interviews Today</span>
            <Calendar size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">4 Scheduled</p>
          <p className="text-[11px] text-blue-400 font-bold">Next: 2:30 PM (Ada L.)</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Shift Rotations</span>
            <Clock size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">100% Filled</p>
          <p className="text-[11px] text-slate-400">All Shifts Covered</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Salary Reports</span>
            <FileSpreadsheet size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">Q2 Audit Ready</p>
          <p className="text-[11px] text-emerald-400 font-bold">Read-only Verified</p>
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Briefcase size={18} className="text-purple-400" /> Active Candidate Recruitment Pipeline
        </h3>

        <div className="space-y-2">
          {candidates.map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">{c.name}</p>
                <p className="text-xs text-slate-400">{c.role} • <span className="text-purple-400 font-medium">{c.stage}</span></p>
              </div>
              <span className="badge badge-success text-[10px]">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
