import { employeeApi } from '../../../api/endpoints/employee.api';
import { Employee } from '../../../shared/types/common.types';

export const hrService = {
  fetchEmployees: async (): Promise<Employee[]> => {
    return await employeeApi.getEmployees();
  },

  updateStatus: async (id: string, status: Employee['status']): Promise<Employee> => {
    return await employeeApi.updateEmployeeStatus(id, status);
  }
};
