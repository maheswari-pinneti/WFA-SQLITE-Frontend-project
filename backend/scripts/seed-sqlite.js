import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedSqlite = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Seeder] Ensuring tables exist...');
  
  // Read and run schema.sql
  const schemaPath = path.resolve(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  } else {
    console.warn(`[SQLite Seeder] Warning: schema.sql not found at ${schemaPath}`);
  }

  console.log('[SQLite Seeder] Truncating tables for a fresh seed...');
  db.exec(`
    DELETE FROM companies;
    DELETE FROM departments;
    DELETE FROM teams;
    DELETE FROM shifts;
    DELETE FROM users;
    DELETE FROM employees;
    DELETE FROM skills;
    DELETE FROM performancerecords;
    DELETE FROM tasks;
  `);

  console.log('[SQLite Seeder] Starting database seeding...');

  // Start Transaction
  const transaction = db.transaction(() => {
    // 1. Seed organization
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
    if (orgCount === 0) {
      db.prepare(`
        INSERT INTO companies (id, name, domain, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(ORGANIZATION_ID, 'Stackly Enterprise HQ', 'thestackly.com', 'ACTIVE', new Date().toISOString(), new Date().toISOString());
      console.log('Seeded Organization.');
    }

    // 2. Seed departments
    const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
    if (deptCount === 0) {
      const insertDept = db.prepare(`
        INSERT INTO departments (id, name, code, managerId, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const depts = [
        ['dept-eng', 'Engineering', 'ENG', 'usr-mgr-01', ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['dept-prod', 'Product Management', 'PROD', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['dept-sales', 'Sales & Marketing', 'SALES', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['dept-hr', 'Human Resources', 'HR', 'usr-hr-01', ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['dept-cs', 'Customer Success', 'CS', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['dept-fin', 'Finance & Operations', 'FIN', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()]
      ];
      for (const dept of depts) {
        insertDept.run(...dept);
      }
      console.log('Seeded Departments.');
    }

    // 3. Seed teams
    const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    if (teamCount === 0) {
      const insertTeam = db.prepare(`
        INSERT INTO teams (id, name, departmentId, leadId, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const teams = [
        ['team-frontend', 'Frontend Team', 'dept-eng', 'usr-lead-01', ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['team-platform', 'Core Platform', 'dept-eng', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['team-recruit', 'Talent Acquisition', 'dept-hr', null, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()]
      ];
      for (const team of teams) {
        insertTeam.run(...team);
      }
      console.log('Seeded Teams.');
    }

    // 4. Seed shifts
    const shiftCount = db.prepare('SELECT COUNT(*) as count FROM shifts').get().count;
    if (shiftCount === 0) {
      const insertShift = db.prepare(`
        INSERT INTO shifts (id, name, startTime, endTime, gracePeriodMinutes, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const shifts = [
        ['shift-regular', 'Regular', '09:00', '18:00', 15, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['shift-flexible', 'Flexible', '00:00', '23:59', 0, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['shift-overnight', 'Overnight', '21:00', '06:00', 15, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()]
      ];
      for (const shift of shifts) {
        insertShift.run(...shift);
      }
      console.log('Seeded Shifts.');
    }

    // 5. Seed Users & Employees
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      const passHash = '$2b$10$RurO1wlDA8rF7QLnqIKkM.PJmHnGiRcduYPxbrULJpiX/JB7UixMG'; // StacklyWFA2026!

      const insertUser = db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const coreUsers = [
        ['usr-admin-01', 'Sarah Connor', 'admin@thestackly.com', passHash, 'ADMIN', null, null, null, null, 5, 'ACTIVE', JSON.stringify(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_MANAGE', 'PERMISSION_ASSIGN', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'REPORT_VIEW_ALL', 'REPORT_EXPORT', 'SYSTEM_SETTINGS_MANAGE', 'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW', 'VIEW_ALL_DATA']), 1, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['usr-hr-01', 'Elena Rostova', 'hr@thestackly.com', passHash, 'HR', null, null, null, null, 4, 'ACTIVE', JSON.stringify(['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_PROFILE_MANAGE', 'ATTENDANCE_VIEW_ALL', 'ATTENDANCE_MANAGE', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE', 'RECRUITMENT_MANAGE', 'REPORT_GENERATE', 'EMPLOYEE_MANAGE', 'REPORT_VIEW', 'TEAM_ANALYTICS_VIEW']), 1, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['usr-mgr-01', 'David Sterling', 'manager@thestackly.com', passHash, 'MANAGER', 'Engineering', null, null, null, 3, 'ACTIVE', JSON.stringify(['TEAM_VIEW', 'TEAM_ANALYTICS_VIEW', 'EMPLOYEE_VIEW_TEAM', 'ATTENDANCE_VIEW_TEAM', 'LEAVE_APPROVE', 'PERFORMANCE_REVIEW', 'TASK_ASSIGN', 'REPORT_VIEW_TEAM']), 1, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()],
        ['usr-lead-01', 'Marcus Vance', 'lead@thestackly.com', passHash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, ORGANIZATION_ID, ORGANIZATION_ID, new Date().toISOString(), new Date().toISOString()]
      ];

      for (const u of coreUsers) {
        insertUser.run(...u);
      }

      // Generate 500 Employees (and their user logins)
      const departments = ['Engineering', 'Product Management', 'Sales & Marketing', 'Human Resources', 'Customer Success', 'Finance & Operations'];
      const teamsList = ['Frontend Team', 'Product Strategy', 'Growth Team', 'People Operations', 'Customer Success', 'Finance Operations'];
      const designations = ['Senior Software Engineer', 'Product Manager', 'Account Executive', 'HR Operations Manager', 'Customer Success Director', 'Financial Analyst'];
      const statuses = ['ACTIVE', 'REMOTE', 'ON_LEAVE', 'ACTIVE'];

      const locationsList = [];
      for (let i = 0; i < 250; i++) locationsList.push('Bengaluru');
      for (let i = 0; i < 100; i++) locationsList.push('Salem');
      for (let i = 0; i < 150; i++) locationsList.push('Hyderabad');

      const firstNames = [
        'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Siddharth', 'Ishaan', 'Aanya', 'Aditi',
        'Kabir', 'Rohan', 'Arjun', 'Rahul', 'Pranav', 'Aditya', 'Sai', 'Krishna', 'Karan', 'Sanjay',
        'Vikram', 'Ramesh', 'Suresh', 'Anil', 'Sunil', 'Vijay', 'Rajesh', 'Harish', 'Manish', 'Amit',
        'Pooja', 'Neha', 'Priya', 'Sneha', 'Anjali', 'Riya', 'Divya', 'Deepika', 'Kiran', 'Jyoti',
        'Akash', 'Abhishek', 'Aman', 'Aniket', 'Ayush', 'Gaurav', 'Nitin', 'Pankaj', 'Sachin', 'Sandeep',
        'Shalini', 'Swati', 'Meera', 'Shruti', 'Preeti', 'Kavita', 'Geeta', 'Lata', 'Sunita', 'Anita'
      ];
      const lastNames = [
        'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Joshi',
        'Iyer', 'Iyengar', 'Gupta', 'Sen', 'Dutta', 'Das', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Bose',
        'Mehta', 'Shah', 'Trivedi', 'Pandey', 'Mishra', 'Choudhury', 'Prasad', 'Sinha', 'Kapoor', 'Khanna',
        'Malhotra', 'Bahl', 'Gill', 'Sandhu', 'Nayar', 'Menon', 'Shetty', 'Gowda', 'Naidu'
      ];

      const insertEmp = db.prepare(`
        INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, avatar, joinDate, performanceScore, attendanceRate, team, location, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 1; i <= 500; i++) {
        const id = i === 250 ? 'usr-emp-01' : `emp-${i}`;
        const paddedNum = String(i).padStart(3, '0');
        const joiningYear = 2020 + (i % 7);
        const code = `EMP-${paddedNum}`;

        const firstName = firstNames[(i - 1) % firstNames.length];
        const lastName = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length];

        const name = i === 250 ? 'Alex Mercer' : `${firstName} ${lastName}`;
        const email = i === 250 ? 'employee@thestackly.com' : `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${paddedNum}@thestackly.com`;
        const role = 'EMPLOYEE';
        const deptIdx = i % departments.length;
        const dept = i === 250 ? 'Engineering' : departments[deptIdx];
        const design = i === 250 ? 'Full Stack Developer' : designations[deptIdx];
        const status = statuses[i % statuses.length];
        const team = i === 250 ? 'Frontend Team' : teamsList[deptIdx];
        const location = locationsList[i - 1];

        // Insert employee
        insertEmp.run(
          id, code, name, email, role, dept, design, status,
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          `${joiningYear}-${String((i % 12) + 1).padStart(2, '0')}-15`,
          80 + (i % 20), 90 + (i % 10), team, location, ORGANIZATION_ID, ORGANIZATION_ID,
          new Date().toISOString(), new Date().toISOString()
        );

        // Insert user login
        const perms = ['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD'];
        insertUser.run(
          id, name, email, passHash, role, dept, team, location, design,
          1, 'ACTIVE', JSON.stringify(perms), 1, ORGANIZATION_ID, ORGANIZATION_ID,
          new Date().toISOString(), new Date().toISOString()
        );
      }
      console.log('Seeded 500 Users & Employees.');
    }

    // 6. Seed skills
    const skillCount = db.prepare('SELECT COUNT(*) as count FROM skills').get().count;
    if (skillCount === 0) {
      const employees = db.prepare('SELECT * FROM employees').all();
      const skills = ['React', 'TypeScript', 'Node.js', 'SQL', 'Cloud Architecture', 'Kubernetes', 'Data Analysis', 'Leadership'];
      const insertSkill = db.prepare(`
        INSERT INTO skills (id, employeeId, skillName, level, isTopSkill, isMissingSkill, department, team, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      employees.forEach((employee, index) => {
        skills.slice(0, 5).forEach((skill, skillIndex) => {
          const level = 2 + ((index + skillIndex) % 4);
          insertSkill.run(
            `skill-${index}-${skillIndex}`,
            employee.id,
            skill,
            level,
            level >= 4 ? 1 : 0,
            level <= 2 ? 1 : 0,
            employee.department,
            employee.team,
            ORGANIZATION_ID,
            ORGANIZATION_ID,
            new Date().toISOString(),
            new Date().toISOString()
          );
        });
      });
      console.log('Seeded employee skills.');
    }

    // 7. Seed performance records
    const performanceCount = db.prepare('SELECT COUNT(*) as count FROM performancerecords').get().count;
    if (performanceCount === 0) {
      const employees = db.prepare('SELECT * FROM employees').all();
      const quarters = ['2026-Q1', '2026-Q2', '2026-Q3'];
      const insertPerf = db.prepare(`
        INSERT INTO performancerecords (id, employeeId, quarter, kpiScore, targetScore, productivityScore, department, team, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      employees.forEach((employee, index) => {
        quarters.forEach((q) => {
          const kpi = 70 + ((index + q.charCodeAt(6)) % 26);
          const target = 85;
          const productivity = 75 + ((index + q.charCodeAt(6) + 3) % 21);
          insertPerf.run(
            `perf-${index}-${q}`,
            employee.id,
            q,
            kpi,
            target,
            productivity,
            employee.department,
            employee.team,
            ORGANIZATION_ID,
            ORGANIZATION_ID,
            new Date().toISOString(),
            new Date().toISOString()
          );
        });
      });
      console.log('Seeded employee performance records.');
    }

    // 8. Seed tasks
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (taskCount === 0) {
      const employees = db.prepare('SELECT * FROM employees').all();
      const insertTask = db.prepare(`
        INSERT INTO tasks (id, title, assigneeId, assigneeName, department, team, organizationId, priority, status, points, updatedAt, companyId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      employees.slice(0, 40).forEach((employee, index) => {
        insertTask.run(
          `task-seed-${index}`,
          `Deliver Sprint Feature Module ${index + 1}`,
          employee.id,
          employee.name,
          employee.department,
          employee.team,
          ORGANIZATION_ID,
          index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
          index % 4 === 0 ? 'DONE' : index % 4 === 1 ? 'IN_PROGRESS' : 'TODO',
          3 + (index % 6),
          new Date().toISOString(),
          ORGANIZATION_ID,
          new Date().toISOString()
        );
      });
      console.log('Seeded Sprint Tasks.');
    }
  });

  transaction();
  console.log('[SQLite Seeder] Database seeded successfully.');
};

// Check if run directly
if (process.argv[1] && process.argv[1].endsWith('seed-sqlite.js')) {
  try {
    await seedSqlite();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}
