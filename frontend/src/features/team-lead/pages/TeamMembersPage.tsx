import React from 'react';
import { useEmployees } from '../../../hooks/useEmployees';
import { useQuery } from '@tanstack/react-query';
import { workforceApi } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';

export const TeamMembersPage: React.FC = () => {
  const { employees, isLoading: employeesLoading } = useEmployees();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => workforceApi.getTasks(),
  });

  const isLoading = employeesLoading || tasksLoading;

  if (isLoading) {
    return <div className="text-sm text-[var(--text-muted)]">Loading team members...</div>;
  }

  const members = employees.map((employee: Employee) => ({
    name: employee.name,
    role: employee.designation || employee.role,
    status: employee.status,
    task: (tasks || []).find((task: any) => task.assigneeId === employee.id)?.title || 'No active task',
    velocity: `${Math.round(employee.performanceScore || 0)}%`,
    avatar: employee.avatar
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Team Lead Operational Roster</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Team Members & Direct Reports Roster
          </h1>
          <p className="text-xs text-slate-400">
            Monitor real-time active sprint assignments, individual velocity, and team member statuses.
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No team members are available in your scope.</p> : members.map((m, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-3">
              <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-md" />
              <div>
                <h4 className="font-bold text-base text-[var(--text-primary)]">{m.name}</h4>
                <p className="text-xs text-slate-400">{m.role}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Task:</span>
                <span className="font-semibold text-blue-400">{m.task}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sprint Velocity:</span>
                <span className="font-bold text-emerald-400">{m.velocity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
