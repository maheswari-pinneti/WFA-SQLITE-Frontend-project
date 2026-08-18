import { runRollback } from './rollback.js';
import { runMigrations } from './migrate.js';
import { seedDatabase } from './seed.js';

export const runReset = () => {
  console.log('[Reset] Resetting database...');
  runRollback();
  runMigrations();
  seedDatabase();
  console.log('[Reset] Database reset successfully.');
};

if (process.argv[1] && process.argv[1].endsWith('reset.ts')) {
  try {
    runReset();
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}
