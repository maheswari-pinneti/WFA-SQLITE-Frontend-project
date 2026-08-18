import { getDb } from './connection.js';
import { buildWhereClause, deserializeRow, serializeValue, getTableColumns } from './query.js';

export class ModelShim {
  tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  findById(id: string) {
    return this.findOne({ id });
  }

  find(query?: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    const builder = {
      _sort: '',
      _limit: null as number | null,
      _skip: null as number | null,
      
      sort(sortObj: any) {
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
      
      limit(n: any) {
        if (n !== undefined && n !== null) this._limit = n;
        return this;
      },
      
      skip(n: any) {
        if (n !== undefined && n !== null) this._skip = n;
        return this;
      },
      
      select() {
        return this;
      },
      
      session() {
        return this;
      },
      
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
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

  findOne(query?: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    
    const builder = {
      _sort: '',
      
      sort(sortObj: any) {
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
      
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
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

  async create(docOrDocs: any, options?: any) {
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
      } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE constraint failed')) {
          err.code = 11000;
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

  async insertMany(docs: any[]) {
    return this.create(docs);
  }

  async _updateOneInternal(query: any, update: any) {
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

  updateOne(query: any, update: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._updateOneInternal(query, update).then(resolve, reject);
      }
    };
    return builder;
  }

  updateMany(query: any, update: any) {
    return this.updateOne(query, update);
  }

  async findOneAndUpdate(query: any, update: any, options?: any) {
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

  async findOneAndDelete(query: any) {
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

  async _deleteOneInternal(query: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const info = db.prepare(`DELETE FROM ${this.tableName} ${clause}`).run(...params);
    return { deletedCount: info.changes };
  }

  deleteOne(query: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._deleteOneInternal(query).then(resolve, reject);
      }
    };
    return builder;
  }

  deleteMany(query: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._deleteOneInternal(query).then(resolve, reject);
      }
    };
    return builder;
  }

  async countDocuments(query?: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName} ${clause}`).get(...params) as any;
    return row.count;
  }

  async distinct(field: string, query?: any) {
    const db = getDb();
    const { clause, params } = buildWhereClause(this.tableName, query);
    const rows = db.prepare(`SELECT DISTINCT ${field} FROM ${this.tableName} ${clause}`).all(...params) as any[];
    return rows.map(r => r[field]);
  }
}
