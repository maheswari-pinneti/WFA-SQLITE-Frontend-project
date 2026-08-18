import { Database } from 'better-sqlite3';

export const seedCompanies = (db: Database, orgId: string) => {
  const count = (db.prepare('SELECT COUNT(*) as count FROM companies').get() as any).count;
  if (count === 0) {
    db.prepare(`
      INSERT INTO companies (id, name, domain, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(orgId, 'Stackly Enterprise HQ', 'thestackly.com', 'ACTIVE', new Date().toISOString(), new Date().toISOString());
    console.log('Seeded Companies.');
  }
};
