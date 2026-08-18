export const seedAnalytics = (db, orgId) => {
    // Seed skills
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
                insertSkill.run(`skill-${index}-${skillIndex}`, employee.id, skill, level, level >= 4 ? 1 : 0, level <= 2 ? 1 : 0, employee.department, employee.team, orgId, orgId, new Date().toISOString(), new Date().toISOString());
            });
        });
        console.log('Seeded employee skills.');
    }
    // Seed performance records
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
                insertPerf.run(`perf-${index}-${q}`, employee.id, q, kpi, target, productivity, employee.department, employee.team, orgId, orgId, new Date().toISOString(), new Date().toISOString());
            });
        });
        console.log('Seeded employee performance records.');
    }
    // Seed tasks
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (taskCount === 0) {
        const employees = db.prepare('SELECT * FROM employees').all();
        const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, assigneeId, assigneeName, department, team, organizationId, priority, status, points, updatedAt, companyId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        employees.slice(0, 40).forEach((employee, index) => {
            insertTask.run(`task-seed-${index}`, `Deliver Sprint Feature Module ${index + 1}`, employee.id, employee.name, employee.department, employee.team, orgId, index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW', index % 4 === 0 ? 'DONE' : index % 4 === 1 ? 'IN_PROGRESS' : 'TODO', 3 + (index % 6), new Date().toISOString(), orgId, new Date().toISOString());
        });
        console.log('Seeded Sprint Tasks.');
    }
};
