import { AuditLog } from '../models/AuditLog.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

/**
 * GET /api/audit/logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const logs = await AuditLog.find({ organizationId: orgId }).sort({ timestamp: -1 }).limit(100);
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/audit/logs/:id
 */
export const getAuditLogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);
    const log = await AuditLog.findOne({ id, organizationId: orgId });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found.' });
    }
    return res.json({ success: true, data: log });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
