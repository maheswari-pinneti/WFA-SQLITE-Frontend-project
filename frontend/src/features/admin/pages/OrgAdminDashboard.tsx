import React from 'react';
import { Building2, MapPin, Users, GitBranch } from 'lucide-react';

export const OrgAdminDashboard: React.FC = () => {
  const departments = [
    { name: 'Engineering', head: 'Marcus Vance', headcount: 42, location: 'Hyderabad, Bengaluru' },
    { name: 'Product Management', head: 'Sarah Connor', headcount: 42, location: 'Hyderabad, Visakhapatnam' },
    { name: 'Sales & Marketing', head: 'David Sterling', headcount: 42, location: 'Chennai, Kochi' },
    { name: 'Human Resources', head: 'Elena Rostova', headcount: 42, location: 'Bengaluru, Chennai' },
    { name: 'Customer Success', head: 'Alex Mercer', headcount: 41, location: 'Kochi, Hyderabad' },
    { name: 'Finance & Operations', head: 'Finance Manager', headcount: 41, location: 'Visakhapatnam, Bengaluru' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-manager mb-1">Organization Governance</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Organization & Corporate Hierarchy Desk
          </h1>
          <p className="text-xs text-slate-400">
            Structure corporate entities, global office locations, department boundaries, and headcount limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
            Stackly Global Enterprise Inc.
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Headcount</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">301 Employees</p>
          <p className="text-[11px] text-emerald-400 font-bold">+12% Growth Q2</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Departments</span>
            <Building2 size={18} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">6 Active</p>
          <p className="text-[11px] text-slate-400">Full Structural Coverage</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Global Locations</span>
            <MapPin size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">4 Offices</p>
          <p className="text-[11px] text-purple-400 font-bold">SF, NY, London, Tokyo</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Reporting Line</span>
            <GitBranch size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">100% Mapped</p>
          <p className="text-[11px] text-emerald-400 font-bold">Zero Unassigned Staff</p>
        </div>
      </div>

      {/* Departments Overview */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Building2 size={18} className="text-indigo-400" /> Corporate Department Hierarchy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--text-primary)]">{dept.name}</span>
                <span className="badge badge-info text-[10px]">{dept.headcount} Staff</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Users size={14} /> Department Head: <span className="font-semibold text-slate-200">{dept.head}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={14} /> Locations: <span className="font-medium text-slate-300">{dept.location}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
