import { apiClient } from '../../services/api';

export interface AnalyticsData {
  scope: {
    role: string;
    organizationId: string;
    department: string | null;
    team: string | null;
    employeeId: string | null;
  };
  metrics: Record<string, number | string>;
  growthData: Array<{ name: string; headcount: number; hiring: number }>;
  workforceGrowth: Array<{ name: string; headcount: number; hiring: number }>;
  attendanceOverview: Array<{ name: string; present: number; absent: number; late: number }>;
  departmentComparison: Array<{ name: string; headcount: number; performance: number; attendance: number }>;
  departmentDistribution: Array<{ name: string; value: number }>;
  roleDistribution: Array<{ name: string; value: number }>;
  employmentStatus: Array<{ name: string; value: number }>;
  workforceDistribution: Array<{ name: string; value: number }>;
  riskDistribution: Array<{ name: string; value: number }>;
  skillsAnalysis: {
    topSkills: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
    missingSkills: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
    coverage: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
  };
  teamProductivity: Array<{ name: string; productivity: number; members: number }>;
  performance: Array<{ name: string; performance: number; target: number; productivity: number }>;
}

const unwrap = <T,>(response: { data?: { success?: boolean; data?: T; message?: string } }): T => {
  if (response.data?.success && response.data.data !== undefined) return response.data.data;
  throw new Error(response.data?.message || 'Unable to load analytics data.');
};

export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    return unwrap(await apiClient.get('/v1/analytics'));
  },
  async getShifts(): Promise<Array<{ name: 'Regular' | 'Flexible' | 'Overnight'; startTime: string; endTime: string }>> {
    return unwrap(await apiClient.get('/v1/attendance/shifts'));
  },
  async getAuditLogs(): Promise<Array<{ id: string; timestamp: string; employeeId: string; action: string; details: string }>> {
    return unwrap(await apiClient.get('/v1/attendance/audit-logs'));
  }
};
