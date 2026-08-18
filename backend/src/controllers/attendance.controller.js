import { attendanceService } from '../services/attendance.service.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

export const checkIn = async (req, res) => {
  try {
    const result = await attendanceService.checkIn(req.user, req.body);
    return res.json({ success: true, data: result.data, idempotentReplay: result.idempotentReplay });
  } catch (err) {
    if (err.message.includes('Duplicate') || err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate attendance request.' });
    }
    if (err.message.includes('required') || err.message.includes('insufficient') || err.message.includes('boundary') || err.message.includes('exists')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const takeBreak = async (req, res) => {
  try {
    const data = await attendanceService.takeBreak(req.user, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const resumeWork = async (req, res) => {
  try {
    const data = await attendanceService.resumeWork(req.user, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const data = await attendanceService.checkOut(req.user, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    if (err.message.includes('rejection') || err.message.includes('session')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecords = async (req, res) => {
  try {
    const data = await attendanceService.getRecords(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getTodayAttendance(req.user.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitCorrection = async (req, res) => {
  try {
    const data = await attendanceService.submitCorrection(req.user, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const reviewCorrection = async (req, res) => {
  try {
    const { status, managerComment } = req.body || {};
    await attendanceService.reviewCorrection(req.user, req.params.id, status, managerComment);
    return res.json({ success: true, message: `Request successfully ${status}.` });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes('reviewed') || err.message.includes('outside')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCorrections = async (req, res) => {
  try {
    const data = await attendanceService.getCorrections(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getShifts = async (req, res) => {
  try {
    const data = await attendanceService.getShifts(getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const data = await attendanceService.getAuditLogs(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
