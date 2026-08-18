import { User } from '../auth/types/auth.types';

export const filterExportData = (data: any[], user: User | null): any[] => {
  if (!user) return [];

  const role = String(user.role).toUpperCase();

  if (role === 'ADMIN') {
    return data;
  }

  if (role === 'HR' || role === 'HR_MANAGER') {
    return data.filter(
      (item) => item.departmentId === 'D001' || item.department === 'HR' || item.department === 'Human Resources'
    );
  }

  return data.filter((item) => {
    if (user.departmentId && item.departmentId === user.departmentId) return true;
    if (user.department && item.department === user.department) return true;
    return false;
  });
};
