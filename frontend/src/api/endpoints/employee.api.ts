import { Employee } from '../../shared/types/common.types';
import { apiClient } from '../../services/api';

export interface GetEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  location?: string;
  joiningYear?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const employeeApi = {
  getEmployees: async (params?: GetEmployeesParams): Promise<any> => {
    const response = await apiClient.get('/v1/employees', { params });
    if (response.data?.success) {
      if (params) {
        if (response.data.data && response.data.data.employees) {
          return response.data.data;
        }
        return {
          employees: Array.isArray(response.data.data) ? response.data.data : [],
          pagination: response.data.pagination || { page: 1, pageSize: 25, totalItems: 0, totalPages: 1 }
        };
      }
      if (response.data.data && response.data.data.employees) {
        return response.data.data.employees;
      }
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Unable to load employees.');
  },

  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    const response = await apiClient.get(`/v1/employees/${id}`);
    if (response.data?.success) return response.data.data;
    const employees = await employeeApi.getEmployees();
    return employees.find((employee: any) => employee.id === id);
  },

  updateEmployeeStatus: async (id: string, status: Employee['status']): Promise<Employee> => {
    const response = await apiClient.put(`/v1/employees/${id}/status`, { status });
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to update employee status.');
  }
};
