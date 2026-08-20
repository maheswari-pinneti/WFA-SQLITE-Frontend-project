import { getDb } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';

const verifyDataset = async () => {
  try {
    console.log("Connecting database for seeding validation...");
    await connectDatabase();
    const db = getDb();

    console.log("\n1. Total Employees Validation");
    const countRow = db.prepare('SELECT COUNT(*) AS total_employees FROM employees').get();
    console.log(`Total employees found: ${countRow.total_employees} (Expected: 500)`);
    if (countRow.total_employees !== 500) {
      throw new Error(`Total employee count mismatch. Found ${countRow.total_employees}`);
    }

    console.log("\n2. Location Distribution Validation");
    const locations = db.prepare('SELECT location, COUNT(*) AS employee_count FROM employees GROUP BY location ORDER BY employee_count DESC').all();
    console.log("Geographic Distribution:");
    locations.forEach(row => {
      console.log(` - ${row.location}: ${row.employee_count}`);
    });

    const expectedLocs = { 'Bengaluru': 250, 'Hyderabad': 150, 'Salem': 100 };
    for (const [loc, expectedCount] of Object.entries(expectedLocs)) {
      const match = locations.find(r => r.location === loc);
      if (!match || match.employee_count !== expectedCount) {
        throw new Error(`Location split mismatch for ${loc}. Expected ${expectedCount}, found ${match ? match.employee_count : 0}`);
      }
    }
    console.log("Location splits are exact and match ratios (Bengaluru: 250, Hyderabad: 150, Salem: 100).");

    console.log("\n3. ID Range & Prefix Validation");
    const idList = db.prepare('SELECT employeeCode FROM employees ORDER BY employeeCode ASC').all().map(r => r.employeeCode);
    if (idList.length !== 500) {
      throw new Error(`Missing IDs. Expected 500 codes, got ${idList.length}`);
    }

    for (let i = 1; i <= 500; i++) {
      const expectedCode = `EMP-${String(i).padStart(3, '0')}`;
      if (idList[i - 1] !== expectedCode) {
        throw new Error(`ID range mismatch. Expected ${expectedCode} at index ${i - 1}, found ${idList[i - 1]}`);
      }
    }
    console.log("Deterministic ID range verified from EMP-001 to EMP-500.");

    console.log("\n4. Duplication Constraints Checks");
    const dupIds = db.prepare('SELECT employeeCode, COUNT(*) AS count FROM employees GROUP BY employeeCode HAVING COUNT(*) > 1').all();
    console.log(`Duplicate employee IDs found: ${dupIds.length} (Expected: 0)`);
    if (dupIds.length > 0) {
      throw new Error(`Found duplicate employeeCode: ${JSON.stringify(dupIds)}`);
    }

    const dupEmails = db.prepare('SELECT email, COUNT(*) AS count FROM employees GROUP BY email HAVING COUNT(*) > 1').all();
    console.log(`Duplicate emails found: ${dupEmails.length} (Expected: 0)`);
    if (dupEmails.length > 0) {
      throw new Error(`Found duplicate emails: ${JSON.stringify(dupEmails)}`);
    }

    console.log("\n5. Missing Required Fields Validation");
    const missingRequired = db.prepare(`
      SELECT COUNT(*) as missing_count FROM employees 
      WHERE id IS NULL OR employeeCode IS NULL OR name IS NULL OR email IS NULL OR role IS NULL OR department IS NULL OR location IS NULL OR status IS NULL OR joinDate IS NULL
    `).get();
    console.log(`Records missing required fields: ${missingRequired.missing_count} (Expected: 0)`);
    if (missingRequired.missing_count !== 0) {
      throw new Error(`Found ${missingRequired.missing_count} records missing required columns.`);
    }

    console.log("\nDATASET SEED VERIFICATION: SUCCESS");
  } catch (err) {
    console.error("\nDATASET SEED VERIFICATION: FAILED");
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  }
};

verifyDataset();
