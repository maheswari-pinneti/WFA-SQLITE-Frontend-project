import { employeeRepository } from './employee.repository.js';
import { userRepository } from '../auth/auth.repository.js';

export class EmployeeService {
  async getEmployees(reqUser: any, queryParams: any) {
    const { role, id: userId, department: userDept, team: userTeam, organizationId } = reqUser;

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    let limit = parseInt(queryParams.pageSize || queryParams.limit, 10) || 25;
    if (limit > 100) limit = 100;
    if (limit <= 0) limit = 25;
    const skip = (page - 1) * limit;

    const query: any = { organizationId: organizationId || 'org-stackly' };

    if (role === 'EMPLOYEE') {
      query.id = userId;
    } else if (role === 'TEAM_LEAD') {
      query.department = userDept;
      query.team = userTeam;
    } else if (role === 'MANAGER') {
      query.department = userDept;
    }

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [
        { name: searchRegex },
        { employeeCode: searchRegex },
        { email: searchRegex }
      ];
    }

    if (queryParams.location && queryParams.location !== 'ALL' && queryParams.location !== 'All') {
      query.location = queryParams.location;
    }
    if (queryParams.department && queryParams.department !== 'ALL' && queryParams.department !== 'All') {
      if (role === 'ADMIN' || role === 'HR') {
        query.department = queryParams.department;
      }
    }
    if (queryParams.designation && queryParams.designation !== 'ALL' && queryParams.designation !== 'All') {
      query.designation = queryParams.designation;
    }
    if (queryParams.status && queryParams.status !== 'ALL' && queryParams.status !== 'All') {
      query.status = new RegExp('^' + queryParams.status + '$', 'i');
    }
    if (queryParams.joiningYear && queryParams.joiningYear !== 'ALL' && queryParams.joiningYear !== 'All') {
      query.joinDate = new RegExp('^' + queryParams.joiningYear);
    }

    let sortOption: any = {};
    if (queryParams.sortBy) {
      let sortBy = queryParams.sortBy;
      if (sortBy === 'employeeId') sortBy = 'employeeCode';
      const sortOrder = (queryParams.sortOrder || '').toUpperCase() === 'DESC' ? -1 : 1;

      const allowedSortFields = ['id', 'employeeCode', 'name', 'department', 'designation', 'status', 'location', 'joinDate'];
      if (allowedSortFields.includes(sortBy)) {
        sortOption = { [sortBy]: sortOrder };
      }
    }

    const totalItems = await employeeRepository.count(query);
    const employees = await employeeRepository.findPaginated(query, sortOption, skip, limit);

    return {
      employees,
      pagination: {
        page,
        pageSize: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    };
  }

  async getEmployeeById(id: string, orgId: string) {
    return employeeRepository.findById(id, orgId);
  }

  async createEmployee(employeeData: any) {
    return employeeRepository.create(employeeData);
  }

  async updateEmployee(id: string, orgId: string, updateData: any) {
    return employeeRepository.update(id, orgId, updateData);
  }

  async updateEmployeeStatus(id: string, orgId: string, status: string) {
    return employeeRepository.update(id, orgId, { status });
  }

  async deleteEmployee(id: string, orgId: string) {
    return employeeRepository.softDelete(id, orgId);
  }

  async getTeams(orgId: string) {
    return employeeRepository.getDistinctTeams(orgId);
  }

  async getTeamMembers(teamId: string, orgId: string) {
    return employeeRepository.findTeamMembers(teamId, orgId);
  }

  async getDistinctDepartments(orgId: string) {
    return employeeRepository.getDistinctDepartments(orgId);
  }

  async getDistinctLocations(orgId: string) {
    return employeeRepository.getDistinctLocations(orgId);
  }

  async getUsers(orgId: string) {
    return userRepository.findByScope(orgId);
  }

  async updateUserRole(userId: string, role: string, orgId: string) {
    return userRepository.updateRole(userId, role, orgId);
  }

  async deleteUser(userId: string, orgId: string) {
    return userRepository.delete(userId, orgId);
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
