import { getDb } from '../config/db.js';

export class UserRepository {
  async findByEmail(email) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row) return null;
    return {
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    };
  }

  async findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    };
  }

  async findByScope(orgId) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE organizationId = ?
    `).all(orgId);
    return rows.map(row => ({
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    }));
  }

  async create(userData) {
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

  async updateRole(id, role, orgId) {
    const db = getDb();
    db.prepare('UPDATE users SET role = ?, updatedAt = ? WHERE id = ? AND organizationId = ?')
      .run(role, new Date().toISOString(), id, orgId);
    
    const row = db.prepare(`
      SELECT id, name, email, role, department, team, location, title, clearanceLevel, status, permissions 
      FROM users 
      WHERE id = ? AND organizationId = ?
    `).get(id, orgId);
    if (!row) return null;
    return {
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    };
  }

  async delete(id, orgId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ? AND organizationId = ?').get(id, orgId);
    if (!row) return null;
    db.prepare('DELETE FROM users WHERE id = ? AND organizationId = ?').run(id, orgId);
    return {
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    };
  }

  // Session Management
  async createSession(sessionData) {
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

  async findSessionById(sessionId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return row || null;
  }

  async updateSession(sessionId, update) {
    const db = getDb();
    // Resolve update set clause dynamically
    const fields = Object.keys(update);
    if (fields.length === 0) return;
    
    // Convert Mongoose update syntax if needed, e.g. { $set: { revokedAt } } or direct values
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString()); // updatedAt
    values.push(sessionId);
    
    db.prepare(`UPDATE sessions SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values);
    return { nModified: 1 };
  }

  // Refresh Token Management
  async createRefreshToken(tokenData) {
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

  async findRefreshTokenByHash(tokenHash) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM refreshtokens WHERE token_hash = ?').get(tokenHash);
    return row || null;
  }

  async updateRefreshToken(tokenHash, update) {
    const db = getDb();
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString()); // updatedAt
    values.push(tokenHash);
    
    db.prepare(`UPDATE refreshtokens SET ${setClause}, updatedAt = ? WHERE token_hash = ?`).run(...values);
    return { nModified: 1 };
  }

  async revokeTokenFamily(tokenFamily, revokedAt) {
    const db = getDb();
    db.prepare('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE tokenFamily = ?')
      .run(revokedAt, new Date().toISOString(), tokenFamily);
    return { nModified: 1 };
  }

  async revokeActiveSessionTokens(sessionId, revokedAt) {
    const db = getDb();
    db.prepare('UPDATE refreshtokens SET revokedAt = ?, updatedAt = ? WHERE sessionId = ? AND revokedAt IS NULL')
      .run(revokedAt, new Date().toISOString(), sessionId);
    return { nModified: 1 };
  }

  // MFA Challenge Management
  async createMfaChallenge(challengeData) {
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

  async findMfaChallengeById(challengeId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM mfachallenges WHERE id = ?').get(challengeId);
    return row || null;
  }

  async updateMfaChallenge(challengeId, update) {
    const db = getDb();
    let updates = update;
    if (update.$set) {
      updates = update.$set;
    } else if (update.$inc) {
      // Handle increment specifically (like attempts_count or resend_count)
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
    values.push(new Date().toISOString()); // updatedAt
    values.push(challengeId);
    
    db.prepare(`UPDATE mfachallenges SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values);
    return { nModified: 1 };
  }
}

export const userRepository = new UserRepository();
export default userRepository;
