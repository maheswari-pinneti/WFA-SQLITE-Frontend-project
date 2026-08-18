import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MessageSquare, Plus, Star, User } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const FeedbackManagement: React.FC = () => {
  const [feedbacks] = useState([
    { id: 'fb-1', empName: 'Sophia Martinez', reviewer: 'Team Lead (Chloe)', date: '2026-07-28', rating: 5, comment: 'Exceptional architectural lead on the microservice migration project.' },
    { id: 'fb-2', empName: 'Daniel Kim', reviewer: 'Team Lead (Chloe)', date: '2026-07-25', rating: 4, comment: 'Great UX design contributions. High attention to detail.' },
    { id: 'fb-3', empName: 'James Wilson', reviewer: 'Team Lead (Chloe)', date: '2026-07-18', rating: 4, comment: 'Strong performance on CI/CD pipeline automation.' },
  ]);

  return (
    <RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.MANAGER, Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <MessageSquare className="text-blue-400" size={24} />
              Team Feedback & 1-on-1 Growth Tracker
            </h2>
            <p className="text-sm text-slate-400">
              Log peer feedback, performance notes, and 1-on-1 sprint review summaries for team members.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Log 1-on-1 Feedback
          </Button>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" />
                  {fb.empName}
                </span>
                <div className="flex items-center text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <span className="text-xs font-bold ml-1">{fb.rating}/5</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"{fb.comment}"</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {fb.reviewer}</span>
                <span>{fb.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
};
