import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, GetEmployeesParams } from '../api/employeeApi';
import { Employee } from '../shared/types/common.types';

export const useEmployees = (params?: GetEmployeesParams) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApi.getEmployees(params),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (newEmployee: Omit<Employee, 'id'> & { id?: string }) => employeeApi.createEmployee(newEmployee),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => employeeApi.updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => employeeApi.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Employee['status'] }) => employeeApi.updateEmployeeStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees: employeesQuery.data?.employees || [],
    pagination: employeesQuery.data?.pagination || { page: 1, pageSize: 25, totalItems: 0, totalPages: 1 },
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    error: employeesQuery.error,
    refetch: employeesQuery.refetch,
    
    createEmployee: createEmployeeMutation.mutateAsync,
    isCreating: createEmployeeMutation.isPending,
    
    updateEmployee: updateEmployeeMutation.mutateAsync,
    isUpdating: updateEmployeeMutation.isPending,
    
    deleteEmployee: deleteEmployeeMutation.mutateAsync,
    isDeleting: deleteEmployeeMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending
  };
};

export const useEmployeeById = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getEmployeeById(id),
    enabled: !!id,
  });
};
