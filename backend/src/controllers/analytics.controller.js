import { analyticsService } from '../services/analytics.service.js';

export const getAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getAnalytics(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Analytics query failed:', err);
    return res.status(500).json({ success: false, message: 'Unable to load analytics data.' });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardSummary(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWorkforceDistribution = async (req, res) => {
  try {
    const data = await analyticsService.getWorkforceDistribution(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHeadcountAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getHeadcountAnalytics(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getRiskAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getRiskAnalytics(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeGrowth = async (req, res) => {
  try {
    const data = await analyticsService.getEmployeeGrowth(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceTrend = async (req, res) => {
  try {
    const data = await analyticsService.getAttendanceTrend(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPerformanceAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getPerformanceAnalytics(req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
