import { query } from '../../database/sqlite-cloud.js';

function buildWhereClause(queryData: any) {
  const clauses: string[] = [];
  const params: any[] = [];
  
  for (const [key, value] of Object.entries(queryData)) {
    if (value === undefined || value === null) continue;
    
    if (key === 'companyId' || key === 'organizationId') {
      clauses.push(`(companyId = ? OR organizationId = ?)`);
      params.push(value, value);
    } else if (value instanceof RegExp) {
      const val = value.source.replace('^', '').replace('$', '').replace(/\\/g, '');
      clauses.push(`${key} LIKE ?`);
      params.push(`%${val}%`);
    } else if (typeof value === 'object' && value !== null) {
      const operators = Object.keys(value);
      operators.forEach(op => {
        if (op === '$ne') {
          clauses.push(`${key} != ?`);
          params.push((value as any)[op]);
        } else if (op === '$in') {
          const list = (value as any)[op];
          if (Array.isArray(list) && list.length > 0) {
            const placeholders = list.map(() => '?').join(', ');
            clauses.push(`${key} IN (${placeholders})`);
            params.push(...list);
          }
        }
      });
    } else {
      clauses.push(`${key} = ?`);
      params.push(value);
    }
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

export class AnalyticsRepository {
  async getEmployeesSummary(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT id, department, team, role, status, performanceScore, attendanceRate 
      FROM employees 
      ${clause}
    `, params);
    return rows;
  }

  async getAttendanceRecords(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT employeeId, status, workMode, checkInTime, checkOutTime, createdAt 
      FROM attendancerecords 
      ${clause}
    `, params);
    return rows;
  }

  async getDepartmentComparison(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        COALESCE(department, 'Unassigned') as name,
        COUNT(*) as headcount,
        ROUND(AVG(performanceScore), 1) as performance,
        ROUND(AVG(attendanceRate), 1) as attendance
      FROM employees
      ${clause}
      GROUP BY department
      ORDER BY headcount DESC
    `, params);
    return rows;
  }

  async getRoleDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT role as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY role
      ORDER BY value DESC
    `, params);
    return rows;
  }

  async getEmploymentStatus(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT status as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY status
      ORDER BY value DESC
    `, params);
    return rows;
  }

  async getWorkModeDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT workMode as name, COUNT(DISTINCT employeeId) as value
      FROM attendancerecords
      ${clause}
      GROUP BY workMode
    `, params);
    return rows;
  }

  async getPerformanceByQuarter(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        quarter as name,
        ROUND(AVG(kpiScore), 1) as performance,
        ROUND(AVG(targetScore), 1) as target,
        ROUND(AVG(productivityScore), 1) as productivity
      FROM performancerecords
      ${clause}
      GROUP BY quarter
      ORDER BY name ASC
    `, params);
    return rows;
  }

  async getTeamProductivity(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        COALESCE(team, 'Unassigned') as name,
        ROUND(AVG(productivityScore), 1) as productivity,
        COUNT(DISTINCT employeeId) as members
      FROM performancerecords
      ${clause}
      GROUP BY team
      ORDER BY productivity DESC
    `, params);
    return rows;
  }

  async getSkillsMetrics(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        skillName as name,
        ROUND(AVG(level), 1) as averageLevel,
        COUNT(DISTINCT employeeId) as people,
        SUM(CASE WHEN level >= 3 THEN 1 ELSE 0 END) as covered,
        SUM(CASE WHEN level <= 2 THEN 1 ELSE 0 END) as gap
      FROM skills
      ${clause}
      GROUP BY skillName
      ORDER BY people DESC
    `, params);
    return rows;
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
