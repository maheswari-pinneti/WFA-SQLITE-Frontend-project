import { analyticsRepository } from '../repositories/analytics.repository.js';
import { Employee } from '../models/Employee.js';

const getScope = (user, employeeIdKey = 'employeeId') => {
  const query = { organizationId: user.organizationId || 'org-stackly' };

  if (user.role === 'MANAGER') {
    query.department = user.department;
  }
  if (user.role === 'TEAM_LEAD') {
    query.team = user.team;
  }
  if (user.role === 'EMPLOYEE') {
    query[employeeIdKey] = user.id;
  }

  return query;
};

const percentage = (value, total) => (total ? Number(((value / total) * 100).toFixed(1)) : 0);

const buildGrowth = async (user) => {
  const query = getScope(user, 'id');
  const employees = await Employee.find(query, { joinDate: 1 }).sort({ joinDate: 1 });
  const monthlyHires = {};
  employees.forEach(emp => {
    if (emp.joinDate) {
      const month = emp.joinDate.substring(0, 7);
      monthlyHires[month] = (monthlyHires[month] || 0) + 1;
    }
  });
  
  const sortedMonths = Object.keys(monthlyHires).sort();
  let headcount = 0;
  const trend = sortedMonths.map(month => {
    headcount += monthlyHires[month];
    return { name: month, headcount, hiring: monthlyHires[month] };
  });
  return trend.slice(-12);
};

export class AnalyticsService {
  async getAnalytics(reqUser) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');
    const performanceQuery = getScope(reqUser, 'employeeId');
    const skillQuery = getScope(reqUser, 'employeeId');

    const [
      employees,
      attendance,
      departmentComparison,
      roleDistribution,
      employmentStatus,
      modeDistribution,
      performanceByQuarter,
      teamProductivity,
      skills
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery),
      analyticsRepository.getDepartmentComparison(employeeQuery),
      analyticsRepository.getRoleDistribution(employeeQuery),
      analyticsRepository.getEmploymentStatus(employeeQuery),
      analyticsRepository.getWorkModeDistribution(attendanceQuery),
      analyticsRepository.getPerformanceByQuarter(performanceQuery),
      analyticsRepository.getTeamProductivity(performanceQuery),
      analyticsRepository.getSkillsMetrics(skillQuery)
    ]);

    const growthData = await buildGrowth(reqUser);
    const totalEmployees = employees.length;
    const activePresent = attendance.filter((record) => record.status !== 'Checked Out').length;
    
    const lateCount = attendance.filter((record) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      if (parts.length < 2) return false;
      const hr = parseInt(parts[0], 10);
      const min = parseInt(parts[1], 10);
      return hr >= 9 && min > 15;
    }).length;

    const attendanceRate = totalEmployees
      ? Number((employees.reduce((sum, emp) => sum + (emp.attendanceRate || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const averagePerformance = totalEmployees
      ? Number((employees.reduce((sum, emp) => sum + (emp.performanceScore || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const attendanceOverview = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = attendance.filter((record) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record) => record.status !== 'Checked Out' || record.checkInTime).length;
      const late = dayRecords.filter((record) => {
        if (!record.checkInTime) return false;
        const parts = record.checkInTime.split(':');
        const min = parseInt(parts[1] || '0', 10);
        return min > 15;
      }).length;
      return { name, present, absent: Math.max(0, totalEmployees - present), late };
    });

    const riskBuckets = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    employees.forEach((employee) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });

    const skillsAnalysis = skills.map((skill) => ({
      name: skill.name,
      averageLevel: skill.averageLevel || 0,
      coverage: percentage(skill.covered || 0, totalEmployees),
      gap: skill.gap || 0,
      people: skill.people || 0
    }));

    return {
      scope: {
        role: reqUser.role,
        organizationId: reqUser.organizationId || 'org-stackly',
        department: reqUser.department || null,
        team: reqUser.team || null,
        employeeId: reqUser.role === 'EMPLOYEE' ? reqUser.id : null
      },
      metrics: {
        totalWorkforce: totalEmployees,
        activePresent,
        attendanceRate: `${attendanceRate}%`,
        productivityVelocity: `${Math.round(performanceByQuarter.reduce((sum, row) => sum + (row.productivity || 0), 0) / Math.max(performanceByQuarter.length, 1))}%`,
        averagePerformanceScore: averagePerformance,
        hiringPipeline: 0,
        retentionRiskCount: riskBuckets['High Risk'],
        lateArrivals: lateCount
      },
      growthData,
      workforceGrowth: growthData,
      attendanceOverview,
      departmentComparison,
      departmentDistribution: departmentComparison.map((item) => ({ name: item.name, value: item.headcount })),
      roleDistribution,
      employmentStatus,
      workforceDistribution: modeDistribution.length ? modeDistribution : [{ name: 'No attendance data', value: 0 }],
      riskDistribution: Object.entries(riskBuckets).map(([name, value]) => ({ name, value })),
      skillsAnalysis: {
        topSkills: skillsAnalysis.filter((skill) => skill.averageLevel >= 4).slice(0, 8),
        missingSkills: skillsAnalysis.filter((skill) => skill.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 8),
        coverage: skillsAnalysis
      },
      teamProductivity,
      performance: performanceByQuarter
    };
  }

  async getDashboardSummary(reqUser) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [employees, attendance] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    const totalHeadcount = employees.length;
    const activePresent = attendance.filter((record) => record.status !== 'Checked Out').length;
    
    const lateCount = attendance.filter((record) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      const hr = parseInt(parts[0] || '0', 10);
      const min = parseInt(parts[1] || '0', 10);
      return hr >= 9 && min > 15;
    }).length;
    
    let riskCount = 0;
    employees.forEach((employee) => {
      if ((employee.performanceScore || 0) < 75 || (employee.attendanceRate || 0) < 85) {
        riskCount += 1;
      }
    });

    return {
      totalHeadcount,
      activePresent,
      lateArrivals: lateCount,
      riskFlags: riskCount,
      attendanceRate: totalHeadcount ? Math.round((activePresent / totalHeadcount) * 100) : 0
    };
  }

  async getWorkforceDistribution(reqUser) {
    const attendanceQuery = getScope(reqUser, 'employeeId');
    const rows = await analyticsRepository.getWorkModeDistribution(attendanceQuery);
    return rows.length ? rows : [{ name: 'No data', value: 0 }];
  }

  async getHeadcountAnalytics(reqUser) {
    const employeeQuery = getScope(reqUser, 'id');
    return analyticsRepository.getDepartmentComparison(employeeQuery);
  }

  async getRiskAnalytics(reqUser) {
    const employeeQuery = getScope(reqUser, 'id');
    const employees = await analyticsRepository.getEmployeesSummary(employeeQuery);
    const riskBuckets = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    
    employees.forEach((employee) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });
    
    return Object.entries(riskBuckets).map(([name, value]) => ({ name, value }));
  }

  async getEmployeeGrowth(reqUser) {
    return buildGrowth(reqUser);
  }

  async getAttendanceTrend(reqUser) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [employees, attendance] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    const totalHeadcount = employees.length;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = attendance.filter((record) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record) => record.status !== 'Checked Out' || record.checkInTime).length;
      return { name, present, absent: Math.max(0, totalHeadcount - present) };
    });
  }

  async getPerformanceAnalytics(reqUser) {
    const performanceQuery = getScope(reqUser, 'employeeId');
    return analyticsRepository.getPerformanceByQuarter(performanceQuery);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
