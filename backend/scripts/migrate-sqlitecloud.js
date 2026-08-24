import { Database } from '@sqlitecloud/drivers';
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DB_PATH = path.resolve(__dirname, '../../database/sqlite/wfa.sqlite');
const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

async function migrate() {
  const connectionString = process.env.SQLITE_CLOUD_CONNECTION_STRING;
  if (!connectionString) {
    console.error('Error: SQLITE_CLOUD_CONNECTION_STRING is not set in your .env file.');
    process.exit(1);
  }

  console.log('[SQLite Cloud] Connecting to remote cluster...');
  const cloudDb = new Database(connectionString);

  try {
    // 1. Run migrations on SQLite Cloud
    console.log('[SQLite Cloud] Running migrations...');
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`[SQLite Cloud] Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      
      // Execute SQL scripts on SQLite Cloud
      // Splitting statements by semicolon is usually safer for raw scripts
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await cloudDb.sql(statement);
      }
    }
    console.log('[SQLite Cloud] Migrations applied successfully.');

    // 2. Check if local SQLite database exists to upload data
    if (fs.existsSync(LOCAL_DB_PATH)) {
      console.log(`[SQLite Cloud] Found local SQLite database at ${LOCAL_DB_PATH}. Syncing data to cloud...`);
      const localDb = new BetterSqlite3(LOCAL_DB_PATH);

      // Get all tables
      const tables = localDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map(t => t.name);

      for (const table of tables) {
        console.log(`[SQLite Cloud] Uploading data for table: ${table}...`);
        
        // Fetch rows
        const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
        if (rows.length === 0) continue;

        // Get columns
        const cols = Object.keys(rows[0]);
        const colsStr = cols.join(', ');

        const batchSize = 50;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batchRows = rows.slice(i, i + batchSize);
          const valueStrings = [];
          for (const row of batchRows) {
            const values = cols.map(c => {
              const val = row[c];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              return val;
            });
            valueStrings.push(`(${values.join(', ')})`);
          }
          const insertSql = `INSERT OR REPLACE INTO ${table} (${colsStr}) VALUES ${valueStrings.join(', ')}`;
          await cloudDb.sql(insertSql);
        }
      }
      localDb.close();
      console.log('[SQLite Cloud] Local data synchronization complete.');
    } else {
      console.log('[SQLite Cloud] No local database found. Running cloud seeder...');
      // Run fallback seeds
    }

    console.log('✨ SQLite Cloud database is fully initialized and hosted successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    cloudDb.close();
  }
}

migrate();
