import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../../database/sqlite');
const DB_PATH = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite');

let cloudDb: SQLiteCloudDatabase | null = null;
let localDb: BetterSqlite3.Database | null = null;

export const connectDatabase = async (): Promise<any> => {
  const cloudUrl = process.env.SQLITE_CLOUD_URL || process.env.SQLITE_CLOUD_CONNECTION_STRING;
  if (cloudUrl) {
    console.log('[Database] Connecting to SQLite Cloud database...');
    cloudDb = new SQLiteCloudDatabase(cloudUrl);
    return cloudDb;
  } else {
    console.log(`[Database] Falling back to local SQLite at ${DB_PATH}`);
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    localDb = new BetterSqlite3(DB_PATH, { timeout: 10000 });
    localDb.pragma('foreign_keys = ON');
    localDb.pragma('journal_mode = WAL');
    return localDb;
  }
};

export const getDatabase = (): any => {
  if (cloudDb) return cloudDb;
  if (localDb) return localDb;
  throw new Error('Database is not initialized. Please call connectDatabase() first.');
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  const db = getDatabase();
  if (cloudDb) {
    return await cloudDb.sql(sql, ...params) as T[];
  } else {
    return localDb!.prepare(sql).all(...params) as T[];
  }
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  const db = getDatabase();
  if (cloudDb) {
    return await cloudDb.sql(sql, ...params);
  } else {
    return localDb!.prepare(sql).run(...params);
  }
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  const db = getDatabase();
  if (cloudDb) {
    await cloudDb.sql('BEGIN TRANSACTION');
    try {
      const res = await fn();
      await cloudDb.sql('COMMIT');
      return res;
    } catch (err) {
      await cloudDb.sql('ROLLBACK');
      throw err;
    }
  } else {
    localDb!.prepare('BEGIN TRANSACTION').run();
    try {
      const res = await fn();
      localDb!.prepare('COMMIT').run();
      return res;
    } catch (err) {
      localDb!.prepare('ROLLBACK').run();
      throw err;
    }
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const res = await query('SELECT 1 as active');
    return res && res.length > 0 && res[0].active === 1;
  } catch (err) {
    console.error('[Database Health] Health check failed:', err);
    return false;
  }
};
