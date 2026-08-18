import React from 'react';
import { Permission } from '../permissions/permissions';
import { usePermission } from '../../shared/hooks/usePermission';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  requiredPermission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  fallback,
  children,
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(requiredPermission);
  const reason = `Your active security scope does not permit '${requiredPermission}'.`;

  if (!allowed) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="glass-panel p-8 text-center my-8 max-w-lg mx-auto border-red-500/20">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Permission Denied</h3>
        <p className="text-sm text-secondary mb-4">
          {reason || `Your active security scope does not permit '${requiredPermission}'.`}
        </p>
        <span className="inline-block text-xs font-mono bg-red-500/10 text-red-400 px-3 py-1 rounded">
          Required Flag: {requiredPermission}
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
