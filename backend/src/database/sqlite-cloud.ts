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
  if (cloudUrl && process.env.NODE_ENV !== 'test') {
    try {
      console.log('[Database] Connecting to SQLite Cloud database...');
      const testDb = new SQLiteCloudDatabase(cloudUrl);
      // Run test query immediately to check if server is paused/down
      await testDb.sql('SELECT 1 as active');
      console.log('[Database] Successfully connected to SQLite Cloud.');
      cloudDb = testDb;
      return cloudDb;
    } catch (err: any) {
      console.error('[Database] SQLite Cloud unavailable (node may be paused or offline). Falling back to local SQLite. Error:', err.message);
      cloudDb = null;
    }
  }

  console.log(`[Database] Connecting to local SQLite at ${DB_PATH}`);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  localDb = new BetterSqlite3(DB_PATH, { timeout: 10000 });
  localDb.pragma('foreign_keys = ON');
  localDb.pragma('journal_mode = WAL');
  localDb.pragma('synchronous = NORMAL');
  
  // Validate database integrity on connection setup
  const integrityResult = localDb.pragma('integrity_check');
  if (integrityResult && integrityResult[0] && integrityResult[0].integrity_check !== 'ok') {
    console.warn(`[Database] Warning: SQLite database integrity check returned: ${integrityResult[0].integrity_check}`);
  }
  
  // Checkpoint WAL frames to base database file
  localDb.pragma('wal_checkpoint(PASSIVE)');
  
  return localDb;
};

const isConnectionError = (err: any): boolean => {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('connection unavailable') ||
    msg.includes('disconnected') ||
    msg.includes('paused') ||
    msg.includes('inactive') ||
    msg.includes('closed by the remote host') ||
    err.errorCode === 'ERR_CONNECTION_NOT_ESTABLISHED' ||
    err.code === 'ERR_CONNECTION_NOT_ESTABLISHED' ||
    err.errorCode === '10010'
  );
};

const ensureLocalDbInitialized = async () => {
  if (localDb) return;
  console.log(`[Database] Initializing local SQLite fallback database at ${DB_PATH}`);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  localDb = new BetterSqlite3(DB_PATH, { timeout: 10000 });
  localDb.pragma('foreign_keys = ON');
  localDb.pragma('journal_mode = WAL');
  localDb.pragma('synchronous = NORMAL');
  localDb.pragma('wal_checkpoint(PASSIVE)');
};

export const getDatabase = (): any => {
  if (cloudDb) return cloudDb;
  if (localDb) return localDb;
  throw new Error('Database is not initialized. Please call connectDatabase() first.');
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (cloudDb) {
    try {
      return await cloudDb.sql(sql, ...params) as T[];
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost or node paused. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        return localDb!.prepare(sql).all(...params) as T[];
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  return localDb!.prepare(sql).all(...params) as T[];
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  if (cloudDb) {
    try {
      return await cloudDb.sql(sql, ...params);
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost or node paused. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        return localDb!.prepare(sql).run(...params);
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  return localDb!.prepare(sql).run(...params);
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (cloudDb) {
    try {
      await cloudDb.sql('BEGIN TRANSACTION');
      try {
        const res = await fn();
        await cloudDb.sql('COMMIT');
        return res;
      } catch (err) {
        await cloudDb.sql('ROLLBACK');
        throw err;
      }
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost during transaction setup. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        // Retry logic on localDb
        localDb!.prepare('BEGIN TRANSACTION').run();
        try {
          const res = await fn();
          localDb!.prepare('COMMIT').run();
          return res;
        } catch (localErr) {
          localDb!.prepare('ROLLBACK').run();
          throw localErr;
        }
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  localDb!.prepare('BEGIN TRANSACTION').run();
  try {
    const res = await fn();
    localDb!.prepare('COMMIT').run();
    return res;
  } catch (err) {
    localDb!.prepare('ROLLBACK').run();
    throw err;
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
