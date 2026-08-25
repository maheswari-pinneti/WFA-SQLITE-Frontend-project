import { getDb, query, execute } from './connection.js';
import { buildWhereClause, deserializeRow, serializeValue, getTableColumns } from './query.js';

export class ModelShim {
  tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  findById(id: string) {
    return this.findOne({ id });
  }

  find(queryParam?: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    
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
        if (this._sort) sql += ` ${this._sort}`;
        if (this._limit !== null && this._limit !== undefined) sql += ` LIMIT ${this._limit}`;
        if (this._skip !== null && this._skip !== undefined) sql += ` OFFSET ${this._skip}`;

        query(sql, params)
          .then(rows => {
            resolve(rows.map(row => deserializeRow(this.tableName, row)));
          })
          .catch(e => {
            console.error(`[SQLite Error in find] SQL: "${sql}", Params:`, params, e);
            reject(e);
          });
      }
    };
    
    return builder;
  }

  findOne(queryParam?: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    
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
        if (this._sort) sql += ` ${this._sort}`;
        sql += ` LIMIT 1`;
        
        query(sql, params)
          .then(rows => {
            const row = rows[0] || null;
            resolve(row ? deserializeRow(this.tableName, row) : null);
          })
          .catch(e => {
            console.error(`[SQLite Error in findOne] SQL: "${sql}", Params:`, params, e);
            reject(e);
          });
      }
    };
    
    return builder;
  }

  async create(docOrDocs: any, options?: any) {
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
        await execute(`
          INSERT INTO ${this.tableName} (${fields.join(', ')})
          VALUES (${placeholders})
        `, values);
      } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE constraint failed')) {
          err.code = 11000;
        }
        throw err;
      }
      
      let insertedRow;
      if (this.tableName === 'idempotencyrecords') {
        const rows = await query(`SELECT * FROM ${this.tableName} WHERE companyId = ? AND key = ?`, [data.companyId, data.key]);
        insertedRow = rows[0];
      } else {
        const rows = await query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [data.id]);
        insertedRow = rows[0];
      }
      
      inserted.push(deserializeRow(this.tableName, insertedRow));
    }
    
    return Array.isArray(docOrDocs) ? inserted : inserted[0];
  }

  async insertMany(docs: any[]) {
    return this.create(docs);
  }

  async _updateOneInternal(queryParam: any, update: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    
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
    const info = await execute(`UPDATE ${this.tableName} SET ${setClause} ${clause}`, queryParams);
    const changes = info && typeof info.changes === 'number' ? info.changes : 1;
    return { nModified: changes };
  }

  updateOne(queryParam: any, update: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._updateOneInternal(queryParam, update).then(resolve, reject);
      }
    };
    return builder;
  }

  updateMany(queryParam: any, update: any) {
    return this.updateOne(queryParam, update);
  }

  async findOneAndUpdate(queryParam: any, update: any, options?: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    
    const rows = await query(`SELECT * FROM ${this.tableName} ${clause} LIMIT 1`, params);
    const row = rows[0];
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
        await execute(`UPDATE ${this.tableName} SET ${setClause} WHERE companyId = ? AND key = ?`, values);
      } else {
        values.push(row.id);
        await execute(`UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`, values);
      }
    }
    
    let updatedRow;
    if (this.tableName === 'idempotencyrecords') {
      const rows = await query(`SELECT * FROM ${this.tableName} WHERE companyId = ? AND key = ?`, [row.companyId, row.key]);
      updatedRow = rows[0];
    } else {
      const rows = await query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [row.id]);
      updatedRow = rows[0];
    }
    return deserializeRow(this.tableName, updatedRow);
  }

  async findOneAndDelete(queryParam: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    const rows = await query(`SELECT * FROM ${this.tableName} ${clause} LIMIT 1`, params);
    const row = rows[0];
    if (!row) return null;
    
    if (this.tableName === 'idempotencyrecords') {
      await execute(`DELETE FROM ${this.tableName} WHERE companyId = ? AND key = ?`, [row.companyId, row.key]);
    } else {
      await execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [row.id]);
    }
    return deserializeRow(this.tableName, row);
  }

  async _deleteOneInternal(queryParam: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    const info = await execute(`DELETE FROM ${this.tableName} ${clause}`, params);
    const changes = info && typeof info.changes === 'number' ? info.changes : 1;
    return { deletedCount: changes };
  }

  deleteOne(queryParam: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._deleteOneInternal(queryParam).then(resolve, reject);
      }
    };
    return builder;
  }

  deleteMany(queryParam: any) {
    const builder = {
      session: () => builder,
      then: (resolve: (val: any) => void, reject: (err: any) => void) => {
        this._deleteOneInternal(queryParam).then(resolve, reject);
      }
    };
    return builder;
  }

  async countDocuments(queryParam?: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    const rows = await query(`SELECT COUNT(*) as count FROM ${this.tableName} ${clause}`, params);
    const row = rows[0] as any;
    return row ? row.count : 0;
  }

  async distinct(field: string, queryParam?: any) {
    const { clause, params } = buildWhereClause(this.tableName, queryParam);
    const rows = await query(`SELECT DISTINCT ${field} FROM ${this.tableName} ${clause}`, params) as any[];
    return rows.map(r => r[field]);
  }
}
