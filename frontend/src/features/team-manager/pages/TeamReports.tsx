import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { ExportReport } from '../../reports/components/ExportReport';

export const TeamReports: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Team Reports & Exports</h2>
          <p className="text-sm text-slate-400">Generate and export engineering squad capacity & velocity reports</p>
        </div>

        <ExportReport title="Export Team Velocity & Sprint Report" />
      </div>
    </RoleGuard>
  );
};
