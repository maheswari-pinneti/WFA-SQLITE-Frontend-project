export const seedPermissions = (db, orgId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM permissions').get().count;
    if (count === 0) {
        const insertPerm = db.prepare(`
      INSERT INTO permissions (id, name, description)
      VALUES (?, ?, ?)
    `);
        const perms = [
            ['perm-1', 'USER_CREATE', 'Can create users'],
            ['perm-2', 'USER_UPDATE', 'Can update users'],
            ['perm-3', 'USER_DELETE', 'Can delete users'],
            ['perm-4', 'EMPLOYEE_VIEW_ALL', 'Can view all employees']
        ];
        for (const perm of perms) {
            insertPerm.run(...perm);
        }
        console.log('Seeded Permissions.');
    }
};
