import { Request, Response } from 'express';
import { logAudit } from '../../database/connection.js';
import * as authService from './auth.service.js';
import { userRepository } from './auth.repository.js';
import bcrypt from 'bcryptjs';
import mongoose from '../../database/transaction.js';
import { healthCheck as dbHealthCheck } from '../../database/sqlite-cloud.js';

const ORGANIZATION_ID = 'org-stackly';

const toUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  team: user.team,
  location: user.location,
  title: user.title,
  clearanceLevel: user.clearanceLevel,
  status: user.status,
  organizationId: user.organizationId || ORGANIZATION_ID,
  permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : user.permissions
});

const maxConcurrentHashes = 4;
let activeHashes = 0;
const hashQueue: (() => void)[] = [];

const queueBcryptCompare = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const runCompare = async () => {
      activeHashes++;
      try {
        const match = await bcrypt.compare(password, hash);
        resolve(match);
      } catch (err) {
        reject(err);
      } finally {
        activeHashes--;
        if (hashQueue.length > 0) {
          const next = hashQueue.shift();
          if (next) next();
        }
      }
    };

    if (activeHashes < maxConcurrentHashes) {
      runCompare();
    } else {
      hashQueue.push(runCompare);
    }
  });
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, email, roleType, department, password } = req.body;
    const name = fullName;
    const role = roleType;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, roleType, and password are required' });
    }

    if (role === 'ADMIN' || role === 'HR' || role === 'HR_MANAGER') {
      return res.status(403).json({ success: false, message: 'Registration for privileged roles (ADMIN, HR) is restricted.' });
    }

    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith('@thestackly.com') && !emailLower.endsWith('@company.com')) {
      return res.status(403).json({ success: false, message: 'Domain access denied. Only corporate email domains permitted.' });
    }

    const lookupEmail = emailLower.endsWith('@company.com')
      ? emailLower.replace('@company.com', '@thestackly.com')
      : emailLower;

    const existingUser = await userRepository.findByEmail(lookupEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    
    // Auto-assign permissions based on role
    let permissions: string[] = ['EMPLOYEE_VIEW'];
    let clearanceLevel = 1;
    if (role === 'ADMIN') {
      permissions = ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'EMPLOYEE_VIEW_ALL', 'VIEW_ALL_DATA', 'EMPLOYEE_MANAGE'];
      clearanceLevel = 5;
    } else if (role === 'HR') {
      permissions = ['EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_MANAGE'];
      clearanceLevel = 4;
    } else if (role === 'MANAGER') {
      permissions = ['EMPLOYEE_UPDATE', 'EMPLOYEE_VIEW_ALL'];
      clearanceLevel = 3;
    } else if (role === 'TEAM_LEAD') {
      permissions = ['EMPLOYEE_VIEW_ALL'];
      clearanceLevel = 2;
    }

    const userId = 'usr-' + Math.random().toString(36).substring(2, 11);

    const newUser = await userRepository.create({
      id: userId,
      name,
      email: lookupEmail,
      password_hash,
      role,
      department,
      clearanceLevel,
      permissions,
      mfa_enabled: 1
    });

    logAudit(userId, 'REGISTER', `Successfully registered user ${emailLower}`);

    return res.status(201).json({
      success: true,
      data: {
        user: toUser(newUser)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawEmail = req.body?.email;
    const password = req.body?.password;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (!email.endsWith('@thestackly.com') && !email.endsWith('@company.com')) {
      logAudit('anonymous', 'FAILED_AUTHENTICATION', `Login domain rejected for ${email}`);
      return res.status(403).json({ success: false, message: 'Domain access denied. Only corporate email domains permitted.' });
    }

    const lookupEmail = email.endsWith('@company.com')
      ? email.replace('@company.com', '@thestackly.com')
      : email;

    const user = await userRepository.findByEmail(lookupEmail);
    if (!user) {
      logAudit('anonymous', 'FAILED_AUTHENTICATION', `User not found: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const failedRecord = await userRepository.getFailedLogins(lookupEmail);
    if (failedRecord && failedRecord.lockedUntil) {
      const now = new Date().toISOString();
      if (now < failedRecord.lockedUntil) {
        const remainingMinutes = Math.ceil((new Date(failedRecord.lockedUntil).getTime() - Date.now()) / (60 * 1000));
        logAudit('anonymous', 'LOCKOUT_BLOCKED', `Blocked login attempt for locked account ${email}`);
        return res.status(423).json({
          success: false,
          message: `This account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`
        });
      }
    }

    try {
      const isMatch = await queueBcryptCompare(password, user.password_hash);
      if (!isMatch) {
        const attempts = failedRecord ? failedRecord.attempts + 1 : 1;
        let lockedUntil: string | null = null;
        if (attempts >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          logAudit(user.id, 'ACCOUNT_LOCKOUT', `Account ${email} locked for 15 minutes due to 5 failures`);
        }
        await userRepository.incrementFailedLogins(lookupEmail, lockedUntil);

        logAudit(user.id, 'FAILED_AUTHENTICATION', `Incorrect password for ${email}`);
        return res.status(401).json({
          success: false,
          message: lockedUntil
            ? 'Too many failed attempts. Your account has been locked for 15 minutes.'
            : `Invalid email or password. Attempt ${attempts} of 5.`
        });
      }
    } catch (compareErr) {
      return res.status(500).json({ success: false, message: 'Encryption verification failed' });
    }

    await userRepository.resetFailedLogins(lookupEmail);

    const mfaSettings = await userRepository.findMfaSettingsByUserId(user.id);
    if (mfaSettings && mfaSettings.enabled) {
      try {
        const mfaRes = await authService.createTotpChallenge(user);
        logAudit(user.id, 'MFA_CHALLENGE', `TOTP MFA challenge generated for ${email}`);

        return res.json({
          success: true,
          data: {
            requiresMfa: true,
            requiresTotp: true,
            challengeId: mfaRes.challengeId,
            expiresAt: mfaRes.expiresAt
          }
        });
      } catch (mfaErr: any) {
        return res.status(500).json({ success: false, message: mfaErr.message });
      }
    }

    if (user.mfa_enabled) {
      try {
        const mfaMethod = req.body?.mfaMethod || 'email';
        const mfaRes = await authService.generateAndSendOtp(user, mfaMethod);
        logAudit(user.id, 'MFA_CHALLENGE', `OTP challenge generated for ${email} via ${mfaMethod}`);

        return res.json({
          success: true,
          data: {
            requiresMfa: true,
            challengeId: mfaRes.challengeId,
            expiresAt: mfaRes.expiresAt,
            otpSent: true,
            otpDevHint: mfaRes.otpDevHint
          }
        });
      } catch (mfaErr: any) {
        return res.status(500).json({ success: false, message: mfaErr.message });
      }
    }

    try {
      const session = await authService.createSession(user, req.ip, req.headers['user-agent'] as string);
      logAudit(user.id, 'LOGIN', `Logged in without MFA successfully`);

      return res.json({
        success: true,
        data: {
          token: session.accessToken,
          refreshToken: session.refreshToken,
          user: toUser(user)
        }
      });
    } catch (sessionErr: any) {
      return res.status(500).json({ success: false, message: sessionErr.message });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyMfa = async (req: Request, res: Response): Promise<any> => {
  const challengeId = req.body.challengeId || req.body.tempToken;
  const code = req.body.otp || req.body.code;

  if (!challengeId || !code) {
    return res.status(400).json({ success: false, message: 'Challenge ID and MFA OTP code are required' });
  }

  try {
    const challenge = await userRepository.findMfaChallengeById(challengeId);
    if (!challenge) {
      return res.status(400).json({ success: false, message: 'MFA session expired or invalid' });
    }

    let verifyResult;
    if (challenge.otp_hash === 'totp-mfa') {
      verifyResult = await authService.verifyTotpChallenge(challengeId, code);
    } else {
      verifyResult = await authService.verifyOtp(challengeId, code);
    }

    if (!verifyResult.success) {
      logAudit('anonymous', 'FAILED_MFA_VERIFICATION', `Failed MFA verification for challenge ${challengeId}: ${verifyResult.message}`);
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    const user = await userRepository.findById(verifyResult.userId!);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    try {
      const session = await authService.createSession(user, req.ip, req.headers['user-agent'] as string);
      logAudit(user.id, 'MFA_VERIFICATION', `Successfully authenticated user ${user.email} via MFA OTP`);

      return res.json({
        success: true,
        data: {
          token: session.accessToken,
          refreshToken: session.refreshToken,
          user: toUser(user)
        }
      });
    } catch (sessionErr: any) {
      return res.status(500).json({ success: false, message: sessionErr.message });
    }
  } catch (err: any) {
    console.error("MFA VERIFICATION ERROR:", err);
    return res.status(403).json({ success: false, message: 'MFA session expired or invalid' });
  }
};

export const logout = async (req: any, res: Response): Promise<any> => {
  const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
  if (refreshToken) {
    try {
      await authService.revokeRefreshToken(refreshToken);
    } catch (err) {
      console.error('Error during token revocation:', err);
    }
  }

  if (req.user) {
    logAudit(req.user.id, 'LOGOUT', `User ${req.user.email} initiated logout`);
  }
  return res.json({ success: true, message: 'Logout successful' });
};

export const getMe = (req: any, res: Response): any => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User context missing' });
  }
  return res.json({
    success: true,
    data: toUser(req.user)
  });
};

export const refresh = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const rotated = await authService.rotateRefreshToken(refreshToken, req.ip, req.headers['user-agent'] as string);
    return res.json({
      success: true,
      data: {
        token: rotated.accessToken,
        refreshToken: rotated.refreshToken
      }
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, message: err.message || 'Invalid or expired refresh token' });
  }
};

export const resendMfa = async (req: Request, res: Response): Promise<any> => {
  const challengeId = req.body.challengeId || req.body.tempToken;
  const mfaMethod = req.body.mfaMethod || 'email';
  if (!challengeId) {
    return res.status(400).json({ success: false, message: 'Challenge ID is required.' });
  }

  try {
    const resendResult = await authService.resendOtp(challengeId, mfaMethod);
    if (!resendResult.success) {
      return res.status(400).json({ success: false, message: resendResult.message });
    }

    logAudit('anonymous', 'OTP_RESEND', `OTP challenge resent for session ${challengeId}`);

    return res.json({
      success: true,
      data: {
        challengeId: resendResult.challengeId,
        expiresAt: resendResult.expiresAt,
        otpSent: true,
        otpDevHint: resendResult.otpDevHint
      }
    });
  } catch (err) {
    console.error("MFA RESEND ERROR:", err);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
};

export const healthCheck = async (req: Request, res: Response): Promise<any> => {
  try {
    const dbConnected = await dbHealthCheck();
    return res.json({
      success: true,
      status: "healthy",
      api: "healthy",
      database: dbConnected ? "connected" : "disconnected",
      databaseType: "SQLite",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: "healthy",
      api: "healthy",
      database: "error",
      databaseType: "SQLite",
      environment: process.env.NODE_ENV || "development"
    });
  }
};

export const healthCheckDb = async (req: Request, res: Response): Promise<any> => {
  try {
    const isConnected = await dbHealthCheck();
    if (isConnected) {
      return res.json({
        status: "ok",
        database: "sqlite-cloud",
        connected: true,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        status: "error",
        database: "sqlite-cloud",
        connected: false,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      database: "sqlite-cloud",
      connected: false,
      timestamp: new Date().toISOString()
    });
  }
};

export const enrollTotpMfa = async (req: any, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const mfaData = await authService.enrollTotp(user);
    logAudit(user.id, 'MFA_ENROLLMENT_STARTED', `User ${user.email} initiated TOTP MFA enrollment`);

    return res.json({
      success: true,
      data: {
        secret: mfaData.secret,
        qrCodeDataUrl: mfaData.qrCodeDataUrl,
        otpauthUrl: mfaData.otpauthUrl
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const confirmEnrollMfa = async (req: any, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { code } = req.body;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code is required' });
    }

    const confirmRes = await authService.confirmTotpEnroll(user.id, code);
    logAudit(user.id, 'MFA_ENROLLMENT_COMPLETED', `User ${user.email} completed TOTP MFA setup successfully`);

    return res.json({
      success: true,
      data: {
        recoveryCodes: confirmRes.recoveryCodes
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const disableTotpMfa = async (req: any, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { password, code } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const fullUser = await userRepository.findById(user.id);
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify Password
    const isMatch = await queueBcryptCompare(password, fullUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Verify Code
    const settings = await userRepository.findMfaSettingsByUserId(user.id);
    if (!settings || !settings.enabled) {
      return res.status(400).json({ success: false, message: 'MFA is not enabled.' });
    }

    const rawSecret = decryptSecret(settings.secret_encrypted);
    const isValidTotp = await verifyTotpCode(code, rawSecret);
    
    // Fallback to recovery code verification if code does not match TOTP
    let isValidCode = isValidTotp;
    if (!isValidCode) {
      const recoveryRecords = await userRepository.findRecoveryCodes(user.id);
      const unusedRecovery = recoveryRecords.filter(r => !r.used_at);
      const matchedHash = verifyRecoveryCode(code, unusedRecovery.map(r => r.code_hash));
      if (matchedHash) {
        await userRepository.useRecoveryCode(user.id, matchedHash);
        isValidCode = true;
      }
    }

    if (!isValidCode) {
      return res.status(400).json({ success: false, message: 'Unable to verify authentication code.' });
    }

    await authService.disableTotp(user.id);
    logAudit(user.id, 'MFA_DISABLED', `User ${user.email} disabled TOTP MFA`);

    return res.json({ success: true, message: 'Two-Factor Authentication disabled successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const regenerateRecoveryCodes = async (req: any, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { password } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const fullUser = await userRepository.findById(user.id);
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify Password
    const isMatch = await queueBcryptCompare(password, fullUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const codes = await authService.regenerateRecoveryCodesForUser(user.id);
    logAudit(user.id, 'MFA_RECOVERY_CODES_REGENERATED', `User ${user.email} regenerated recovery codes`);

    return res.json({
      success: true,
      data: {
        recoveryCodes: codes
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getMfaStatus = async (req: any, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const settings = await userRepository.findMfaSettingsByUserId(user.id);
    return res.json({
      success: true,
      data: {
        enabled: settings ? !!settings.enabled : false,
        verifiedAt: settings ? settings.verified_at : null
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const adminResetMfa = async (req: any, res: Response): Promise<any> => {
  try {
    const adminUser = req.user;
    const { userId } = req.params;

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only administrators can reset MFA settings.' });
    }

    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    await authService.disableTotp(userId);
    logAudit(adminUser.id, 'MFA_RESET', `Administrator reset MFA credentials for user ${targetUser.email}`);

    return res.json({ success: true, message: `MFA credentials reset for ${targetUser.name}.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const adminGetMfaUsers = async (req: any, res: Response): Promise<any> => {
  try {
    const adminUser = req.user;
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const users = await userRepository.findByScope('org-stackly');
    const records = [];

    for (const u of users) {
      const settings = await userRepository.findMfaSettingsByUserId(u.id);
      records.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        mfaEnabled: settings ? !!settings.enabled : false,
        mfaVerifiedAt: settings ? settings.verified_at : null
      });
    }

    return res.json({
      success: true,
      data: records
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

