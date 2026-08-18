import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runSeed } from '../seeds/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../sqlite');
const dbName = process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite';
const DB_PATH = path.join(DB_DIR, dbName);

export const seedDatabase = () => {
  console.log(`[Seed Script] Seeding database at: ${DB_PATH}`);
  const db = new Database(DB_PATH);
  
  runSeed(db);
  
  db.close();
  console.log('[Seed Script] Seeding completed.');
};

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Seeding run failed:', err);
    process.exit(1);
  }
}
