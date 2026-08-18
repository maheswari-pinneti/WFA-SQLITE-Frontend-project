import React from 'react';
import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';
import { usePermission } from '../../shared/hooks/usePermission';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  fallback,
  children
}) => {
  const { isRoleAllowed, canAccess } = usePermission();

  const roleGranted = allowedRoles ? isRoleAllowed(allowedRoles) : true;
  const permissionGranted = requiredPermission ? canAccess(requiredPermission) : true;

  if (!roleGranted || !permissionGranted) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="glass-panel p-8 text-center my-8 max-w-lg mx-auto border-red-500/20">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
        <p className="text-sm text-secondary mb-4">
          Your active security role does not have permission to view or execute this resource.
        </p>
        <span className="inline-block text-xs font-mono bg-red-500/10 text-red-400 px-3 py-1 rounded">
          {requiredPermission ? `Required Permission: ${requiredPermission}` : `Allowed Roles: ${allowedRoles?.join(', ')}`}
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
