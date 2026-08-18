import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORGANIZATION_ID = 'org-stackly';

// Resolve database file path
const DB_DIR = path.resolve(__dirname, '../../database');
const DB_PATH = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;
let initPromise = null;

export const getDb = () => {
  if (!db) {
    db = new Database(DB_PATH, { verbose: console.log });
    // Enable Foreign Keys and WAL mode for concurrency
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const initDb = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log(`[SQLite Init] Connecting to SQLite database at: ${DB_PATH}`);
        const connection = getDb();

        // Check if database tables need to be created
        // We can run the schema.sql script
        if (fs.existsSync(SCHEMA_PATH)) {
          console.log('[SQLite Init] Executing schema.sql...');
          const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
          connection.exec(schema);
        } else {
          console.warn(`[SQLite Init] Warning: Schema file not found at ${SCHEMA_PATH}`);
        }

        // Run seeding script if user count is 0
        const userCountRow = connection.prepare('SELECT COUNT(*) as count FROM users').get();
        if (userCountRow.count === 0) {
          console.log('[SQLite Init] Database is empty. Seeding default data...');
          const { seedSqlite } = await import('../../scripts/seed-sqlite.js');
          await seedSqlite();
        } else {
          console.log(`[SQLite Init] Existing database detected with ${userCountRow.count} users. Seeding skipped.`);
        }

        // Validate startup: run startup test audit log
        console.log('[SQLite Init] Performing database read/write validation...');
        const testId = 'startup-verify-' + Date.now();
        const timestamp = new Date().toISOString();
        
        connection.prepare(`
          INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(testId, timestamp, 'system', 'startup-test', 'validation-write', ORGANIZATION_ID, ORGANIZATION_ID);

        const verifyRow = connection.prepare('SELECT * FROM audit_logs WHERE id = ?').get(testId);
        if (!verifyRow) {
          throw new Error('Database write verification failed: could not retrieve written row.');
        }

        connection.prepare('DELETE FROM audit_logs WHERE id = ?').run(testId);
        console.log('[SQLite Init] SQLite database initialization completed successfully.');
        return true;
      } catch (err) {
        console.error('Database initialization failed:', err);
        throw err;
      }
    })();
  }
  return initPromise;
};

export const logAudit = (userId, action, details, organizationId = ORGANIZATION_ID) => {
  const id = Math.random().toString(36).slice(2, 11);
  const timestamp = new Date().toISOString();
  
  try {
    const connection = getDb();
    connection.prepare(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, timestamp, userId || 'anonymous', action, details, organizationId, organizationId);
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

export { db, ORGANIZATION_ID };
export default {};
