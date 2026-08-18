import { Role } from '../../security/roles/roles';
import { analyticsApi } from './analytics.api';

export const dashboardApi = {
  getRoleDashboardMetrics: async (role: Role) => {
    void role;
    return analyticsApi.getAnalytics();
  }
};
