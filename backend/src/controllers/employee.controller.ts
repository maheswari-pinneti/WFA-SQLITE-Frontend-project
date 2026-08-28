import { employeeService } from '../services/employee.service.js';
import { logAudit } from '../config/db.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

export const getEmployees = async (req, res) => {
  try {
    const data = await employeeService.getEmployees(req.user, req.query);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id, getOrganizationId(req));
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.json({ success: true, data: employee });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const body = req.body || {};
    const { id, name, email, department } = body;
    if (!id || !name || !email || !department) {
      return res.status(400).json({ success: false, message: 'Required fields: id, name, email, department.' });
    }

    const orgId = getOrganizationId(req);
    const newEmp = await employeeService.createEmployee({
      ...body,
      organizationId: orgId
    });

    logAudit(req.user.id, 'EMPLOYEE_CREATE', `Created employee profile for ${name} (${id})`, orgId);
    return res.status(201).json({ success: true, data: newEmp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const updatedEmp = await employeeService.updateEmployee(id, orgId, req.body);
    if (!updatedEmp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_UPDATE', `Updated employee profile: ${id}`, orgId);
    return res.json({ success: true, data: updatedEmp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'PRESENT', 'REMOTE', 'ON_LEAVE', 'OFFLINE', 'TERMINATED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid employee status.' });
    }

    const orgId = getOrganizationId(req);
    const updated = await employeeService.updateEmployeeStatus(id, orgId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const updated = await employeeService.deleteEmployee(id, orgId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_DELETE', `Soft deleted/terminated employee: ${id}`, orgId);
    return res.json({ success: true, message: 'Employee successfully terminated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await employeeService.getTeams(getOrganizationId(req));
    return res.json({ success: true, data: teams });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await employeeService.getTeamMembers(id, getOrganizationId(req));
    return res.json({ success: true, data: members });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await employeeService.getUsers(getOrganizationId(req));
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const updated = await employeeService.updateUserRole(userId, role, getOrganizationId(req));
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await employeeService.deleteUser(userId, getOrganizationId(req));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
