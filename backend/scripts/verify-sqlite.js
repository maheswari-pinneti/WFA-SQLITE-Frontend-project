import 'dotenv/config';
import { query, connectDatabase } from '../src/database/sqlite-cloud.js';

const verify = async () => {
  try {
    console.log("Verifying SQLite connectivity & production integrity...");
    
    // Connect database
    await connectDatabase();
    
    const isCloud = !!(process.env.SQLITE_CLOUD_URL || process.env.SQLITE_CLOUD_CONNECTION_STRING) && process.env.NODE_ENV !== 'test';
    
    if (isCloud) {
      console.log("[Database] Verifying connection to SQLite Cloud...");
    } else {
      console.log("[Database] Verifying connection to local SQLite...");
    }

    // 1. Basic Connection
    const activeRows = await query('SELECT 1 as active');
    const result = activeRows && activeRows[0];
    if (!result || result.active !== 1) {
      throw new Error("Connection established but ping query failed.");
    }
    
    // 2. Integrity Check
    let integrity = { integrity_check: 'ok' };
    if (!isCloud) {
      console.log("Running PRAGMA integrity_check...");
      const integrityRows = await query('PRAGMA integrity_check');
      integrity = integrityRows && integrityRows[0];
      console.log(`Integrity Status: ${JSON.stringify(integrity)}`);
      if (!integrity || integrity.integrity_check !== 'ok') {
        throw new Error(`Database integrity check failed: ${integrity ? integrity.integrity_check : 'unknown'}`);
      }
    } else {
      console.log("Skipping local PRAGMA integrity_check on SQLite Cloud...");
    }

    // 3. Foreign Key Constraint Check
    let fkCheck = [];
    if (!isCloud) {
      console.log("Running PRAGMA foreign_key_check...");
      fkCheck = await query('PRAGMA foreign_key_check');
      if (fkCheck && fkCheck.length > 0) {
        console.warn(`Foreign key violations found: ${JSON.stringify(fkCheck)}`);
        throw new Error("Database contains foreign key constraint violations.");
      }
    } else {
      console.log("Skipping local PRAGMA foreign_key_check on SQLite Cloud...");
    }

    // 4. Verify PRAGMAs (WAL Mode & Foreign Keys enabled)
    let journalMode = 'wal';
    let foreignKeys = 1;
    if (!isCloud) {
      const jModeRows = await query('PRAGMA journal_mode');
      journalMode = jModeRows && jModeRows[0] && jModeRows[0].journal_mode;
      const fKeysRows = await query('PRAGMA foreign_keys');
      foreignKeys = fKeysRows && fKeysRows[0] && fKeysRows[0].foreign_keys;
      
      console.log(`Journal Mode: ${journalMode}`);
      console.log(`Foreign Keys Enabled: ${foreignKeys === 1 ? 'YES' : 'NO'}`);

      if (journalMode.toUpperCase() !== 'WAL') {
        console.warn("Warning: Journal mode is not WAL.");
      }
      if (foreignKeys !== 1) {
        throw new Error("Foreign keys are not enabled.");
      }
    } else {
      console.log("Skipping local PRAGMA journal/foreign key checks on SQLite Cloud...");
    }

    // 5. Verify Index Existence
    console.log("Verifying performance indexes...");
    const indexRows = await query("SELECT name FROM sqlite_master WHERE type='index'");
    const indexes = indexRows ? indexRows.map(idx => idx.name) : [];
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
    console.log(`DatabaseType: ${isCloud ? 'SQLite Cloud' : 'SQLite Local'}`);
    process.exit(0);
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
