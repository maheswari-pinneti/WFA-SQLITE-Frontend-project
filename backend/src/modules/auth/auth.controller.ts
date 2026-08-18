import { Request, Response } from 'express';
import { logAudit } from '../../database/connection.js';
import * as authService from './auth.service.js';
import { userRepository } from './auth.repository.js';
import bcrypt from 'bcryptjs';
import mongoose from '../../database/transaction.js';

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

    try {
      const isMatch = await queueBcryptCompare(password, user.password_hash);
      if (!isMatch) {
        logAudit(user.id, 'FAILED_AUTHENTICATION', `Incorrect password for ${email}`);
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } catch (compareErr) {
      return res.status(500).json({ success: false, message: 'Encryption verification failed' });
    }

    if (user.mfa_enabled) {
      try {
        const mfaRes = await authService.generateAndSendOtp(user);
        logAudit(user.id, 'MFA_CHALLENGE', `OTP challenge generated for ${email}`);

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
    const verifyResult = await authService.verifyOtp(challengeId, code);
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
  if (!challengeId) {
    return res.status(400).json({ success: false, message: 'Challenge ID is required.' });
  }

  try {
    const resendResult = await authService.resendOtp(challengeId);
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
    let dbStatus = "disconnected";
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      dbStatus = "connected";
    }
    return res.json({
      success: true,
      status: "healthy",
      api: "healthy",
      database: dbStatus,
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
