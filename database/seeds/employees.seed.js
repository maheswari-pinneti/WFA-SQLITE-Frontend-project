export const seedEmployees = (db, orgId) => {
    // Seed shifts
    const shiftCount = db.prepare('SELECT COUNT(*) as count FROM shifts').get().count;
    if (shiftCount === 0) {
        const insertShift = db.prepare(`
      INSERT INTO shifts (id, name, startTime, endTime, gracePeriodMinutes, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const shifts = [
            ['shift-regular', 'Regular', '09:00', '18:00', 15, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['shift-flexible', 'Flexible', '00:00', '23:59', 0, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['shift-overnight', 'Overnight', '21:00', '06:00', 15, orgId, orgId, new Date().toISOString(), new Date().toISOString()]
        ];
        for (const shift of shifts) {
            insertShift.run(...shift);
        }
        console.log('Seeded Shifts.');
    }
    // Seed locations
    const locationCount = db.prepare('SELECT COUNT(*) as count FROM locations').get().count;
    if (locationCount === 0) {
        const insertLoc = db.prepare(`
      INSERT INTO locations (id, name, address, city, country, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const locations = [
            ['loc-hyd', 'Hyderabad Campus', 'HITEC City', 'Hyderabad', 'India', orgId, orgId, new Date().toISOString(), new Date().toISOString()]
        ];
        for (const loc of locations) {
            insertLoc.run(...loc);
        }
        console.log('Seeded Locations.');
    }
    // Seed employees & users
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const passHash = '$2b$10$RurO1wlDA8rF7QLnqIKkM.PJmHnGiRcduYPxbrULJpiX/JB7UixMG'; // StacklyWFA2026!
        const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const coreUsers = [
            ['usr-admin-01', 'Sarah Connor', 'admin@thestackly.com', passHash, 'ADMIN', null, null, null, null, 5, 'ACTIVE', JSON.stringify(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_MANAGE', 'PERMISSION_ASSIGN', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'REPORT_VIEW_ALL', 'REPORT_EXPORT', 'SYSTEM_SETTINGS_MANAGE', 'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW', 'VIEW_ALL_DATA']), 1, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['usr-hr-01', 'Elena Rostova', 'hr@thestackly.com', passHash, 'HR', null, null, null, null, 4, 'ACTIVE', JSON.stringify(['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_PROFILE_MANAGE', 'ATTENDANCE_VIEW_ALL', 'ATTENDANCE_MANAGE', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE', 'RECRUITMENT_MANAGE', 'REPORT_GENERATE', 'EMPLOYEE_MANAGE', 'REPORT_VIEW', 'TEAM_ANALYTICS_VIEW']), 1, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['usr-mgr-01', 'David Sterling', 'manager@thestackly.com', passHash, 'MANAGER', 'Engineering', null, null, null, 3, 'ACTIVE', JSON.stringify(['TEAM_VIEW', 'TEAM_ANALYTICS_VIEW', 'EMPLOYEE_VIEW_TEAM', 'ATTENDANCE_VIEW_TEAM', 'LEAVE_APPROVE', 'PERFORMANCE_REVIEW', 'TASK_ASSIGN', 'REPORT_VIEW_TEAM']), 1, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['usr-lead-01', 'Marcus Vance', 'lead@thestackly.com', passHash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, orgId, orgId, new Date().toISOString(), new Date().toISOString()]
        ];
        for (const u of coreUsers) {
            insertUser.run(...u);
        }
        const departments = ['Engineering', 'Product Management', 'Sales & Marketing', 'Human Resources', 'Customer Success', 'Finance & Operations'];
        const teamsList = ['Frontend Team', 'Product Strategy', 'Growth Team', 'People Operations', 'Customer Success', 'Finance Operations'];
        const designations = ['Senior Software Engineer', 'Product Manager', 'Account Executive', 'HR Operations Manager', 'Customer Success Director', 'Financial Analyst'];
        const statuses = ['ACTIVE', 'REMOTE', 'ON_LEAVE', 'ACTIVE'];
        const locationsList = [];
        for (let i = 0; i < 250; i++)
            locationsList.push('Bengaluru');
        for (let i = 0; i < 100; i++)
            locationsList.push('Salem');
        for (let i = 0; i < 150; i++)
            locationsList.push('Hyderabad');
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
            const code = `EMP-${paddedNum}`;
            const joiningYear = 2020 + (i % 7);
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
            let location = 'Bengaluru';
            if (i > 250 && i <= 400) {
                location = 'Hyderabad';
            } else if (i > 400) {
                location = 'Salem';
            }
            insertEmp.run(id, code, name, email, role, dept, design, status, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', `${joiningYear}-${String((i % 12) + 1).padStart(2, '0')}-15`, 80 + (i % 20), 90 + (i % 10), team, location, orgId, orgId, new Date().toISOString(), new Date().toISOString());
            const perms = ['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD'];
            insertUser.run(id, name, email, passHash, role, dept, team, location, design, 1, 'ACTIVE', JSON.stringify(perms), 1, orgId, orgId, new Date().toISOString(), new Date().toISOString());
        }
        console.log('Seeded 500 Employees.');
    }
};
