import { Role } from '../../security/roles/roles';

export const getRoleBadgeClass = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return 'badge-admin';
    case Role.HR:
      return 'badge-hr';
    case Role.MANAGER:
      return 'badge-manager';
    case Role.TEAM_LEAD:
      return 'badge-lead';
    case Role.EMPLOYEE:
      return 'badge-employee';
    default:
      return 'badge-employee';
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};
