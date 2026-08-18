import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ORGANIZATION_ID = 'org-stackly';

const DB_DIR = path.resolve(__dirname, '../../../database/sqlite');
const DB_PATH = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite');

let db: Database.Database | null = null;
let initPromise: Promise<void> | null = null;

export const getDb = (): Database.Database => {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const initDb = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log(`[SQLite Init] Connecting to SQLite database at: ${DB_PATH}`);
        const connection = getDb();

        // Trigger migrations runner if DB table count is 0
        const tableCount = (connection.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as any).count;
        if (tableCount === 0) {
          console.log('[SQLite Init] Database is empty. Running migrations and seeders...');
          const { runMigrations } = await import('../../../database/scripts/migrate.js');
          const { seedDatabase } = await import('../../../database/scripts/seed.js');
          runMigrations();
          seedDatabase();
        }

        // Perform health check write
        const id = 'startup-verify-' + Date.now();
        const timestamp = new Date().toISOString();
        connection.prepare(`
          INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
          VALUES (?, ?, 'system', 'startup-test', 'validation-write', ?, ?)
        `).run(id, timestamp, ORGANIZATION_ID, ORGANIZATION_ID);
        connection.prepare('DELETE FROM audit_logs WHERE id = ?').run(id);

        console.log('[SQLite Init] SQLite database connection verified successfully.');
      } catch (err: any) {
        console.error('[SQLite Init] Database initialization failed:', err);
        throw err;
      }
    })();
  }
  return initPromise;
};

export const logAudit = (userId: string, action: string, details: string, organizationId: string = ORGANIZATION_ID): void => {
  const id = Math.random().toString(36).slice(2, 11);
  const timestamp = new Date().toISOString();
  try {
    const connection = getDb();
    connection.prepare(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, timestamp, userId || 'anonymous', action, details, organizationId, organizationId);
  } catch (err) {
    console.error('[logAudit] Failed to log audit event:', err);
  }
};
