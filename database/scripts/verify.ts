import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../sqlite');
const dbName = process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite';
const DB_PATH = path.join(DB_DIR, dbName);

export const runVerify = () => {
  console.log(`[Verify] Verifying database schema and records at: ${DB_PATH}`);
  const db = new Database(DB_PATH);
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
  console.log(`[Verify] Found ${tables.length} tables:`);
  
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
    console.log(`  - ${table.name}: ${row.count} records`);
  }
  
  db.close();
  console.log('[Verify] Database verification completed successfully.');
};

if (process.argv[1] && process.argv[1].endsWith('verify.ts')) {
  try {
    runVerify();
    process.exit(0);
  } catch (err) {
    console.error('Verify failed:', err);
    process.exit(1);
  }
}
