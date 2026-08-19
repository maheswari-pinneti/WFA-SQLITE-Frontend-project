import { query, execute } from '../../database/sqlite-cloud.js';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  department: string | null;
  team: string | null;
  location: string | null;
  title: string | null;
  clearanceLevel: number;
  status: string;
  permissions: string | string[];
  mfa_enabled: number;
  organizationId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as UserRow;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async findById(id: string): Promise<UserRow | null> {
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as UserRow;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async findByScope(orgId: string): Promise<UserRow[]> {
    const rows = await query(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE organizationId = ?
    `, [orgId]);
    return rows.map((row: any) => ({
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    }));
  }

  async create(userData: any): Promise<UserRow | null> {
    const timestamp = new Date().toISOString();
    const data = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password_hash: userData.password_hash,
      role: userData.role,
      department: userData.department || null,
      team: userData.team || null,
      location: userData.location || null,
      title: userData.title || null,
      clearanceLevel: userData.clearanceLevel ?? 1,
      status: userData.status || 'ACTIVE',
      permissions: JSON.stringify(userData.permissions || []),
      mfa_enabled: userData.mfa_enabled ?? 1,
      organizationId: userData.organizationId || 'org-stackly',
      companyId: userData.companyId || 'org-stackly',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.name, data.email, data.password_hash, data.role, data.department, data.team,
      data.location, data.title, data.clearanceLevel, data.status, data.permissions, data.mfa_enabled,
      data.organizationId, data.companyId, data.createdAt, data.updatedAt
    ]);

    return this.findById(userData.id);
  }

  async updateRole(id: string, role: string, orgId: string): Promise<UserRow | null> {
    await execute('UPDATE users SET role = ?, updatedAt = ? WHERE id = ? AND organizationId = ?', [
      role, new Date().toISOString(), id, orgId
    ]);
    
    const rows = await query(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE id = ? AND organizationId = ?
    `, [id, orgId]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as UserRow;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async delete(id: string, orgId: string): Promise<UserRow | null> {
    const rows = await query('SELECT * FROM users WHERE id = ? AND organizationId = ?', [id, orgId]);
    if (!rows || rows.length === 0) return null;
    const row = rows[0] as UserRow;
    await execute('DELETE FROM users WHERE id = ? AND organizationId = ?', [id, orgId]);
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async createSession(sessionData: any): Promise<any> {
    const data = {
      id: sessionData.id,
      userId: sessionData.userId,
      deviceFingerprint: sessionData.deviceFingerprint || null,
      ipAddress: sessionData.ipAddress || null,
      createdAt: sessionData.createdAt || new Date().toISOString(),
      expiresAt: sessionData.expiresAt,
      revokedAt: sessionData.revokedAt || null,
      companyId: sessionData.companyId || 'org-stackly',
      updatedAt: new Date().toISOString()
    };
    await execute(`
      INSERT INTO sessions (id, userId, deviceFingerprint, ipAddress, createdAt, expiresAt, revokedAt, companyId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.userId, data.deviceFingerprint, data.ipAddress, data.createdAt, data.expiresAt, data.revokedAt, data.companyId, data.updatedAt
    ]);
    return data;
  }

  async findSessionById(sessionId: string): Promise<any> {
    const rows = await query('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async updateSession(sessionId: string, update: any): Promise<any> {
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(sessionId);
    await execute(`UPDATE sessions SET ${setClause}, updatedAt = ? WHERE id = ?`, values);
    return { nModified: 1 };
  }

  async createRefreshToken(tokenData: any): Promise<any> {
    const data = {
      token_hash: tokenData.token_hash,
      sessionId: tokenData.sessionId,
      tokenFamily: tokenData.tokenFamily,
      parentHash: tokenData.parentHash || null,
      expiresAt: tokenData.expiresAt,
      revokedAt: tokenData.revokedAt || null,
      companyId: tokenData.companyId || 'org-stackly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await execute(`
      INSERT INTO refreshtokens (token_hash, sessionId, tokenFamily, parentHash, expiresAt, revokedAt, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.token_hash, data.sessionId, data.tokenFamily, data.parentHash, data.expiresAt, data.revokedAt, data.companyId, data.createdAt, data.updatedAt
    ]);
    return data;
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<any> {
    const rows = await query('SELECT * FROM refreshtokens WHERE token_hash = ?', [tokenHash]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async updateRefreshToken(tokenHash: string, update: any): Promise<any> {
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(tokenHash);
    await execute(`UPDATE refreshtokens SET ${setClause}, updatedAt = ? WHERE token_hash = ?`, values);
    return { nModified: 1 };
  }

  async revokeTokenFamily(tokenFamily: string, revokedAt: string): Promise<any> {
    await execute('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE tokenFamily = ?', [
      revokedAt, new Date().toISOString(), tokenFamily
    ]);
    return { nModified: 1 };
  }

  async revokeActiveSessionTokens(sessionId: string, revokedAt: string): Promise<any> {
    await execute('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE sessionId = ? AND revokedAt IS NULL', [
      revokedAt, new Date().toISOString(), sessionId
    ]);
    return { nModified: 1 };
  }

  async createMfaChallenge(challengeData: any): Promise<any> {
    const data = {
      id: challengeData.id,
      userId: challengeData.userId,
      otp_hash: challengeData.otp_hash,
      expires_at: challengeData.expires_at,
      attempts_count: challengeData.attempts_count ?? 0,
      max_attempts: challengeData.max_attempts ?? 5,
      consumed_at: challengeData.consumed_at || null,
      resend_count: challengeData.resend_count ?? 0,
      created_at: challengeData.created_at || new Date().toISOString(),
      status: challengeData.status || 'Pending',
      organizationId: challengeData.organizationId || 'org-stackly',
      companyId: challengeData.companyId || 'org-stackly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await execute(`
      INSERT INTO mfachallenges (id, userId, otp_hash, expires_at, attempts_count, max_attempts, consumed_at, resend_count, created_at, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.userId, data.otp_hash, data.expires_at, data.attempts_count, data.max_attempts, data.consumed_at, data.resend_count, data.created_at, data.status, data.organizationId, data.companyId, data.createdAt, data.updatedAt
    ]);
    return data;
  }

  async findMfaChallengeById(challengeId: string): Promise<any> {
    const rows = await query('SELECT * FROM mfachallenges WHERE id = ?', [challengeId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async updateMfaChallenge(challengeId: string, update: any): Promise<any> {
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    } else if (update.$inc) {
      const incFields = Object.keys(update.$inc);
      const incClause = incFields.map(k => `${k} = ${k} + ?`).join(', ');
      const values = Object.values(update.$inc);
      values.push(new Date().toISOString());
      values.push(challengeId);
      await execute(`UPDATE mfachallenges SET ${incClause}, updatedAt = ? WHERE id = ?`, values);
      return { nModified: 1 };
    }
    
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(challengeId);
    
    await execute(`UPDATE mfachallenges SET ${setClause}, updatedAt = ? WHERE id = ?`, values);
    return { nModified: 1 };
  }

  async getFailedLogins(email: string): Promise<{ email: string; attempts: number; lockedUntil: string | null } | null> {
    const rows = await query('SELECT * FROM failed_logins WHERE email = ?', [email]);
    return rows && rows.length > 0 ? (rows[0] as any) : null;
  }

  async incrementFailedLogins(email: string, lockUntil: string | null = null): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO failed_logins (email, attempts, lockedUntil, updatedAt)
      VALUES (?, 1, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        attempts = attempts + 1,
        lockedUntil = excluded.lockedUntil,
        updatedAt = excluded.updatedAt
    `, [email, lockUntil, now]);
  }

  async resetFailedLogins(email: string): Promise<void> {
    await execute('DELETE FROM failed_logins WHERE email = ?', [email]);
  }
}

export const userRepository = new UserRepository();
export default userRepository;
