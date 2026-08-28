import { LeaveRequest, Notification, Task } from '../models/Department.js';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { logAudit } from '../config/db.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

const findIdentity = async (employeeId, orgId) => {
  let identity = await Employee.findOne({ id: employeeId, organizationId: orgId });
  if (!identity) {
    identity = await User.findOne({ id: employeeId, organizationId: orgId });
  }
  return identity;
};

const getScopeQuery = (req) => {
  const query = { organizationId: getOrganizationId(req) };
  if (req.user.role === 'EMPLOYEE') {
    query.employeeId = req.user.id;
  } else if (req.user.role === 'TEAM_LEAD') {
    query.team = req.user.team;
  } else if (req.user.role === 'MANAGER') {
    query.department = req.user.department;
  }
  return query;
};

export const getLeaveRequests = async (req, res) => {
  try {
    const query = getScopeQuery(req);
    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: leaves });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const employeeId = req.user.role === 'EMPLOYEE' ? req.user.id : body.employeeId;
    const { type, startDate, endDate, reason } = body;
    if (!employeeId || !type || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Leave type, dates and reason are required.' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const orgId = getOrganizationId(req);
    const identity = await findIdentity(employeeId, orgId);
    if (!identity) {
      return res.status(403).json({ success: false, message: 'Employee is outside the active organization.' });
    }
    if (req.user.role === 'MANAGER' && identity.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && identity.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your team.' });
    }

    const id = `leave-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    const leave = await LeaveRequest.create({
      id,
      employeeId,
      employeeName: identity.name,
      department: identity.department,
      team: identity.team,
      organizationId: orgId,
      type,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'PENDING',
      createdAt
    });

    logAudit(employeeId, 'LEAVE_REQUESTED', `Submitted ${type} leave request for ${startDate} to ${endDate}`, orgId);
    return res.status(201).json({ success: true, data: leave });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewComment = '' } = req.body || {};
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const orgId = getOrganizationId(req);
    const request = await LeaveRequest.findOne({ id: req.params.id, organizationId: orgId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }
    if (request.status !== 'PENDING') {
      return res.status(409).json({ success: false, message: 'Leave request has already been reviewed.' });
    }

    if (req.user.role === 'MANAGER' && request.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && request.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your team.' });
    }

    request.status = status;
    request.reviewedBy = req.user.name;
    request.reviewComment = reviewComment;
    await request.save();

    logAudit(request.employeeId, `LEAVE_${status}`, `${req.user.name} reviewed leave request ${request.id}`, orgId);
    return res.json({ success: true, data: request });
  } catch (err) {
    console.error('reviewLeaveRequest Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const query = { organizationId: getOrganizationId(req) };
    if (req.user.role === 'EMPLOYEE') {
      query.assigneeId = req.user.id;
    } else if (req.user.role === 'TEAM_LEAD') {
      query.team = req.user.team;
    } else if (req.user.role === 'MANAGER') {
      query.department = req.user.department;
    }

    const tasks = await Task.find(query).sort({ updatedAt: -1, priority: -1 });
    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status.' });
    }

    const orgId = getOrganizationId(req);
    const task = await Task.findOne({ id: req.params.id, organizationId: orgId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const canManage = ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD'].includes(req.user.role);
    const canUpdateOwn = req.user.role === 'EMPLOYEE' && task.assigneeId === req.user.id;
    if (!canManage && !canUpdateOwn) {
      return res.status(403).json({ success: false, message: 'Task is outside your access scope.' });
    }

    if (req.user.role === 'MANAGER' && task.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Task is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && task.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Task is outside your team.' });
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();
    await task.save();

    logAudit(req.user.id, 'TASK_UPDATED', `Updated task ${req.params.id} to ${status}`, orgId);
    return res.json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
