import { getDb } from '../../database/connection.js';

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
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    if (!row) return null;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async findById(id: string): Promise<UserRow | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    if (!row) return null;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async findByScope(orgId: string): Promise<UserRow[]> {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE organizationId = ?
    `).all(orgId) as UserRow[];
    return rows.map(row => ({
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    }));
  }

  async create(userData: any): Promise<UserRow | null> {
    const db = getDb();
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

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (@id, @name, @email, @password_hash, @role, @department, @team, @location, @title, @clearanceLevel, @status, @permissions, @mfa_enabled, @organizationId, @companyId, @createdAt, @updatedAt)
    `).run(data);

    return this.findById(userData.id);
  }

  async updateRole(id: string, role: string, orgId: string): Promise<UserRow | null> {
    const db = getDb();
    db.prepare('UPDATE users SET role = ?, updatedAt = ? WHERE id = ? AND organizationId = ?')
      .run(role, new Date().toISOString(), id, orgId);
    
    const row = db.prepare(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE id = ? AND organizationId = ?
    `).get(id, orgId) as UserRow | undefined;
    if (!row) return null;
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async delete(id: string, orgId: string): Promise<UserRow | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ? AND organizationId = ?').get(id, orgId) as UserRow | undefined;
    if (!row) return null;
    db.prepare('DELETE FROM users WHERE id = ? AND organizationId = ?').run(id, orgId);
    return {
      ...row,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
    };
  }

  async createSession(sessionData: any): Promise<any> {
    const db = getDb();
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
    db.prepare(`
      INSERT INTO sessions (id, userId, deviceFingerprint, ipAddress, createdAt, expiresAt, revokedAt, companyId, updatedAt)
      VALUES (@id, @userId, @deviceFingerprint, @ipAddress, @createdAt, @expiresAt, @revokedAt, @companyId, @updatedAt)
    `).run(data);
    return data;
  }

  async findSessionById(sessionId: string): Promise<any> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return row || null;
  }

  async updateSession(sessionId: string, update: any): Promise<any> {
    const db = getDb();
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(sessionId);
    db.prepare(`UPDATE sessions SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values);
    return { nModified: 1 };
  }

  async createRefreshToken(tokenData: any): Promise<any> {
    const db = getDb();
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
    db.prepare(`
      INSERT INTO refreshtokens (token_hash, sessionId, tokenFamily, parentHash, expiresAt, revokedAt, companyId, createdAt, updatedAt)
      VALUES (@token_hash, @sessionId, @tokenFamily, @parentHash, @expiresAt, @revokedAt, @companyId, @createdAt, @updatedAt)
    `).run(data);
    return data;
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<any> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM refreshtokens WHERE token_hash = ?').get(tokenHash);
    return row || null;
  }

  async updateRefreshToken(tokenHash: string, update: any): Promise<any> {
    const db = getDb();
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(tokenHash);
    db.prepare(`UPDATE refreshtokens SET ${setClause}, updatedAt = ? WHERE token_hash = ?`).run(...values);
    return { nModified: 1 };
  }

  async revokeTokenFamily(tokenFamily: string, revokedAt: string): Promise<any> {
    const db = getDb();
    db.prepare('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE tokenFamily = ?')
      .run(revokedAt, new Date().toISOString(), tokenFamily);
    return { nModified: 1 };
  }

  async revokeActiveSessionTokens(sessionId: string, revokedAt: string): Promise<any> {
    const db = getDb();
    db.prepare('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE sessionId = ? AND revokedAt IS NULL')
      .run(revokedAt, new Date().toISOString(), sessionId);
    return { nModified: 1 };
  }

  async createMfaChallenge(challengeData: any): Promise<any> {
    const db = getDb();
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
    db.prepare(`
      INSERT INTO mfachallenges (id, userId, otp_hash, expires_at, attempts_count, max_attempts, consumed_at, resend_count, created_at, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (@id, @userId, @otp_hash, @expires_at, @attempts_count, @max_attempts, @consumed_at, @resend_count, @created_at, @status, @organizationId, @companyId, @createdAt, @updatedAt)
    `).run(data);
    return data;
  }

  async findMfaChallengeById(challengeId: string): Promise<any> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM mfachallenges WHERE id = ?').get(challengeId);
    return row || null;
  }

  async updateMfaChallenge(challengeId: string, update: any): Promise<any> {
    const db = getDb();
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    } else if (update.$inc) {
      const incFields = Object.keys(update.$inc);
      const incClause = incFields.map(k => `${k} = ${k} + ?`).join(', ');
      const values = Object.values(update.$inc);
      values.push(new Date().toISOString());
      values.push(challengeId);
      db.prepare(`UPDATE mfachallenges SET ${incClause}, updatedAt = ? WHERE id = ?`).run(...values);
      return { nModified: 1 };
    }
    
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString());
    values.push(challengeId);
    
    db.prepare(`UPDATE mfachallenges SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values);
    return { nModified: 1 };
  }
}

export const userRepository = new UserRepository();
export default userRepository;
