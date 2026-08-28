import { getDb } from './connection.js';

let tableColumnsCache: Record<string, string[]> = {};

export function getTableColumns(tableName: string): string[] {
  if (!tableColumnsCache[tableName]) {
    try {
      const db = getDb();
      const info = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
      tableColumnsCache[tableName] = info.map(col => col.name);
    } catch (e) {
      tableColumnsCache[tableName] = [];
    }
  }
  return tableColumnsCache[tableName];
}

export function serializeValue(val: any): any {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
}

export function buildWhereClause(tableName: string, query: any): { clause: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];
  
  if (!query) return { clause: '', params };

  const columns = getTableColumns(tableName);

  for (let [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (key === '_id' && columns.includes('id')) {
      key = 'id';
    }

    if (!columns.includes(key) && (key === 'companyId' || key === 'organizationId')) {
      const targetKey = columns.includes('companyId') ? 'companyId' : (columns.includes('organizationId') ? 'organizationId' : null);
      if (targetKey) {
        clauses.push(`${targetKey} = ?`);
        params.push(serializeValue(value));
      }
      continue;
    }

    if (!columns.includes(key) && key !== '$or') {
      continue;
    }

    if (key === 'companyId' || key === 'organizationId') {
      const hasCompany = columns.includes('companyId');
      const hasOrg = columns.includes('organizationId');
      const val = serializeValue(value);
      if (hasCompany && hasOrg) {
        clauses.push(`(companyId = ? OR organizationId = ?)`);
        params.push(val, val);
      } else if (hasCompany) {
        clauses.push(`companyId = ?`);
        params.push(val);
      } else if (hasOrg) {
        clauses.push(`organizationId = ?`);
        params.push(val);
      }
    } else if (value instanceof RegExp) {
      const val = value.source.replace('^', '').replace('$', '').replace(/\\/g, '');
      clauses.push(`${key} LIKE ?`);
      params.push(`%${val}%`);
    } else if (typeof value === 'object' && value !== null) {
      const operators = Object.keys(value);
      operators.forEach(op => {
        if (op === '$ne') {
          const vals = Array.isArray(value[op]) ? value[op] : [value[op]];
          vals.forEach((v: any) => {
            if (v === null) {
              clauses.push(`${key} IS NOT NULL`);
            } else {
              clauses.push(`${key} != ?`);
              params.push(serializeValue(v));
            }
          });
        } else if (op === '$in') {
          const list = value[op];
          if (Array.isArray(list) && list.length > 0) {
            const placeholders = list.map(() => '?').join(', ');
            clauses.push(`${key} IN (${placeholders})`);
            params.push(...list.map(serializeValue));
          }
        }
      });
    } else {
      clauses.push(`${key} = ?`);
      params.push(serializeValue(value));
    }
  }

  const clause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { clause, params };
}

export function deserializeRow(tableName: string, row: any): any {
  if (!row) return null;
  const result = { ...row };
  
  if (tableName === 'users' && result.permissions) {
    try { result.permissions = JSON.parse(result.permissions); } catch (e) { result.permissions = []; }
  }
  if (tableName === 'attendancerecords' && result.breaks) {
    try { result.breaks = JSON.parse(result.breaks); } catch (e) { result.breaks = []; }
  }
  if (tableName === 'idempotencyrecords' && result.response) {
    try { result.response = JSON.parse(result.response); } catch (e) { result.response = {}; }
  }
  
  if (result.id) {
    result._id = result.id;
  }
  
  result.save = async function() {
    try {
      const db = getDb();
      const columns = getTableColumns(tableName);
      const fields = Object.keys(result).filter(k => typeof result[k] !== 'function' && k !== '_id' && k !== 'id' && columns.includes(k));
      
      let serializedData = { ...result };
      if (tableName === 'users' && Array.isArray(serializedData.permissions)) {
        serializedData.permissions = JSON.stringify(serializedData.permissions);
      }
      if (tableName === 'attendancerecords' && Array.isArray(serializedData.breaks)) {
        serializedData.breaks = JSON.stringify(serializedData.breaks);
      }
      if (tableName === 'idempotencyrecords' && typeof serializedData.response === 'object') {
        serializedData.response = JSON.stringify(serializedData.response);
      }
      
      let setClause = fields.map(k => `${k} = ?`).join(', ');
      const values = fields.map(k => serializeValue(serializedData[k]));
      if (columns.includes('updatedAt')) {
        setClause += setClause ? ', updatedAt = ?' : 'updatedAt = ?';
        values.push(new Date().toISOString());
      }
      
      if (tableName === 'idempotencyrecords') {
        values.push(result.companyId, result.key);
        db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE companyId = ? AND key = ?`).run(...values);
      } else {
        values.push(result.id);
        db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`).run(...values);
      }
      return result;
    } catch (e) {
      console.error(`[SQLite Error in Document.save] Table: ${tableName}, ID: ${result.id}`, e);
      throw e;
    }
  };
  
  return result;
}
