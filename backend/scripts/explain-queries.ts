import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../database/sqlite/wfa.sqlite');

const db = new BetterSqlite3(DB_PATH);

console.log('Running Query Plan Explanations...');

const queriesToExplain = [
  {
    name: 'Get employee details with skills query',
    sql: 'SELECT * FROM employees e JOIN skills s ON s.employeeId = e.id WHERE e.id = ?'
  },
  {
    name: 'Filter attendance records by date range',
    sql: 'SELECT * FROM attendancerecords WHERE employeeId = ? AND createdAt >= ? AND createdAt <= ?'
  },
  {
    name: 'Get leave requests for validation',
    sql: 'SELECT * FROM leaverequests WHERE employeeId = ? AND status = ?'
  },
  {
    name: 'Get audit logs range scan',
    sql: 'SELECT * FROM audit_logs WHERE createdAt >= ? ORDER BY createdAt DESC'
  }
];

let failedQueries = 0;

for (const q of queriesToExplain) {
  console.log(`\n[Explain Query Plan]: ${q.name}`);
  try {
    const stmt = db.prepare(`EXPLAIN QUERY PLAN ${q.sql}`);
    // Bind dummy parameters depending on how many "?" markers exist
    const paramCount = q.sql.split('?').length - 1;
    const dummyParams = Array(paramCount).fill('1');
    const plans = stmt.all(...dummyParams) as any[];
    for (const plan of plans) {
      console.log(` - Detail: ${plan.detail}`);
    }
  } catch (err: any) {
    console.error(`Error explaining ${q.name}:`, err.message);
    failedQueries++;
  }
}

db.close();

if (failedQueries > 0) {
  process.exit(1);
} else {
  console.log('\nQUERY PLAN VERIFICATION: SUCCESS');
  process.exit(0);
}
