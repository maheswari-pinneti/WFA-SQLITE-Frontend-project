import { getDb } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.resolve(__dirname, '../../database/backups');
const MAX_BACKUPS = 5;

export const backupDatabase = async () => {
  try {
    console.log('[Backup Service] Initializing database backup process...');
    await connectDatabase();
    const db = getDb();

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `wfa-backup-${timestamp}.sqlite`);

    console.log(`[Backup Service] Starting live hot backup to: ${backupFile}`);
    
    // Utilize better-sqlite3 built-in Online Backup API
    await db.backup(backupFile);
    console.log('[Backup Service] Hot backup created successfully.');

    // Verify backup file exists and is readable
    if (!fs.existsSync(backupFile) || fs.statSync(backupFile).size === 0) {
      throw new Error('Backup file verification failed: File is missing or empty.');
    }
    console.log('[Backup Service] Backup verification: PASS');

    // Clean up older backups (Retention policy of last MAX_BACKUPS)
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('wfa-backup-') && file.endsWith('.sqlite'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`[Backup Service] Cleaned up old backup: ${file.name}`);
      }
    }
  } catch (err: any) {
    console.error('[Backup Service] ERROR: Backup failed!', err.message);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('backup-db.ts')) {
  backupDatabase();
}
