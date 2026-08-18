import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getAnalytics(),
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => analyticsApi.getDashboardSummary(),
  });
};

export const useWorkforceDistribution = () => {
  return useQuery({
    queryKey: ['workforceDistribution'],
    queryFn: () => analyticsApi.getWorkforceDistribution(),
  });
};

export const useHeadcountAnalytics = () => {
  return useQuery({
    queryKey: ['headcountAnalytics'],
    queryFn: () => analyticsApi.getHeadcountAnalytics(),
  });
};

export const useRiskAnalytics = () => {
  return useQuery({
    queryKey: ['riskAnalytics'],
    queryFn: () => analyticsApi.getRiskAnalytics(),
  });
};

export const useEmployeeGrowth = () => {
  return useQuery({
    queryKey: ['employeeGrowth'],
    queryFn: () => analyticsApi.getEmployeeGrowth(),
  });
};

export const useAttendanceTrend = () => {
  return useQuery({
    queryKey: ['attendanceTrend'],
    queryFn: () => analyticsApi.getAttendanceTrend(),
  });
};

export const usePerformanceAnalytics = () => {
  return useQuery({
    queryKey: ['performanceAnalytics'],
    queryFn: () => analyticsApi.getPerformanceAnalytics(),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => analyticsApi.getDepartments(),
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => analyticsApi.getLocations(),
  });
};
