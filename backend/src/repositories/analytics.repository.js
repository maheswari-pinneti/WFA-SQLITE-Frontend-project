import { getDb } from '../config/db.js';

function buildWhereClause(query) {
  const clauses = [];
  const params = [];
  
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    
    // Normalize companyId and organizationId
    if (key === 'companyId' || key === 'organizationId') {
      clauses.push(`(companyId = ? OR organizationId = ?)`);
      params.push(value, value);
    } else if (value instanceof RegExp) {
      const val = value.source.replace('^', '').replace('$', '').replace(/\\/g, '');
      clauses.push(`${key} LIKE ?`);
      params.push(`%${val}%`);
    } else if (typeof value === 'object' && value !== null) {
      // Handle operators like $ne or $in if they appear in queries
      const operators = Object.keys(value);
      operators.forEach(op => {
        if (op === '$ne') {
          clauses.push(`${key} != ?`);
          params.push(value[op]);
        } else if (op === '$in') {
          const list = value[op];
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
  async getEmployeesSummary(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT id, department, team, role, status, performanceScore, attendanceRate 
      FROM employees 
      ${clause}
    `).all(...params);
    return rows;
  }

  async getAttendanceRecords(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT employeeId, status, workMode, checkInTime, checkOutTime, createdAt 
      FROM attendancerecords 
      ${clause}
    `).all(...params);
    return rows;
  }

  async getDepartmentComparison(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT 
        COALESCE(department, 'Unassigned') as name,
        COUNT(*) as headcount,
        ROUND(AVG(performanceScore), 1) as performance,
        ROUND(AVG(attendanceRate), 1) as attendance
      FROM employees
      ${clause}
      GROUP BY department
      ORDER BY headcount DESC
    `).all(...params);
    return rows;
  }

  async getRoleDistribution(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT role as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY role
      ORDER BY value DESC
    `).all(...params);
    return rows;
  }

  async getEmploymentStatus(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT status as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY status
      ORDER BY value DESC
    `).all(...params);
    return rows;
  }

  async getWorkModeDistribution(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT workMode as name, COUNT(DISTINCT employeeId) as value
      FROM attendancerecords
      ${clause}
      GROUP BY workMode
    `).all(...params);
    return rows;
  }

  async getPerformanceByQuarter(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT 
        quarter as name,
        ROUND(AVG(kpiScore), 1) as performance,
        ROUND(AVG(targetScore), 1) as target,
        ROUND(AVG(productivityScore), 1) as productivity
      FROM performancerecords
      ${clause}
      GROUP BY quarter
      ORDER BY name ASC
    `).all(...params);
    return rows;
  }

  async getTeamProductivity(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT 
        COALESCE(team, 'Unassigned') as name,
        ROUND(AVG(productivityScore), 1) as productivity,
        COUNT(DISTINCT employeeId) as members
      FROM performancerecords
      ${clause}
      GROUP BY team
      ORDER BY productivity DESC
    `).all(...params);
    return rows;
  }

  async getSkillsMetrics(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
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
    `).all(...params);
    return rows;
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
