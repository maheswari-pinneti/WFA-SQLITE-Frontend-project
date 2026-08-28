import { analyticsRepository } from './analytics.repository.js';
import { Employee } from '../../models/index.js';

const getScope = (user: any, employeeIdKey = 'employeeId') => {
  const query: any = { organizationId: user.organizationId || 'org-stackly' };

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

const percentage = (value: number, total: number) => (total ? Number(((value / total) * 100).toFixed(1)) : 0);

const buildGrowth = async (user: any) => {
  const query = getScope(user, 'id');
  const employees = await Employee.find(query).sort({ joinDate: 1 }) as any[];
  const monthlyHires: Record<string, number> = {};
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
  async getAnalytics(reqUser: any) {
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
    ]) as [any[], any[], any[], any[], any[], any[], any[], any[], any[]];

    const growthData = await buildGrowth(reqUser);
    const totalEmployees = employees.length;

    const employeeJoinDateMap = new Map<string, string>();
    employees.forEach((emp: any) => {
      if (emp.joinDate) {
        employeeJoinDateMap.set(emp.id, emp.joinDate);
      }
    });

    const isAfterOrOnJoinDate = (recordDateStr: string, joinDateStr?: string) => {
      if (!joinDateStr) return true;
      const recDate = recordDateStr.substring(0, 10);
      const joinDate = joinDateStr.substring(0, 10);
      return recDate >= joinDate;
    };

    const validAttendance = attendance.filter((record: any) => {
      const joinDate = employeeJoinDateMap.get(record.employeeId);
      const recordDate = record.createdAt || record.date;
      if (!recordDate) return true;
      return isAfterOrOnJoinDate(recordDate, joinDate);
    });

    const activePresent = validAttendance.filter((record: any) => record.status !== 'Checked Out').length;
    
    const lateCount = validAttendance.filter((record: any) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      if (parts.length < 2) return false;
      const hr = parseInt(parts[0], 10);
      const min = parseInt(parts[1], 10);
      return hr >= 9 && min > 15;
    }).length;

    const attendanceRate = totalEmployees
      ? Number((employees.reduce((sum: number, emp: any) => sum + (emp.attendanceRate || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const averagePerformance = totalEmployees
      ? Number((employees.reduce((sum: number, emp: any) => sum + (emp.performanceScore || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const attendanceOverview = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = validAttendance.filter((record: any) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record: any) => record.status !== 'Checked Out' || record.checkInTime).length;
      const late = dayRecords.filter((record: any) => {
        if (!record.checkInTime) return false;
        const parts = record.checkInTime.split(':');
        const min = parseInt(parts[1] || '0', 10);
        return min > 15;
      }).length;
      return { name, present, absent: Math.max(0, totalEmployees - present), late };
    });

    const riskBuckets: Record<string, number> = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    employees.forEach((employee: any) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });

    const skillsAnalysis = skills.map((skill: any) => ({
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
        productivityVelocity: `${Math.round(performanceByQuarter.reduce((sum: number, row: any) => sum + (row.productivity || 0), 0) / Math.max(performanceByQuarter.length, 1))}%`,
        averagePerformanceScore: averagePerformance,
        hiringPipeline: 0,
        retentionRiskCount: riskBuckets['High Risk'],
        lateArrivals: lateCount
      },
      growthData,
      workforceGrowth: growthData,
      attendanceOverview,
      departmentComparison,
      departmentDistribution: departmentComparison.map((item: any) => ({ name: item.name, value: item.headcount })),
      roleDistribution,
      employmentStatus,
      workforceDistribution: modeDistribution.length ? modeDistribution : [{ name: 'No attendance data', value: 0 }],
      riskDistribution: Object.entries(riskBuckets).map(([name, value]) => ({ name, value })),
      skillsAnalysis: {
        topSkills: skillsAnalysis.filter((skill: any) => skill.averageLevel >= 4).slice(0, 8),
        missingSkills: skillsAnalysis.filter((skill: any) => skill.gap > 0).sort((a: any, b: any) => b.gap - a.gap).slice(0, 8),
        coverage: skillsAnalysis
      },
      teamProductivity,
      performance: performanceByQuarter
    };
  }

  async getDashboardSummary(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [employees, attendance] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    const totalHeadcount = employees.length;
    const activePresent = attendance.filter((record: any) => record.status !== 'Checked Out').length;
    
    const lateCount = attendance.filter((record: any) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      const hr = parseInt(parts[0] || '0', 10);
      const min = parseInt(parts[1] || '0', 10);
      return hr >= 9 && min > 15;
    }).length;
    
    let riskCount = 0;
    employees.forEach((employee: any) => {
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

  async getWorkforceDistribution(reqUser: any) {
    const attendanceQuery = getScope(reqUser, 'employeeId');
    const rows = await analyticsRepository.getWorkModeDistribution(attendanceQuery);
    return rows.length ? rows : [{ name: 'No data', value: 0 }];
  }

  async getHeadcountAnalytics(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    return analyticsRepository.getDepartmentComparison(employeeQuery);
  }

  async getRiskAnalytics(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const employees = await analyticsRepository.getEmployeesSummary(employeeQuery);
    const riskBuckets: Record<string, number> = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    
    employees.forEach((employee: any) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });
    
    return Object.entries(riskBuckets).map(([name, value]) => ({ name, value }));
  }

  async getEmployeeGrowth(reqUser: any) {
    return buildGrowth(reqUser);
  }

  async getAttendanceTrend(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [employees, attendance] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    const totalHeadcount = employees.length;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = attendance.filter((record: any) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record: any) => record.status !== 'Checked Out' || record.checkInTime).length;
      return { name, present, absent: Math.max(0, totalHeadcount - present) };
    });
  }

  async getPerformanceAnalytics(reqUser: any) {
    const performanceQuery = getScope(reqUser, 'employeeId');
    return analyticsRepository.getPerformanceByQuarter(performanceQuery);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
