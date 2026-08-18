export const seedRoles = (db, orgId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
    if (count === 0) {
        const insertRole = db.prepare(`
      INSERT INTO roles (id, name, description)
      VALUES (?, ?, ?)
    `);
        const roles = [
            ['role-admin', 'ADMIN', 'Administrator privilege'],
            ['role-hr', 'HR', 'HR privilege'],
            ['role-manager', 'MANAGER', 'Manager privilege'],
            ['role-lead', 'TEAM_LEAD', 'Team lead privilege'],
            ['role-employee', 'EMPLOYEE', 'Standard employee privilege']
        ];
        for (const role of roles) {
            insertRole.run(...role);
        }
        console.log('Seeded Roles.');
    }
};
