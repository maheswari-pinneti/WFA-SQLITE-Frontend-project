import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Target, Plus, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const MyGoalsPage: React.FC = () => {
  const [goals] = useState([
    { id: 'goal-1', title: 'Complete Advanced React Architecture Certification', category: 'OKRs', progress: 85, dueDate: '2026-08-30', status: 'IN_PROGRESS' },
    { id: 'goal-2', title: 'Refactor Core Microservices API Gateway', category: 'KPIs', progress: 100, dueDate: '2026-07-15', status: 'COMPLETED' },
    { id: 'goal-3', title: 'Achieve 99.9% Test Code Coverage in Unit Tests', category: 'SKILLS', progress: 60, dueDate: '2026-09-15', status: 'IN_PROGRESS' },
  ]);

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Target className="text-rose-400" size={24} />
              My Professional Goals & OKRs
            </h2>
            <p className="text-sm text-slate-400">
              Track quarterly key results, personal development targets, and skill progression.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Add New Goal
          </Button>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((g) => (
            <div key={g.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {g.category}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-100">{g.title}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    g.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {g.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Target Progress</span>
                  <span className="text-slate-200 font-bold">{g.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1"><Clock size={13} /> Due: {g.dueDate}</span>
                <Button variant="ghost" size="sm">Update Progress</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
};
