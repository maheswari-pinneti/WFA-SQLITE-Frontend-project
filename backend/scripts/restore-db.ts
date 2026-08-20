import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.resolve(__dirname, '../../database/backups');
const DB_DIR = path.resolve(__dirname, '../../database/sqlite');
const TARGET_DB_PATH = path.join(DB_DIR, 'wfa.sqlite');

export const restoreDatabase = async () => {
  try {
    console.log('[Restore Service] Initializing database restore process...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error('Backup directory does not exist. No backups found.');
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('wfa-backup-') && file.endsWith('.sqlite'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      throw new Error('No valid backup files found in backup directory.');
    }

    const latestBackup = files[0];
    console.log(`[Restore Service] Latest backup found: ${latestBackup.name}`);

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Safely copy backup to active database location
    console.log(`[Restore Service] Restoring database to: ${TARGET_DB_PATH}`);
    fs.copyFileSync(latestBackup.path, TARGET_DB_PATH);
    console.log('[Restore Service] Database restored successfully from backup.');
  } catch (err: any) {
    console.error('[Restore Service] ERROR: Restore failed!', err.message);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('restore-db.ts')) {
  restoreDatabase();
}
