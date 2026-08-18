import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { PERMISSION_MATRIX } from '../../../security/policies/permissionMatrix';
import { Check, Lock } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const roles = Object.values(Role);
  const permissions = Object.values(Permission);

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.ROLES_MANAGE}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Role & Permission Policy Matrix</h2>
          <p className="text-sm text-slate-400">Declarative Security policy mapping for fine-grained authorization</p>
        </div>

        <div className="glass-panel p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-300">Permission Scope</th>
                {roles.map((r) => (
                  <th key={r} className="py-3 px-4 font-bold text-center">
                    <span className={`badge badge-${r.toLowerCase().replace('_', '')}`}>
                      {r}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissions.map((perm) => (
                <tr key={perm} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-semibold">{perm}</td>
                  {roles.map((r) => {
                    const isGranted = PERMISSION_MATRIX[r].includes(perm);
                    return (
                      <td key={r} className="py-3 px-4 text-center">
                        {isGranted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center mx-auto">
                            <Lock size={12} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
};
