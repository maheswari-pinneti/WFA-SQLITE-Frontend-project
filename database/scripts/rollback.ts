import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../sqlite');
const dbName = process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite';
const DB_PATH = path.join(DB_DIR, dbName);

export const runRollback = () => {
  console.log(`[Rollback] Dropping all tables at: ${DB_PATH}`);
  const db = new Database(DB_PATH);
  
  db.transaction(() => {
    // Drop all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
    for (const table of tables) {
      console.log(`[Rollback] Dropping table: ${table.name}`);
      db.exec(`DROP TABLE IF EXISTS ${table.name}`);
    }
  })();
  
  db.close();
  console.log('[Rollback] Database rollback completed successfully.');
};

if (process.argv[1] && process.argv[1].endsWith('rollback.ts')) {
  try {
    runRollback();
    process.exit(0);
  } catch (err) {
    console.error('Rollback failed:', err);
    process.exit(1);
  }
}
