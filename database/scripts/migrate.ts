import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../sqlite');
const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

// Determine environment database
const dbName = process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite';
const DB_PATH = path.join(DB_DIR, dbName);

export const runMigrations = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  console.log(`[Migration] Connecting to database: ${DB_PATH}`);
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  // Find all migrations in order
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`[Migration] Found ${files.length} migrations to run.`);
  
  db.transaction(() => {
    for (const file of files) {
      console.log(`[Migration] Running: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      db.exec(sql);
    }
  })();

  console.log('[Migration] Database migrations completed successfully.');
  db.close();
};

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  try {
    runMigrations();
    process.exit(0);
  } catch (err) {
    console.error('Migration run failed:', err);
    process.exit(1);
  }
}
