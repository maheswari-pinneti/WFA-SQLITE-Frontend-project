export const seedTeams = (db, orgId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    if (count === 0) {
        const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, departmentId, leadId, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const teams = [
            ['team-frontend', 'Frontend Team', 'dept-eng', 'usr-lead-01', orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['team-platform', 'Core Platform', 'dept-eng', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()],
            ['team-recruit', 'Talent Acquisition', 'dept-hr', null, orgId, orgId, new Date().toISOString(), new Date().toISOString()]
        ];
        for (const team of teams) {
            insertTeam.run(...team);
        }
        console.log('Seeded Teams.');
    }
};
