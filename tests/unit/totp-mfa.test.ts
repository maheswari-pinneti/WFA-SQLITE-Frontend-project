import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { enrollTotp, confirmTotpEnroll, verifyTotpChallenge, createTotpChallenge, disableTotp } from '../../backend/src/modules/auth/auth.service.js';
import { userRepository } from '../../backend/src/modules/auth/auth.repository.js';
import { verifyTotpCode } from '../../backend/src/modules/auth/totp.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

const nobleCrypto = new NobleCryptoPlugin();
const base32Plugin = new ScureBase32Plugin();
const totpInstance = new TOTP({ crypto: nobleCrypto, base32: base32Plugin });

const mockUser = {
  id: 'test-user-mfa-id',
  email: 'testmfa@example.com',
  name: 'MFA Tester',
  role: 'EMPLOYEE',
  organizationId: 'org-stackly',
  companyId: 'org-stackly',
  password_hash: 'dummy_hash'
};

beforeAll(async () => {
  await initDb();
  const db = getDb();
  // Clear any existing test configurations
  db.prepare('DELETE FROM users WHERE id = ?').run(mockUser.id);
  db.prepare('DELETE FROM mfa_settings WHERE user_id = ?').run(mockUser.id);
  db.prepare('DELETE FROM mfa_recovery_codes WHERE user_id = ?').run(mockUser.id);
  
  // Create mock user in database
  db.prepare(`
    INSERT INTO users (id, name, email, role, password_hash, status, companyId, organizationId)
    VALUES (?, ?, ?, ?, ?, 'Active', ?, ?)
  `).run(mockUser.id, mockUser.name, mockUser.email, mockUser.role, mockUser.password_hash, mockUser.companyId, mockUser.organizationId);
});

afterAll(async () => {
  const db = getDb();
  if (db) {
    db.prepare('DELETE FROM users WHERE id = ?').run(mockUser.id);
    db.prepare('DELETE FROM mfa_settings WHERE user_id = ?').run(mockUser.id);
    db.prepare('DELETE FROM mfa_recovery_codes WHERE user_id = ?').run(mockUser.id);
  }
});

describe('TOTP MFA Operational Unit Tests', () => {
  let secret = '';
  let qrUrl = '';
  let recoveryCodesList: string[] = [];

  it('1. Enrollment: Should initiate enrollment setup', async () => {
    const enrollData = await enrollTotp(mockUser);
    expect(enrollData.secret).toBeDefined();
    expect(enrollData.qrCodeDataUrl).toBeDefined();
    expect(enrollData.qrCodeDataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(enrollData.otpauthUrl).toContain(encodeURIComponent(mockUser.email));
    
    secret = enrollData.secret;
    qrUrl = enrollData.qrCodeDataUrl;

    const settings = await userRepository.findMfaSettingsByUserId(mockUser.id);
    expect(settings).toBeDefined();
    expect(settings.enabled).toBe(0); // Not verified/enabled yet
  });

  it('2. Verification & Enabling: Should reject incorrect setup code', async () => {
    await expect(confirmTotpEnroll(mockUser.id, '000000')).rejects.toThrow('Invalid verification code.');
  });

  it('3. Verification & Enabling: Should confirm enrollment with valid TOTP code', async () => {
    const correctCode = await totpInstance.generate({ secret });
    const result = await confirmTotpEnroll(mockUser.id, correctCode);
    expect(result.success).toBe(true);
    expect(result.recoveryCodes.length).toBe(10);
    recoveryCodesList = result.recoveryCodes;

    const settings = await userRepository.findMfaSettingsByUserId(mockUser.id);
    expect(settings.enabled).toBe(1);
  });

  it('4. Login Challenges: Should verify correct TOTP code against login challenge', async () => {
    const challenge = await createTotpChallenge(mockUser);
    expect(challenge.challengeId).toBeDefined();

    const correctCode = await totpInstance.generate({ secret });
    const verifyRes = await verifyTotpChallenge(challenge.challengeId, correctCode);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.userId).toBe(mockUser.id);
  });

  it('5. Login Challenges: Should reject reused TOTP challenge', async () => {
    // Reset replay protection for testing in the same time step
    getDb().prepare('UPDATE mfa_settings SET last_used_time_step = 0 WHERE user_id = ?').run(mockUser.id);
    
    const challenge = await createTotpChallenge(mockUser);
    const correctCode = await totpInstance.generate({ secret });
    
    const verifyRes1 = await verifyTotpChallenge(challenge.challengeId, correctCode);
    expect(verifyRes1.success).toBe(true);

    const verifyRes2 = await verifyTotpChallenge(challenge.challengeId, correctCode);
    expect(verifyRes2.success).toBe(false);
    expect(verifyRes2.message).toContain('already been verified');
  });

  it('6. Replay protection: Should block identical time-step TOTP codes', async () => {
    // Reset replay protection
    getDb().prepare('UPDATE mfa_settings SET last_used_time_step = 0 WHERE user_id = ?').run(mockUser.id);

    const challenge1 = await createTotpChallenge(mockUser);
    const challenge2 = await createTotpChallenge(mockUser);
    const correctCode = await totpInstance.generate({ secret });

    const verifyRes1 = await verifyTotpChallenge(challenge1.challengeId, correctCode);
    expect(verifyRes1.success).toBe(true);

    const verifyRes2 = await verifyTotpChallenge(challenge2.challengeId, correctCode);
    expect(verifyRes2.success).toBe(false);
    expect(verifyRes2.message).toContain('code already used');
  });

  it('7. Recovery Code Flow: Should authenticate using a recovery code and disable it', async () => {
    const challenge = await createTotpChallenge(mockUser);
    const recoveryCode = recoveryCodesList[0];

    const verifyRes = await verifyTotpChallenge(challenge.challengeId, recoveryCode);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.usedRecoveryCode).toBe(true);

    // Reuse must fail
    const challenge2 = await createTotpChallenge(mockUser);
    const verifyRes2 = await verifyTotpChallenge(challenge2.challengeId, recoveryCode);
    expect(verifyRes2.success).toBe(false);
  });

  it('8. Lockdown: Should block challenge session after 5 invalid attempts', async () => {
    const challenge = await createTotpChallenge(mockUser);
    for (let i = 0; i < 5; i++) {
      const res = await verifyTotpChallenge(challenge.challengeId, '999999');
      if (i < 4) {
        expect(res.success).toBe(false);
        expect(res.message).toContain('Unable to verify');
      } else {
        expect(res.success).toBe(false);
        expect(res.message).toContain('Too many incorrect attempts');
      }
    }
  });

  it('9. Disable MFA: Should reset database state', async () => {
    const res = await disableTotp(mockUser.id);
    expect(res.success).toBe(true);

    const settings = await userRepository.findMfaSettingsByUserId(mockUser.id);
    expect(settings).toBeNull();
  });
});
