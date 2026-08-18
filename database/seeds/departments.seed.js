export const seedDepartments = (db, orgId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
    if (count === 0) {
        const insertDept = db.prepare(`
      INSERT INTO departments (id, name, code, managerId, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const depts = [
            ['dept-eng', 'Engineering', 'ENG', 'usr-mgr-01', orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['dept-prod', 'Product Management', 'PROD', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['dept-sales', 'Sales & Marketing', 'SALES', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['dept-hr', 'Human Resources', 'HR', 'usr-hr-01', orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['dept-cs', 'Customer Success', 'CS', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['dept-fin', 'Finance & Operations', 'FIN', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()]
        ];
        for (const dept of depts) {
            insertDept.run(...dept);
        }
        console.log('Seeded Departments.');
    }
};
