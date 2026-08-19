import { query, execute } from '../../database/sqlite-cloud.js';

function buildSqlFilter(filterQuery: any) {
  const clauses: string[] = [];
  const params: any[] = [];

  if (filterQuery.organizationId) {
    clauses.push("organizationId = ?");
    params.push(filterQuery.organizationId);
  }

  if (filterQuery.id) {
    clauses.push("id = ?");
    params.push(filterQuery.id);
  }

  if (filterQuery.email) {
    clauses.push("email = ?");
    params.push(filterQuery.email);
  }

  if (filterQuery.department) {
    clauses.push("department = ?");
    params.push(filterQuery.department);
  }

  if (filterQuery.team) {
    clauses.push("team = ?");
    params.push(filterQuery.team);
  }

  if (filterQuery.location) {
    clauses.push("location = ?");
    params.push(filterQuery.location);
  }

  if (filterQuery.designation) {
    clauses.push("designation = ?");
    params.push(filterQuery.designation);
  }

  if (filterQuery.status) {
    let statusVal = filterQuery.status;
    if (statusVal instanceof RegExp) {
      statusVal = statusVal.source.replace('^', '').replace('$', '');
    }
    statusVal = statusVal.replace(/\\/g, '');
    clauses.push("LOWER(status) = LOWER(?)");
    params.push(statusVal);
  }

  if (filterQuery.joinDate) {
    let joinDateVal = filterQuery.joinDate;
    if (joinDateVal instanceof RegExp) {
      joinDateVal = joinDateVal.source.replace('^', '').replace('$', '');
    }
    joinDateVal = joinDateVal.replace(/\\/g, '');
    clauses.push("joinDate LIKE ?");
    params.push(`${joinDateVal}%`);
  }

  if (filterQuery.$or) {
    const orClauses: string[] = [];
    filterQuery.$or.forEach((orQuery: any) => {
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
    const rows = await query('SELECT * FROM employees WHERE id = ? AND organizationId = ?', [id, orgId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async findByEmail(email: string, orgId: string) {
    const rows = await query('SELECT * FROM employees WHERE email = ? AND organizationId = ?', [email, orgId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async create(employeeData: any) {
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

    await execute(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, avatar, joinDate, performanceScore, attendanceRate, team, location, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.employeeCode, data.name, data.email, data.role, data.department, data.designation,
      data.status, data.avatar, data.joinDate, data.performanceScore, data.attendanceRate, data.team,
      data.location, data.organizationId, data.companyId, data.createdAt, data.updatedAt
    ]);

    return this.findById(employeeData.id, data.organizationId);
  }

  async update(id: string, orgId: string, updateData: any) {
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

    await execute(`UPDATE employees SET ${setClause}, updatedAt = ? WHERE id = ? AND organizationId = ?`, values);
    return this.findById(id, orgId);
  }

  async softDelete(id: string, orgId: string) {
    return this.update(id, orgId, { status: 'TERMINATED' });
  }

  async count(queryData: any) {
    const { whereClause, params } = buildSqlFilter(queryData);
    const rows = await query(`SELECT COUNT(*) as count FROM employees ${whereClause}`, params);
    return rows && rows.length > 0 ? (rows[0] as any).count : 0;
  }

  async findPaginated(queryData: any, sortOption: any, skip: number, limit: number) {
    const { whereClause, params } = buildSqlFilter(queryData);

    let orderByClause = '';
    const sortFields = Object.keys(sortOption);
    if (sortFields.length > 0) {
      const field = sortFields[0];
      const direction = sortOption[field] === -1 ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY ${field} ${direction}`;
    }

    const queryParams = [...params, limit, skip];
    const rows = await query(`
      SELECT * FROM employees 
      ${whereClause} 
      ${orderByClause} 
      LIMIT ? OFFSET ?
    `, queryParams);

    return rows;
  }

  async getDistinctTeams(orgId: string) {
    const rows = await query(`
      SELECT team as name, department 
      FROM employees 
      WHERE organizationId = ? AND team IS NOT NULL AND team != '' 
      GROUP BY team, department 
      ORDER BY team ASC
    `, [orgId]);
    return rows;
  }

  async findTeamMembers(teamId: string, orgId: string) {
    const rows = await query(`
      SELECT * FROM employees 
      WHERE team = ? AND organizationId = ? 
      ORDER BY employeeCode ASC
    `, [teamId, orgId]);
    return rows;
  }

  async getDistinctDepartments(orgId: string) {
    const rows = await query(`
      SELECT DISTINCT department 
      FROM employees 
      WHERE organizationId = ? AND department IS NOT NULL AND department != ''
    `, [orgId]);
    return rows.map((r: any) => r.department);
  }

  async getDistinctLocations(orgId: string) {
    const rows = await query(`
      SELECT DISTINCT location 
      FROM employees 
      WHERE organizationId = ? AND location IS NOT NULL AND location != ''
    `, [orgId]);
    return rows.map((r: any) => r.location);
  }
}

export const employeeRepository = new EmployeeRepository();
export default employeeRepository;
