import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { Lock, Key, Search } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const PermissionsManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.ADMIN);
  const [filterQuery, setFilterQuery] = useState('');

  const allPermissions = Object.values(Permission);

  // Role permissions map simulation
  const rolePermissions: Record<Role, Permission[]> = {
    [Role.ADMIN]: allPermissions,
    [Role.HR]: [
      Permission.EMPLOYEE_VIEW,
      Permission.EMPLOYEE_CREATE,
      Permission.EMPLOYEE_UPDATE,
      Permission.ATTENDANCE_VIEW,
      Permission.ATTENDANCE_MANAGE,
      Permission.REPORT_VIEW,
      Permission.REPORT_GENERATE,
    ],
    [Role.MANAGER]: [
      Permission.EMPLOYEE_VIEW,
      Permission.ATTENDANCE_VIEW,
      Permission.ATTENDANCE_MANAGE,
      Permission.REPORT_VIEW,
      Permission.TEAM_ANALYTICS_VIEW,
    ],
    [Role.TEAM_LEAD]: [
      Permission.EMPLOYEE_VIEW,
      Permission.ATTENDANCE_VIEW,
      Permission.REPORT_VIEW,
      Permission.TASK_TRACK,
    ],
    [Role.EMPLOYEE]: [
      Permission.EMPLOYEE_VIEW,
      Permission.ATTENDANCE_VIEW,
      Permission.PROFILE_VIEW,
    ],
  };

  const currentPermissions = rolePermissions[selectedRole] || [];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="w-full space-y-6 animate-fadeIn font-sans pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--text-primary)]">
              <Lock className="text-indigo-400" size={24} />
              Granular Permission Matrix & Access Controls
            </h2>
            <p className="text-xs text-slate-400">
              Configure fine-grained system permissions and security scopes across enterprise roles.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Key size={16} /> Save Security Policies
          </Button>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 border border-[var(--border-color)] rounded-2xl overflow-x-auto">
          {Object.values(Role).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === r
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {r} Role
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search permission key..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs"
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            {currentPermissions.length} / {allPermissions.length} Active Grants
          </div>
        </div>

        {/* Permission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPermissions
            .filter((p) => p.toLowerCase().includes(filterQuery.toLowerCase()))
            .map((p) => {
              const granted = currentPermissions.includes(p);
              return (
                <div
                  key={p}
                  className={`p-4 rounded-2xl border transition-all ${
                    granted
                      ? 'bg-blue-600/10 border-blue-500/30 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold tracking-tight text-slate-200">{p}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        granted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {granted ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Enterprise RBAC Permission Key</p>
                </div>
              );
            })}
        </div>
      </div>
    </RoleGuard>
  );
};
