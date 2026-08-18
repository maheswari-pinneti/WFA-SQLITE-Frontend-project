import { Employee } from '../models/Employee.js';
import { Organization } from '../models/Department.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

/**
 * GET /api/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const depts = await Employee.distinct('department', { organizationId: orgId, department: { $ne: null, $ne: '' } });
    const formatted = depts.sort().map(d => ({ name: d }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/locations
 */
export const getLocations = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const locs = await Employee.distinct('location', { organizationId: orgId, location: { $ne: null, $ne: '' } });
    const formatted = locs.sort().map(l => ({ name: l }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/organizations
 */
export const getOrganizations = async (req, res) => {
  try {
    const currentOrg = getOrganizationId(req);
    const org = await Organization.findOne({ id: currentOrg });
    const data = org ? [org] : [{
      id: currentOrg,
      name: 'Stackly Enterprise HQ',
      domain: 'thestackly.com',
      status: 'ACTIVE'
    }];
    return res.json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/roles
 */
export const getRoles = (req, res) => {
  return res.json({
    success: true,
    data: [
      { role: 'ADMIN', label: 'System Administrator', clearanceLevel: 5 },
      { role: 'HR', label: 'HR Operations Manager', clearanceLevel: 4 },
      { role: 'MANAGER', label: 'Department Manager', clearanceLevel: 3 },
      { role: 'TEAM_LEAD', label: 'Team Lead', clearanceLevel: 2 },
      { role: 'EMPLOYEE', label: 'Full Stack Developer', clearanceLevel: 1 }
    ]
  });
};

/**
 * GET /api/permissions
 */
export const getPermissions = (req, res) => {
  return res.json({
    success: true,
    data: [
      { permission: 'USER_CREATE', description: 'Create user profiles' },
      { permission: 'USER_UPDATE', description: 'Update user profiles' },
      { permission: 'USER_DELETE', description: 'Deactivate user profiles' },
      { permission: 'EMPLOYEE_VIEW_ALL', description: 'Access global employee directory' },
      { permission: 'VIEW_ALL_DATA', description: 'Cross-department operations' }
    ]
  });
};
