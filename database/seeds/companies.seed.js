export const seedCompanies = (db, orgId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
    if (count === 0) {
        db.prepare(`
      INSERT INTO companies (id, name, domain, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(orgId, 'Stackly Enterprise HQ', 'thestackly.com', 'ACTIVE', new Date().toISOString(), new Date().toISOString());
        console.log('Seeded Companies.');
    }
};
