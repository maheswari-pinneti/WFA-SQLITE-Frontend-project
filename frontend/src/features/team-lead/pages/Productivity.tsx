import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

export const Productivity: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Lead Productivity Matrix</h2>
          <p className="text-sm text-slate-400">Evaluate individual developer throughput and code quality trends</p>
        </div>

        <AnalyticsOverview title="Lead Productivity Matrix" subtitle="Live productivity, performance and skill-gap analytics for your authorized team" compact />
      </div>
    </RoleGuard>
  );
};
