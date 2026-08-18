import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

import { connectMongoDB } from '../src/config/mongodb.js';
import { User } from '../src/models/User.js';
import { Employee } from '../src/models/Employee.js';
import { LeaveRequest, Notification, Organization, Department, Team, Shift, Skill, PerformanceRecord, Task } from '../src/models/Department.js';

const ORGANIZATION_ID = 'org-stackly';

export const seedMongo = async (forceReset = false) => {
  await connectMongoDB();

  if (forceReset || process.argv.includes('--force') || process.env.NODE_ENV === 'test') {
    if (process.env.NODE_ENV === 'production') {
      console.error("\nERROR:\nReset operation is blocked against production database.\n");
      process.exit(1);
    }
    console.log("Resetting database collections...");
    await Organization.deleteMany({});
    await Department.deleteMany({});
    await Team.deleteMany({});
    await Shift.deleteMany({});
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Skill.deleteMany({});
    await PerformanceRecord.deleteMany({});
    await Task.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Notification.deleteMany({});
  }

  // 1. Seed organizations if empty
  const orgCount = await Organization.countDocuments({});
  if (orgCount === 0) {
    await Organization.create({ id: ORGANIZATION_ID, name: 'Stackly Enterprise HQ', domain: 'thestackly.com', status: 'ACTIVE' });
    console.log("Seeded Organization.");
  }

  // 2. Seed departments if empty
  const deptCount = await Department.countDocuments({});
  if (deptCount === 0) {
    await Department.insertMany([
      { id: 'dept-eng', name: 'Engineering', code: 'ENG', managerId: 'usr-mgr-01', organizationId: ORGANIZATION_ID },
      { id: 'dept-prod', name: 'Product Management', code: 'PROD', managerId: null, organizationId: ORGANIZATION_ID },
      { id: 'dept-sales', name: 'Sales & Marketing', code: 'SALES', managerId: null, organizationId: ORGANIZATION_ID },
      { id: 'dept-hr', name: 'Human Resources', code: 'HR', managerId: 'usr-hr-01', organizationId: ORGANIZATION_ID },
      { id: 'dept-cs', name: 'Customer Success', code: 'CS', managerId: null, organizationId: ORGANIZATION_ID },
      { id: 'dept-fin', name: 'Finance & Operations', code: 'FIN', managerId: null, organizationId: ORGANIZATION_ID }
    ]);
    console.log("Seeded Departments.");
  }

  // 3. Seed teams if empty
  const teamCount = await Team.countDocuments({});
  if (teamCount === 0) {
    await Team.insertMany([
      { id: 'team-frontend', name: 'Frontend Team', departmentId: 'dept-eng', leadId: 'usr-lead-01', organizationId: ORGANIZATION_ID },
      { id: 'team-platform', name: 'Core Platform', departmentId: 'dept-eng', leadId: null, organizationId: ORGANIZATION_ID },
      { id: 'team-recruit', name: 'Talent Acquisition', departmentId: 'dept-hr', leadId: null, organizationId: ORGANIZATION_ID }
    ]);
    console.log("Seeded Teams.");
  }

  // 4. Seed shifts if empty
  const shiftCount = await Shift.countDocuments({});
  if (shiftCount === 0) {
    await Shift.insertMany([
      { id: 'shift-regular', name: 'Regular', startTime: '09:00', endTime: '18:00', gracePeriodMinutes: 15, organizationId: ORGANIZATION_ID },
      { id: 'shift-flexible', name: 'Flexible', startTime: '00:00', endTime: '23:59', gracePeriodMinutes: 0, organizationId: ORGANIZATION_ID },
      { id: 'shift-overnight', name: 'Overnight', startTime: '21:00', endTime: '06:00', gracePeriodMinutes: 15, organizationId: ORGANIZATION_ID }
    ]);
    console.log("Seeded Shifts.");
  }

  // 5. Seed Users & Employees if empty
  const userCount = await User.countDocuments({});
  if (userCount > 0) {
    const empTotalCount = await Employee.countDocuments({});
    const hyd = await Employee.countDocuments({ location: 'Hyderabad' });
    const vsp = await Employee.countDocuments({ location: 'Visakhapatnam' });
    const chn = await Employee.countDocuments({ location: 'Chennai' });
    const blr = await Employee.countDocuments({ location: 'Bengaluru' });
    const koc = await Employee.countDocuments({ location: 'Kochi' });

    console.log(`\nExisting employees detected: ${empTotalCount}`);
    console.log(`Hyderabad:      ${hyd}`);
    console.log(`Visakhapatnam:  ${vsp}`);
    console.log(`Chennai:        ${chn}`);
    console.log(`Bengaluru:      ${blr}`);
    console.log(`Kochi:          ${koc}`);
    console.log("Employee creation skipped.");
    console.log("Existing employee records preserved.\n");
  }

  if (userCount === 0) {
    const passHash = '$2b$10$RurO1wlDA8rF7QLnqIKkM.PJmHnGiRcduYPxbrULJpiX/JB7UixMG'; // StacklyWFA2026!

    // Seed core personnel in users collection only
    await User.insertMany([
      { id: 'usr-admin-01', name: 'Sarah Connor', email: 'admin@thestackly.com', password_hash: passHash, role: 'ADMIN', clearanceLevel: 5, status: 'ACTIVE', permissions: ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_MANAGE', 'PERMISSION_ASSIGN', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'REPORT_VIEW_ALL', 'REPORT_EXPORT', 'SYSTEM_SETTINGS_MANAGE', 'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW', 'VIEW_ALL_DATA'], mfa_enabled: 1, organizationId: ORGANIZATION_ID },
      { id: 'usr-hr-01', name: 'Elena Rostova', email: 'hr@thestackly.com', password_hash: passHash, role: 'HR', clearanceLevel: 4, status: 'ACTIVE', permissions: ['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_PROFILE_MANAGE', 'ATTENDANCE_VIEW_ALL', 'ATTENDANCE_MANAGE', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE', 'RECRUITMENT_MANAGE', 'REPORT_GENERATE', 'EMPLOYEE_MANAGE', 'REPORT_VIEW', 'TEAM_ANALYTICS_VIEW'], mfa_enabled: 1, organizationId: ORGANIZATION_ID },
      { id: 'usr-mgr-01', name: 'David Sterling', email: 'manager@thestackly.com', password_hash: passHash, role: 'MANAGER', department: 'Engineering', clearanceLevel: 3, status: 'ACTIVE', permissions: ['TEAM_VIEW', 'TEAM_ANALYTICS_VIEW', 'EMPLOYEE_VIEW_TEAM', 'ATTENDANCE_VIEW_TEAM', 'LEAVE_APPROVE', 'PERFORMANCE_REVIEW', 'TASK_ASSIGN', 'REPORT_VIEW_TEAM'], mfa_enabled: 1, organizationId: ORGANIZATION_ID },
      { id: 'usr-lead-01', name: 'Marcus Vance', email: 'lead@thestackly.com', password_hash: passHash, role: 'TEAM_LEAD', department: 'Engineering', team: 'Frontend Team', clearanceLevel: 2, status: 'ACTIVE', permissions: ['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK'], mfa_enabled: 1, organizationId: ORGANIZATION_ID }
    ]);

    // Bulk Seed 250 Employees (and their user logins)
    const departments = ['Engineering', 'Product Management', 'Sales & Marketing', 'Human Resources', 'Customer Success', 'Finance & Operations'];
    const teamsList = ['Frontend Team', 'Product Strategy', 'Growth Team', 'People Operations', 'Customer Success', 'Finance Operations'];
    const designations = ['Senior Software Engineer', 'Product Manager', 'Account Executive', 'HR Operations Manager', 'Customer Success Director', 'Financial Analyst'];
    const statuses = ['ACTIVE', 'REMOTE', 'ON_LEAVE', 'ACTIVE'];

    const locations = [];
    for (let i = 0; i < 70; i++) locations.push('Hyderabad');
    for (let i = 0; i < 40; i++) locations.push('Visakhapatnam');
    for (let i = 0; i < 50; i++) locations.push('Chennai');
    for (let i = 0; i < 60; i++) locations.push('Bengaluru');
    for (let i = 0; i < 30; i++) locations.push('Kochi');

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

    const bulkUsers = [];
    const bulkEmployees = [];

    for (let i = 1; i <= 250; i++) {
      const id = i === 250 ? 'usr-emp-01' : `emp-${i}`;
      const paddedNum = String(i).padStart(4, '0');
      const joiningYear = 2020 + (i % 7);
      const code = `STK-${joiningYear}-${paddedNum}`;
      
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
      const location = locations[i - 1];

      bulkEmployees.push({
        id, employeeCode: code, name, email, role, department: dept, designation: design, status,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        joinDate: `${joiningYear}-${String((i % 12) + 1).padStart(2, '0')}-15`,
        performanceScore: 80 + (i % 20),
        attendanceRate: 90 + (i % 10),
        team, location, organizationId: ORGANIZATION_ID
      });

      const perms = ['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD'];
      bulkUsers.push({
        id, name, email, password_hash: passHash, role, department: dept, team, location, title: design,
        clearanceLevel: 1, status: 'ACTIVE', permissions: perms, mfa_enabled: 1, organizationId: ORGANIZATION_ID
      });
    }

    await User.insertMany(bulkUsers);
    await Employee.insertMany(bulkEmployees);
    console.log("Seeded 250 Users & Employees.");
  }

  // 6. Seed skills if empty
  const skillCount = await Skill.countDocuments({});
  if (skillCount === 0) {
    const employeeRows = await Employee.find({});
    const skills = ['React', 'TypeScript', 'Node.js', 'SQL', 'Cloud Architecture', 'Kubernetes', 'Data Analysis', 'Leadership'];
    const rows = [];
    employeeRows.forEach((employee, index) => {
      skills.slice(0, 5).forEach((skill, skillIndex) => {
        const level = 2 + ((index + skillIndex) % 4);
        rows.push({
          id: `skill-${index}-${skillIndex}`,
          employeeId: employee.id,
          skillName: skill,
          level,
          isTopSkill: level >= 4 ? 1 : 0,
          isMissingSkill: level <= 2 ? 1 : 0,
          department: employee.department,
          team: employee.team,
          organizationId: ORGANIZATION_ID
        });
      });
    });
    await Skill.insertMany(rows);
    console.log("Seeded employee skills.");
  }

  // 7. Seed performance records if empty
  const performanceCount = await PerformanceRecord.countDocuments({});
  if (performanceCount === 0) {
    const employeeRows = await Employee.find({});
    const quarters = ['2026-Q1', '2026-Q2', '2026-Q3'];
    const rows = [];
    employeeRows.forEach((employee, index) => {
      quarters.forEach((q) => {
        const kpi = 70 + ((index + q.charCodeAt(6)) % 26);
        const target = 85;
        const productivity = 75 + ((index + q.charCodeAt(6) + 3) % 21);
        rows.push({
          id: `perf-${index}-${q}`,
          employeeId: employee.id,
          quarter: q,
          kpiScore: kpi,
          targetScore: target,
          productivityScore: productivity,
          department: employee.department,
          team: employee.team,
          organizationId: ORGANIZATION_ID
        });
      });
    });
    await PerformanceRecord.insertMany(rows);
    console.log("Seeded employee performance records.");
  }

  // 8. Seed tasks if empty
  const taskCount = await Task.countDocuments({});
  if (taskCount === 0) {
    const employeeRows = await Employee.find({});
    const tasks = [];
    employeeRows.slice(0, 40).forEach((employee, index) => {
      tasks.push({
        id: `task-seed-${index}`,
        title: `Deliver Sprint Feature Module ${index + 1}`,
        assigneeId: employee.id,
        assigneeName: employee.name,
        department: employee.department,
        team: employee.team,
        organizationId: ORGANIZATION_ID,
        priority: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
        status: index % 4 === 0 ? 'DONE' : index % 4 === 1 ? 'IN_PROGRESS' : 'TODO',
        points: 3 + (index % 6),
        updatedAt: new Date().toISOString()
      });
    });
    await Task.insertMany(tasks);
    console.log("Seeded Sprint Tasks.");
  }
};

const runSeeder = async () => {
  try {
    await seedMongo();
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Seeder connection closed.");
  }
};

if (process.argv[1] && (process.argv[1].endsWith('seed-mongodb.js') || process.argv[1].endsWith('seedMongo.js'))) {
  runSeeder();
}
export default seedMongo;
