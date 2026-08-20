import { connectDatabase, query, execute, healthCheck } from './sqlite-cloud.js';

export const ORGANIZATION_ID = 'org-stackly';
let initPromise: Promise<void> | null = null;

// Re-export getDb for any remaining legacy calls (returns raw local/cloud db client)
export { getDatabase as getDb } from './sqlite-cloud.js';

export const initDb = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Connect to either SQLite Cloud or fallback to local SQLite
        await connectDatabase();

        // Ensure critical tables exist (like failed_logins)
        await execute(`
          CREATE TABLE IF NOT EXISTS failed_logins (
            email TEXT PRIMARY KEY,
            attempts INTEGER DEFAULT 0,
            lockedUntil TEXT,
            updatedAt TEXT
          )
        `);

        // Ensure MFA tables exist
        await execute(`
          CREATE TABLE IF NOT EXISTS mfa_settings (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            enabled INTEGER DEFAULT 0,
            secret_encrypted TEXT NOT NULL,
            verified_at TEXT,
            created_at TEXT,
            updated_at TEXT,
            last_used_time_step INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await execute(`
          CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await execute(`CREATE INDEX IF NOT EXISTS idx_mfa_settings_user ON mfa_settings(user_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_mfa_recovery_user ON mfa_recovery_codes(user_id)`);

        // Perform health check write test
        const isHealthy = await healthCheck();
        if (!isHealthy) {
          throw new Error('Database ping query failed during initialization.');
        }

        const id = 'startup-verify-' + Date.now();
        const timestamp = new Date().toISOString();
        await execute(`
          INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
          VALUES (?, ?, 'system', 'startup-test', 'validation-write', ?, ?)
        `, [id, timestamp, ORGANIZATION_ID, ORGANIZATION_ID]);
        
        await execute('DELETE FROM audit_logs WHERE id = ?', [id]);

        console.log('[SQLite Init] Database connection and health verified successfully.');
      } catch (err: any) {
        console.error('[SQLite Init] Database initialization failed:', err);
        throw err;
      }
    })();
  }
  return initPromise;
};

export const logAudit = async (userId: string, action: string, details: string, organizationId: string = ORGANIZATION_ID): Promise<void> => {
  const id = Math.random().toString(36).slice(2, 11);
  const timestamp = new Date().toISOString();
  try {
    await execute(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, timestamp, userId || 'anonymous', action, details, organizationId, organizationId]);
  } catch (err) {
    console.error('[logAudit] Failed to log audit event:', err);
  }
};
