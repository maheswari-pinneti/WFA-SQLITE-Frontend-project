import Database from 'better-sqlite3';
import { seedCompanies } from './companies.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedDepartments } from './departments.seed.js';
import { seedTeams } from './teams.seed.js';
import { seedEmployees } from './employees.seed.js';
import { seedAttendance } from './attendance.seed.js';
import { seedAnalytics } from './analytics.seed.js';

const ORGANIZATION_ID = 'org-stackly';

export const runSeed = (db: Database.Database) => {
  console.log('[SQLite Seeder] Starting transaction-based seed...');
  const tx = db.transaction(() => {
    seedCompanies(db, ORGANIZATION_ID);
    seedRoles(db, ORGANIZATION_ID);
    seedPermissions(db, ORGANIZATION_ID);
    seedDepartments(db, ORGANIZATION_ID);
    seedTeams(db, ORGANIZATION_ID);
    seedEmployees(db, ORGANIZATION_ID);
    seedAttendance(db, ORGANIZATION_ID);
    seedAnalytics(db, ORGANIZATION_ID);
  });
  tx();
  console.log('[SQLite Seeder] Seed execution successfully completed.');
};
