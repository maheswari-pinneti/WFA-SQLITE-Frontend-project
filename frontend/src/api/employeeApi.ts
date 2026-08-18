import { apiClient } from './client';
import { Employee } from '../shared/types/common.types';

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
  getEmployees: async (params?: GetEmployeesParams): Promise<{ employees: Employee[]; pagination: any }> => {
    const response = await apiClient.get('/v1/employees', { params });
    if (response.data?.success) {
      if (response.data.data && response.data.data.employees) {
        return response.data.data;
      }
      return {
        employees: Array.isArray(response.data.data) ? response.data.data : [],
        pagination: response.data.pagination || { page: 1, pageSize: 25, totalItems: 0, totalPages: 1 }
      };
    }
    throw new Error(response.data?.message || 'Unable to load employees.');
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/v1/employees/${id}`);
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to fetch employee details.');
  },

  createEmployee: async (employee: Omit<Employee, 'id'> & { id?: string }): Promise<Employee> => {
    const response = await apiClient.post('/v1/employees', employee);
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to create employee.');
  },

  updateEmployee: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put(`/v1/employees/${id}`, employee);
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to update employee.');
  },

  deleteEmployee: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/v1/employees/${id}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unable to delete employee.');
    }
  },

  updateEmployeeStatus: async (id: string, status: Employee['status']): Promise<Employee> => {
    const response = await apiClient.put(`/v1/employees/${id}/status`, { status });
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Unable to update employee status.');
  }
};
