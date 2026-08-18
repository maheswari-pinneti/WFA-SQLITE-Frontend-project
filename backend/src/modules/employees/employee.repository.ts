import { getDb } from '../../database/connection.js';

function buildSqlFilter(query: any) {
  const clauses: string[] = [];
  const params: any[] = [];

  if (query.organizationId) {
    clauses.push("organizationId = ?");
    params.push(query.organizationId);
  }

  if (query.id) {
    clauses.push("id = ?");
    params.push(query.id);
  }

  if (query.email) {
    clauses.push("email = ?");
    params.push(query.email);
  }

  if (query.department) {
    clauses.push("department = ?");
    params.push(query.department);
  }

  if (query.team) {
    clauses.push("team = ?");
    params.push(query.team);
  }

  if (query.location) {
    clauses.push("location = ?");
    params.push(query.location);
  }

  if (query.designation) {
    clauses.push("designation = ?");
    params.push(query.designation);
  }

  if (query.status) {
    let statusVal = query.status;
    if (statusVal instanceof RegExp) {
      statusVal = statusVal.source.replace('^', '').replace('$', '');
    }
    statusVal = statusVal.replace(/\\/g, '');
    clauses.push("LOWER(status) = LOWER(?)");
    params.push(statusVal);
  }

  if (query.joinDate) {
    let joinDateVal = query.joinDate;
    if (joinDateVal instanceof RegExp) {
      joinDateVal = joinDateVal.source.replace('^', '').replace('$', '');
    }
    joinDateVal = joinDateVal.replace(/\\/g, '');
    clauses.push("joinDate LIKE ?");
    params.push(`${joinDateVal}%`);
  }

  if (query.$or) {
    const orClauses: string[] = [];
    query.$or.forEach((orQuery: any) => {
      const key = Object.keys(orQuery)[0];
      if (key) {
        let val = orQuery[key];
        if (val instanceof RegExp) {
          val = val.source.replace('^', '').replace('$', '');
        }
        val = val.replace(/\\/g, '');
        orClauses.push(`${key} LIKE ?`);
        params.push(`%${val}%`);
      }
    });
    if (orClauses.length > 0) {
      clauses.push(`(${orClauses.join(' OR ')})`);
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereClause, params };
}

export class EmployeeRepository {
  async findById(id: string, orgId: string) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM employees WHERE id = ? AND organizationId = ?').get(id, orgId);
    return row || null;
  }

  async findByEmail(email: string, orgId: string) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM employees WHERE email = ? AND organizationId = ?').get(email, orgId);
    return row || null;
  }

  async create(employeeData: any) {
    const db = getDb();
    const timestamp = new Date().toISOString();
    const data = {
      id: employeeData.id,
      employeeCode: employeeData.employeeCode || null,
      name: employeeData.name,
      email: employeeData.email || null,
      role: employeeData.role || 'EMPLOYEE',
      department: employeeData.department || null,
      designation: employeeData.designation || null,
      status: employeeData.status || 'ACTIVE',
      avatar: employeeData.avatar || null,
      joinDate: employeeData.joinDate || null,
      performanceScore: employeeData.performanceScore ?? 90,
      attendanceRate: employeeData.attendanceRate ?? 95,
      team: employeeData.team || null,
      location: employeeData.location || null,
      organizationId: employeeData.organizationId || 'org-stackly',
      companyId: employeeData.companyId || 'org-stackly',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    db.prepare(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, avatar, joinDate, performanceScore, attendanceRate, team, location, organizationId, companyId, createdAt, updatedAt)
      VALUES (@id, @employeeCode, @name, @email, @role, @department, @designation, @status, @avatar, @joinDate, @performanceScore, @attendanceRate, @team, @location, @organizationId, @companyId, @createdAt, @updatedAt)
    `).run(data);

    return this.findById(employeeData.id, data.organizationId);
  }

  async update(id: string, orgId: string, updateData: any) {
    const db = getDb();
    let updates = updateData;
    if (updateData.$set) {
      updates = updateData.$set;
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) return this.findById(id, orgId);

    const setClause = fields.map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(id);
    values.push(orgId);

    db.prepare(`UPDATE employees SET ${setClause}, updatedAt = ? WHERE id = ? AND organizationId = ?`).run(...values);
    return this.findById(id, orgId);
  }

  async softDelete(id: string, orgId: string) {
    return this.update(id, orgId, { status: 'TERMINATED' });
  }

  async count(query: any) {
    const db = getDb();
    const { whereClause, params } = buildSqlFilter(query);
    const row = db.prepare(`SELECT COUNT(*) as count FROM employees ${whereClause}`).get(...params) as any;
    return row.count;
  }

  async findPaginated(query: any, sortOption: any, skip: number, limit: number) {
    const db = getDb();
    const { whereClause, params } = buildSqlFilter(query);

    let orderByClause = '';
    const sortFields = Object.keys(sortOption);
    if (sortFields.length > 0) {
      const field = sortFields[0];
      const direction = sortOption[field] === -1 ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY ${field} ${direction}`;
    }

    const queryParams = [...params, limit, skip];
    const rows = db.prepare(`
      SELECT * FROM employees 
      ${whereClause} 
      ${orderByClause} 
      LIMIT ? OFFSET ?
    `).all(...queryParams);

    return rows;
  }

  async getDistinctTeams(orgId: string) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT team as name, department 
      FROM employees 
      WHERE organizationId = ? AND team IS NOT NULL AND team != '' 
      GROUP BY team, department 
      ORDER BY team ASC
    `).all(orgId);
    return rows;
  }

  async findTeamMembers(teamId: string, orgId: string) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM employees 
      WHERE team = ? AND organizationId = ? 
      ORDER BY employeeCode ASC
    `).all(teamId, orgId);
    return rows;
  }

  async getDistinctDepartments(orgId: string) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT department 
      FROM employees 
      WHERE organizationId = ? AND department IS NOT NULL AND department != ''
    `).all(orgId) as any[];
    return rows.map(r => r.department);
  }

  async getDistinctLocations(orgId: string) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT location 
      FROM employees 
      WHERE organizationId = ? AND location IS NOT NULL AND location != ''
    `).all(orgId) as any[];
    return rows.map(r => r.location);
  }
}

export const employeeRepository = new EmployeeRepository();
export default employeeRepository;
