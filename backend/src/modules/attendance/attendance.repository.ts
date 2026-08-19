import { query, execute } from '../../database/sqlite-cloud.js';

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

export class AttendanceRepository {
  async findActiveSession(employeeId: string, orgId: string) {
    const rows = await query(`
      SELECT * FROM attendancerecords 
      WHERE employeeId = ? AND (companyId = ? OR organizationId = ?) AND status != 'Checked Out'
    `, [employeeId, orgId, orgId]);
    
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as any;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async findRecordById(id: string, orgId: string) {
    const rows = await query('SELECT * FROM attendancerecords WHERE id = ? AND (companyId = ? OR organizationId = ?)', [id, orgId, orgId]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as any;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async findRecordByIdempotencyKey(idempotencyKey: string, orgId: string) {
    const rows = await query('SELECT * FROM attendancerecords WHERE idempotencyKey = ? AND (companyId = ? OR organizationId = ?)', [idempotencyKey, orgId, orgId]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as any;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async createRecord(recordData: any) {
    const timestamp = new Date().toISOString();
    const data = {
      id: recordData.id,
      employeeId: recordData.employeeId,
      employeeName: recordData.employeeName || null,
      department: recordData.department || null,
      date: recordData.date,
      checkInTime: recordData.checkInTime || null,
      checkOutTime: recordData.checkOutTime || null,
      breaks: JSON.stringify(recordData.breaks || []),
      shiftType: recordData.shiftType || 'Regular',
      workMode: recordData.workMode || 'Office',
      status: recordData.status || 'Checked Out',
      latitude: recordData.latitude ?? null,
      longitude: recordData.longitude ?? null,
      accuracy: recordData.accuracy ?? null,
      idempotencyKey: recordData.idempotencyKey || null,
      team: recordData.team || null,
      organizationId: recordData.organizationId || 'org-stackly',
      companyId: recordData.companyId || 'org-stackly',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await execute(`
      INSERT INTO attendancerecords (id, employeeId, employeeName, department, date, checkInTime, checkOutTime, breaks, shiftType, workMode, status, latitude, longitude, accuracy, idempotencyKey, team, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.employeeId, data.employeeName, data.department, data.date, data.checkInTime, data.checkOutTime, data.breaks, data.shiftType, data.workMode, data.status, data.latitude, data.longitude, data.accuracy, data.idempotencyKey, data.team, data.organizationId, data.companyId, data.createdAt, data.updatedAt
    ]);

    return this.findRecordById(recordData.id, data.companyId);
  }

  async findRecords(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT * FROM attendancerecords 
      ${clause} 
      ORDER BY date DESC, checkInTime DESC
    `, params) as any[];

    return rows.map(r => ({
      ...r,
      breaks: r.breaks ? JSON.parse(r.breaks) : []
    }));
  }

  async findTodayRecord(employeeId: string, todayDate: string, orgId: string) {
    const rows = await query(`
      SELECT * FROM attendancerecords 
      WHERE employeeId = ? AND date = ? AND (companyId = ? OR organizationId = ?) 
      ORDER BY checkInTime DESC
    `, [employeeId, todayDate, orgId, orgId]);
    
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as any;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async createCorrection(correctionData: any) {
    const timestamp = new Date().toISOString();
    const data = {
      id: correctionData.id,
      employeeId: correctionData.employeeId,
      employeeName: correctionData.employeeName || null,
      department: correctionData.department || null,
      date: correctionData.date,
      requestedCheckIn: correctionData.requestedCheckIn || null,
      requestedCheckOut: correctionData.requestedCheckOut || null,
      reason: correctionData.reason || null,
      status: correctionData.status || 'PENDING',
      managerComment: correctionData.managerComment || null,
      reviewedBy: correctionData.reviewedBy || null,
      createdAt: correctionData.createdAt || timestamp,
      team: correctionData.team || null,
      organizationId: correctionData.organizationId || 'org-stackly',
      companyId: correctionData.companyId || 'org-stackly',
      updatedAt: timestamp
    };

    await execute(`
      INSERT INTO correctionrequests (id, employeeId, employeeName, department, date, requestedCheckIn, requestedCheckOut, reason, status, managerComment, reviewedBy, createdAt, team, organizationId, companyId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.employeeId, data.employeeName, data.department, data.date, data.requestedCheckIn, data.requestedCheckOut, data.reason, data.status, data.managerComment, data.reviewedBy, data.createdAt, data.team, data.organizationId, data.companyId, data.updatedAt
    ]);

    return this.findCorrectionById(correctionData.id, data.companyId);
  }

  async findCorrectionById(id: string, orgId: string) {
    const rows = await query('SELECT * FROM correctionrequests WHERE id = ? AND (companyId = ? OR organizationId = ?)', [id, orgId, orgId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async findCorrections(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT * FROM correctionrequests 
      ${clause} 
      ORDER BY createdAt DESC
    `, params);
    return rows;
  }

  async findShifts(orgId: string) {
    const rows = await query('SELECT * FROM shifts WHERE companyId = ? OR organizationId = ? ORDER BY name ASC', [orgId, orgId]);
    return rows;
  }

  async createAuditLog(logData: any) {
    const timestamp = logData.timestamp || new Date().toISOString();
    const data = {
      id: logData.id || Math.random().toString(36).slice(2, 11),
      timestamp,
      employeeId: logData.employeeId || 'anonymous',
      action: logData.action || null,
      details: logData.details || null,
      organizationId: logData.organizationId || 'org-stackly',
      companyId: logData.companyId || 'org-stackly',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await execute(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.timestamp, data.employeeId, data.action, data.details, data.organizationId, data.companyId, data.createdAt, data.updatedAt
    ]);
    return data;
  }

  async findAuditLogs(queryData: any, limit = 250) {
    const { clause, params } = buildWhereClause(queryData);
    const queryParams = [...params, limit];
    const rows = await query(`
      SELECT * FROM audit_logs 
      ${clause} 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, queryParams);
    return rows;
  }
}

export const attendanceRepository = new AttendanceRepository();
export default attendanceRepository;
