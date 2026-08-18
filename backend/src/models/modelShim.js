import { getDb } from '../config/db.js';

// Get columns of a table to prevent no such column errors
let tableColumnsCache = {};
function getTableColumns(tableName) {
  if (!tableColumnsCache[tableName]) {
    try {
      const db = getDb();
      const info = db.prepare(`PRAGMA table_info(${tableName})`).all();
      tableColumnsCache[tableName] = info.map(col => col.name);
    } catch (e) {
      tableColumnsCache[tableName] = [];
    }
  }
  return tableColumnsCache[tableName];
}

// Convert Mongoose/JS Date objects to ISO strings for SQLite compatibility
function serializeValue(val) {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
}

// Helper to build SQL WHERE clause from Mongo query object
function buildWhereClause(tableName, query) {
  const clauses = [];
  const params = [];
  
  if (!query) return { clause: '', params };

  const columns = getTableColumns(tableName);

  for (let [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (key === '_id' && columns.includes('id')) {
      key = 'id';
    }

    if (!columns.includes(key) && (key === 'companyId' || key === 'organizationId')) {
      // If table doesn't have companyId/organizationId, fallback to whichever exists
      const targetKey = columns.includes('companyId') ? 'companyId' : (columns.includes('organizationId') ? 'organizationId' : null);
      if (targetKey) {
        clauses.push(`${targetKey} = ?`);
        params.push(serializeValue(value));
      }
      continue;
    }

    if (!columns.includes(key) && key !== '$or') {
      // Skip query parameters that don't match table columns to prevent SQLite errors
      continue;
    }

    if (key === 'companyId' || key === 'organizationId') {
      // Check if both columns exist in the table
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
          if (value[op] === null) {
            clauses.push(`${key} IS NOT NULL`);
          } else {
            clauses.push(`${key} != ?`);
            params.push(serializeValue(value[op]));
          }
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

// Map database column types (e.g. deserialize JSON fields when reading)
function deserializeRow(tableName, row) {
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
  
  // Expose a save() method on document instance
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

export class ModelShim {
  constructor(tableName) {
    this.tableName = tableName;
  }

  findById(id) {
    return this.findOne({ id });
  }

  find(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    const builder = {
      _sort: '',
      _limit: null,
      _skip: null,
      
      sort(sortObj) {
        if (sortObj) {
          if (typeof sortObj === 'string') {
            const field = sortObj.replace('-', '');
            const order = sortObj.startsWith('-') ? 'DESC' : 'ASC';
            this._sort = `ORDER BY ${field} ${order}`;
          } else {
            const field = Object.keys(sortObj)[0];
            if (field) {
              const order = sortObj[field] === -1 ? 'DESC' : 'ASC';
              this._sort = `ORDER BY ${field} ${order}`;
            }
          }
        }
        return this;
      },
      
      limit(n) {
        if (n !== undefined && n !== null) this._limit = n;
        return this;
      },
      
      skip(n) {
        if (n !== undefined && n !== null) this._skip = n;
        return this;
      },
      
      select() {
        return this;
      },
      
      session() {
        return this;
      },
      
      then: (resolve, reject) => {
        let sql = `SELECT * FROM ${this.tableName} ${clause}`;
        try {
          if (this._sort) sql += ` ${this._sort}`;
          if (this._limit !== null && this._limit !== undefined) sql += ` LIMIT ${this._limit}`;
          if (this._skip !== null && this._skip !== undefined) sql += ` OFFSET ${this._skip}`;
          
          const rows = db.prepare(sql).all(...params);
          resolve(rows.map(row => deserializeRow(this.tableName, row)));
        } catch (e) {
          console.error(`[SQLite Error in find] SQL: "${sql}", Params:`, params, e);
          reject(e);
        }
      }
    };
    
    return builder;
  }

  findOne(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    const builder = {
      _sort: '',
      
      sort(sortObj) {
        if (sortObj) {
          if (typeof sortObj === 'string') {
            const field = sortObj.replace('-', '');
            const order = sortObj.startsWith('-') ? 'DESC' : 'ASC';
            this._sort = `ORDER BY ${field} ${order}`;
          } else {
            const field = Object.keys(sortObj)[0];
            if (field) {
              const order = sortObj[field] === -1 ? 'DESC' : 'ASC';
              this._sort = `ORDER BY ${field} ${order}`;
            }
          }
        }
        return this;
      },
      
      session() {
        return this;
      },
      
      then: (resolve, reject) => {
        let sql = `SELECT * FROM ${this.tableName} ${clause}`;
        try {
          if (this._sort) sql += ` ${this._sort}`;
          sql += ` LIMIT 1`;
          
          const row = db.prepare(sql).get(...params);
          resolve(row ? deserializeRow(this.tableName, row) : null);
        } catch (e) {
          console.error(`[SQLite Error in findOne] SQL: "${sql}", Params:`, params, e);
          reject(e);
        }
      }
    };
    
    return builder;
  }

  async create(docOrDocs, options) {
    const db = getDb();
    const timestamp = new Date().toISOString();
    
    const docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
    const inserted = [];
    
    for (const doc of docs) {
      const data = { ...doc };
      if (!data.id && data._id) data.id = data._id;
      if (!data.id) data.id = Math.random().toString(36).slice(2, 11);
      
      if (this.tableName === 'users' && Array.isArray(data.permissions)) {
        data.permissions = JSON.stringify(data.permissions);
      }
      if (this.tableName === 'attendancerecords' && Array.isArray(data.breaks)) {
        data.breaks = JSON.stringify(data.breaks);
      }
      if (this.tableName === 'idempotencyrecords' && typeof data.response === 'object') {
        data.response = JSON.stringify(data.response);
      }
      
      const columns = getTableColumns(this.tableName);
      if (columns.includes('createdAt') && !data.createdAt) data.createdAt = timestamp;
      if (columns.includes('updatedAt') && !data.updatedAt) data.updatedAt = timestamp;
      
      const fields = Object.keys(data).filter(k => k !== '_id' && columns.includes(k));
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(k => serializeValue(data[k]));
      
      try {
        db.prepare(`
          INSERT INTO ${this.tableName} (${fields.join(', ')})
          VALUES (${placeholders})
        `).run(...values);
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE constraint failed')) {
          err.code = 11000; // Map unique constraint failure to Mongo's duplicate key code
        }
        throw err;
      }
      
      let insertedRow;
      if (this.tableName === 'idempotencyrecords') {
        insertedRow = db.prepare(`SELECT * FROM ${this.tableName} WHERE companyId = ? AND key = ?`).get(data.companyId, data.key);
      } else {
        insertedRow = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(data.id);
      }
      
      inserted.push(deserializeRow(this.tableName, insertedRow));
    }
    
    return Array.isArray(docOrDocs) ? inserted : inserted[0];
  }

  async insertMany(docs) {
    return this.create(docs);
  }

  async _updateOneInternal(query, update) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    
    const columns = getTableColumns(this.tableName);
    const fields = Object.keys(updates).filter(k => columns.includes(k));
    if (fields.length === 0) return { nModified: 0 };
    
    let setClause = fields.map(k => `${k} = ?`).join(', ');
    const values = fields.map(k => {
      let v = updates[k];
      if (this.tableName === 'users' && k === 'permissions' && Array.isArray(v)) return JSON.stringify(v);
      if (this.tableName === 'attendancerecords' && k === 'breaks' && Array.isArray(v)) return JSON.stringify(v);
      if (this.tableName === 'idempotencyrecords' && k === 'response' && typeof v === 'object') return JSON.stringify(v);
      return serializeValue(v);
    });
    
    if (columns.includes('updatedAt')) {
      setClause += setClause ? ', updatedAt = ?' : 'updatedAt = ?';
      values.push(new Date().toISOString());
    }
    
    const queryParams = [...values, ...params];
    const info = db.prepare(`UPDATE ${this.tableName} SET ${setClause} ${clause}`).run(...queryParams);
    return { nModified: info.changes };
  }

  updateOne(query, update) {
    const builder = {
      session: () => builder,
      then: (resolve, reject) => {
        this._updateOneInternal(query, update).then(resolve, reject);
      }
    };
    return builder;
  }

  updateMany(query, update) {
    return this.updateOne(query, update);
  }

  async findOneAndUpdate(query, update, options) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    const row = db.prepare(`SELECT * FROM ${this.tableName} ${clause} LIMIT 1`).get(...params);
    if (!row) return null;
    
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    
    const columns = getTableColumns(this.tableName);
    const fields = Object.keys(updates).filter(k => columns.includes(k));
    if (fields.length > 0) {
      let setClause = fields.map(k => `${k} = ?`).join(', ');
      const values = fields.map(k => {
        let v = updates[k];
        if (this.tableName === 'users' && k === 'permissions' && Array.isArray(v)) return JSON.stringify(v);
        if (this.tableName === 'attendancerecords' && k === 'breaks' && Array.isArray(v)) return JSON.stringify(v);
        if (this.tableName === 'idempotencyrecords' && k === 'response' && typeof v === 'object') return JSON.stringify(v);
        return serializeValue(v);
      });
      if (columns.includes('updatedAt')) {
        setClause += setClause ? ', updatedAt = ?' : 'updatedAt = ?';
        values.push(new Date().toISOString());
      }
      
      if (this.tableName === 'idempotencyrecords') {
        values.push(row.companyId, row.key);
        db.prepare(`UPDATE ${this.tableName} SET ${setClause} WHERE companyId = ? AND key = ?`).run(...values);
      } else {
        values.push(row.id);
        db.prepare(`UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`).run(...values);
      }
    }
    
    let updatedRow;
    if (this.tableName === 'idempotencyrecords') {
      updatedRow = db.prepare(`SELECT * FROM ${this.tableName} WHERE companyId = ? AND key = ?`).get(row.companyId, row.key);
    } else {
      updatedRow = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(row.id);
    }
    return deserializeRow(this.tableName, updatedRow);
  }

  async findOneAndDelete(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const row = db.prepare(`SELECT * FROM ${this.tableName} ${clause} LIMIT 1`).get(...params);
    if (!row) return null;
    
    if (this.tableName === 'idempotencyrecords') {
      db.prepare(`DELETE FROM ${this.tableName} WHERE companyId = ? AND key = ?`).run(row.companyId, row.key);
    } else {
      db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(row.id);
    }
    return deserializeRow(this.tableName, row);
  }

  async _deleteOneInternal(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const info = db.prepare(`DELETE FROM ${this.tableName} ${clause}`).run(...params);
    return { deletedCount: info.changes };
  }

  deleteOne(query) {
    const builder = {
      session: () => builder,
      then: (resolve, reject) => {
        this._deleteOneInternal(query).then(resolve, reject);
      }
    };
    return builder;
  }

  deleteMany(query) {
    const builder = {
      session: () => builder,
      then: (resolve, reject) => {
        this._deleteOneInternal(query).then(resolve, reject);
      }
    };
    return builder;
  }

  async countDocuments(query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName} ${clause}`).get(...params);
    return row.count;
  }

  async distinct(field, query) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const rows = db.prepare(`SELECT DISTINCT ${field} FROM ${this.tableName} ${clause}`).all(...params);
    return rows.map(r => r[field]);
  }
}
