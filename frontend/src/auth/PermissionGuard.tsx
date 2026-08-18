import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Permission } from '../security/permissions/permissions';

interface PermissionGuardProps {
  requiredPermission: Permission | string;
  fallbackRoute?: string;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  fallbackRoute = '/403',
  children,
}) => {
  const { permissions, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = permissions.includes(requiredPermission as Permission);

  if (!hasAccess) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};
