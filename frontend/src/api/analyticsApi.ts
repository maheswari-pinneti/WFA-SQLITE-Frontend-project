import { apiClient } from './client';
import { AnalyticsData } from './endpoints/analytics.api';

export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await apiClient.get('/v1/analytics');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load analytics.');
  },

  getDashboardSummary: async (): Promise<{
    totalHeadcount: number;
    activePresent: number;
    lateArrivals: number;
    riskFlags: number;
    attendanceRate: number;
  }> => {
    const response = await apiClient.get('/v1/dashboard/summary');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load dashboard summary.');
  },

  getWorkforceDistribution: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/workforce');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load workforce distribution.');
  },

  getHeadcountAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/headcount');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load headcount distribution.');
  },

  getRiskAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/risk');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load risk analytics.');
  },

  getEmployeeGrowth: async (): Promise<Array<{ name: string; headcount: number; hiring: number }>> => {
    const response = await apiClient.get('/v1/analytics/employee-growth');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load employee growth analytics.');
  },

  getAttendanceTrend: async (): Promise<Array<{ name: string; present: number; absent: number }>> => {
    const response = await apiClient.get('/v1/analytics/attendance-trend');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load attendance trend.');
  },

  getPerformanceAnalytics: async (): Promise<Array<{ name: string; performance: number; target: number; productivity: number }>> => {
    const response = await apiClient.get('/v1/analytics/performance');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load performance analytics.');
  },

  getDepartments: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/departments');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load departments.');
  },

  getLocations: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/locations');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to load locations.');
  }
};
