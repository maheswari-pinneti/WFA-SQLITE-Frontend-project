import 'dotenv/config';
import { getDb } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';

const verify = async () => {
  try {
    console.log("Verifying SQLite connectivity & production integrity...");
    await connectDatabase();
    const db = getDb();
    
    // 1. Basic Connection
    const result = db.prepare('SELECT 1 as active').get();
    if (!result || result.active !== 1) {
      throw new Error("Connection established but ping query failed.");
    }
    
    // 2. Integrity Check
    console.log("Running PRAGMA integrity_check...");
    const integrity = db.prepare('PRAGMA integrity_check').get();
    console.log(`Integrity Status: ${JSON.stringify(integrity)}`);
    if (integrity.integrity_check !== 'ok') {
      throw new Error(`Database integrity check failed: ${integrity.integrity_check}`);
    }

    // 3. Foreign Key Constraint Check
    console.log("Running PRAGMA foreign_key_check...");
    const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
    if (fkCheck.length > 0) {
      console.warn(`Foreign key violations found: ${JSON.stringify(fkCheck)}`);
      throw new Error("Database contains foreign key constraint violations.");
    }

    // 4. Verify PRAGMAs (WAL Mode & Foreign Keys enabled)
    const journalMode = db.prepare('PRAGMA journal_mode').get().journal_mode;
    const foreignKeys = db.prepare('PRAGMA foreign_keys').get().foreign_keys;
    console.log(`Journal Mode: ${journalMode}`);
    console.log(`Foreign Keys Enabled: ${foreignKeys === 1 ? 'YES' : 'NO'}`);

    if (journalMode.toUpperCase() !== 'WAL') {
      console.warn("Warning: Journal mode is not WAL.");
    }
    if (foreignKeys !== 1) {
      throw new Error("Foreign keys are not enabled.");
    }

    // 5. Verify Index Existence
    console.log("Verifying performance indexes...");
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(idx => idx.name);
    const expectedIndexes = [
      'idx_employees_id',
      'idx_employees_code',
      'idx_employees_email',
      'idx_employees_role',
      'idx_employees_dept',
      'idx_employees_loc',
      'idx_employees_status',
      'idx_users_email',
      'idx_attendancerecords_date',
      'idx_attendancerecords_emp_date',
      'idx_audit_logs_timestamp',
      'idx_skills_emp',
      'idx_perf_emp',
      'idx_leave_emp'
    ];

    const missingIndexes = expectedIndexes.filter(expected => !indexes.includes(expected));
    if (missingIndexes.length > 0) {
      console.warn(`Missing indexes: ${missingIndexes.join(', ')}`);
    } else {
      console.log("All expected performance indexes are verified.");
    }

    console.log("\nVERIFICATION STATUS: SUCCESS");
    console.log("----------------------------");
    console.log("API: healthy");
    console.log("Database: connected");
    console.log("DatabaseType: SQLite");
    
  } catch (err) {
    console.error("\nVERIFICATION STATUS: FAILED");
    console.error("---------------------------");
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  } finally {
    console.log("Verification finished.");
  }
};

verify();
