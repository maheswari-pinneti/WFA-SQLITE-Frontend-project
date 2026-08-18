import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['attendanceToday'],
    queryFn: () => attendanceApi.getTodayAttendance(),
  });
};

export const useAttendanceRecords = (params?: { employeeId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['attendanceRecords', params],
    queryFn: () => attendanceApi.getRecords(params),
  });
};

export const useShifts = () => {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: () => attendanceApi.getShifts(),
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['attendanceAuditLogs'],
    queryFn: () => attendanceApi.getAuditLogs(),
  });
};

export const useCorrections = () => {
  return useQuery({
    queryKey: ['corrections'],
    queryFn: () => attendanceApi.getCorrections(),
  });
};

export const useAttendanceMutations = () => {
  const queryClient = useQueryClient();

  const checkIn = useMutation({
    mutationFn: (params: { workMode: 'Office' | 'Remote'; latitude?: number; longitude?: number }) => attendanceApi.checkIn(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });

  const takeBreak = useMutation({
    mutationFn: () => attendanceApi.takeBreak(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });

  const resumeWork = useMutation({
    mutationFn: () => attendanceApi.resumeWork(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });

  const checkOut = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });

  const submitCorrection = useMutation({
    mutationFn: (params: { attendanceId: string; requestedCheckIn?: string; requestedCheckOut?: string; reason: string }) =>
      attendanceApi.submitCorrection(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });

  const reviewCorrection = useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: 'APPROVED' | 'REJECTED'; comment?: string }) =>
      attendanceApi.reviewCorrection(id, status, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corrections'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });

  return {
    checkIn: checkIn.mutateAsync,
    isCheckingIn: checkIn.isPending,
    
    takeBreak: takeBreak.mutateAsync,
    isTakingBreak: takeBreak.isPending,
    
    resumeWork: resumeWork.mutateAsync,
    isResumingWork: resumeWork.isPending,
    
    checkOut: checkOut.mutateAsync,
    isCheckingOut: checkOut.isPending,
    
    submitCorrection: submitCorrection.mutateAsync,
    isSubmittingCorrection: submitCorrection.isPending,
    
    reviewCorrection: reviewCorrection.mutateAsync,
    isReviewingCorrection: reviewCorrection.isPending
  };
};
