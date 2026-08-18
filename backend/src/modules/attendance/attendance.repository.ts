import { getDb } from '../../database/connection.js';

function buildWhereClause(query: any) {
  const clauses: string[] = [];
  const params: any[] = [];
  
  for (const [key, value] of Object.entries(query)) {
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
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM attendancerecords 
      WHERE employeeId = ? AND (companyId = ? OR organizationId = ?) AND status != 'Checked Out'
    `).get(employeeId, orgId, orgId) as any;
    
    if (!row) return null;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async findRecordById(id: string, orgId: string) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM attendancerecords WHERE id = ? AND (companyId = ? OR organizationId = ?)').get(id, orgId, orgId) as any;
    if (!row) return null;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async findRecordByIdempotencyKey(idempotencyKey: string, orgId: string) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM attendancerecords WHERE idempotencyKey = ? AND (companyId = ? OR organizationId = ?)').get(idempotencyKey, orgId, orgId) as any;
    if (!row) return null;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async createRecord(recordData: any) {
    const db = getDb();
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

    db.prepare(`
      INSERT INTO attendancerecords (id, employeeId, employeeName, department, date, checkInTime, checkOutTime, breaks, shiftType, workMode, status, latitude, longitude, accuracy, idempotencyKey, team, organizationId, companyId, createdAt, updatedAt)
      VALUES (@id, @employeeId, @employeeName, @department, @date, @checkInTime, @checkOutTime, @breaks, @shiftType, @workMode, @status, @latitude, @longitude, @accuracy, @idempotencyKey, @team, @organizationId, @companyId, @createdAt, @updatedAt)
    `).run(data);

    return this.findRecordById(recordData.id, data.companyId);
  }

  async findRecords(query: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT * FROM attendancerecords 
      ${clause} 
      ORDER BY date DESC, checkInTime DESC
    `).all(...params) as any[];

    return rows.map(r => ({
      ...r,
      breaks: r.breaks ? JSON.parse(r.breaks) : []
    }));
  }

  async findTodayRecord(employeeId: string, todayDate: string, orgId: string) {
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM attendancerecords 
      WHERE employeeId = ? AND date = ? AND (companyId = ? OR organizationId = ?) 
      ORDER BY checkInTime DESC
    `).get(employeeId, todayDate, orgId, orgId) as any;
    
    if (!row) return null;
    return {
      ...row,
      breaks: row.breaks ? JSON.parse(row.breaks) : []
    };
  }

  async createCorrection(correctionData: any) {
    const db = getDb();
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

    db.prepare(`
      INSERT INTO correctionrequests (id, employeeId, employeeName, department, date, requestedCheckIn, requestedCheckOut, reason, status, managerComment, reviewedBy, createdAt, team, organizationId, companyId, updatedAt)
      VALUES (@id, @employeeId, @employeeName, @department, @date, @requestedCheckIn, @requestedCheckOut, @reason, @status, @managerComment, @reviewedBy, @createdAt, @team, @organizationId, @companyId, @updatedAt)
    `).run(data);

    return this.findCorrectionById(correctionData.id, data.companyId);
  }

  async findCorrectionById(id: string, orgId: string) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM correctionrequests WHERE id = ? AND (companyId = ? OR organizationId = ?)').get(id, orgId, orgId);
    return row || null;
  }

  async findCorrections(query: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const rows = db.prepare(`
      SELECT * FROM correctionrequests 
      ${clause} 
      ORDER BY createdAt DESC
    `).all(...params);
    return rows;
  }

  async findShifts(orgId: string) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM shifts WHERE companyId = ? OR organizationId = ? ORDER BY name ASC').all(orgId, orgId);
    return rows;
  }

  async createAuditLog(logData: any) {
    const db = getDb();
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
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId, createdAt, updatedAt)
      VALUES (@id, @timestamp, @employeeId, @action, @details, @organizationId, @companyId, @createdAt, @updatedAt)
    `).run(data);
    return data;
  }

  async findAuditLogs(query: any, limit = 250) {
    const db = getDb();
    const { clause, params } = buildWhereClause(query);
    const queryParams = [...params, limit];
    const rows = db.prepare(`
      SELECT * FROM audit_logs 
      ${clause} 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(...queryParams);
    return rows;
  }
}

export const attendanceRepository = new AttendanceRepository();
export default attendanceRepository;
