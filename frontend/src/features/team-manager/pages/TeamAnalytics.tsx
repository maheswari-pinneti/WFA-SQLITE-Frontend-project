import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const TeamAnalytics: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Team Performance & Analytics</h2>
          <p className="text-sm text-slate-400">Deep-dive metrics into team output, commit velocity, and attendance</p>
        </div>

        <AnalyticsOverview title="Team Performance & Attendance" subtitle="Live performance, attendance, productivity and skill coverage for your authorized scope" compact />
      </div>
    </RoleGuard>
  );
};
