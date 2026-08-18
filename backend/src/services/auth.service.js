import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 5;

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const toUserContext = (user) => ({
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
  organizationId: user.organizationId || 'org-stackly',
  permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : user.permissions
});

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      ...toUserContext(user),
      requiresMfa: false
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const createSession = async (user, ipAddress = '', deviceFingerprint = '') => {
  const sessionId = crypto.randomUUID();
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = hashToken(rawRefreshToken);
  const tokenFamily = crypto.randomUUID();

  const now = new Date().toISOString();
  const sessionExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Create session
  await userRepository.createSession({
    id: sessionId,
    userId: user.id,
    deviceFingerprint,
    ipAddress,
    createdAt: now,
    expiresAt: sessionExpiresAt,
    revokedAt: null
  });

  // Store refresh token
  await userRepository.createRefreshToken({
    token_hash: refreshTokenHash,
    sessionId,
    tokenFamily,
    parentHash: null,
    expiresAt: sessionExpiresAt,
    revokedAt: null
  });

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    sessionId
  };
};

export const rotateRefreshToken = async (oldRefreshToken, ipAddress = '', deviceFingerprint = '') => {
  const oldHash = hashToken(oldRefreshToken);
  const now = new Date().toISOString();

  const tokenRecord = await userRepository.findRefreshTokenByHash(oldHash);
  if (!tokenRecord) {
    throw new Error('Invalid refresh token');
  }

  const session = await userRepository.findSessionById(tokenRecord.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const { sessionId, tokenFamily, expiresAt, revokedAt } = tokenRecord;
  const sessionRevokedAt = session.revokedAt;
  const userId = session.userId;

  if (revokedAt || sessionRevokedAt || now > expiresAt) {
    if (revokedAt) {
      console.warn(`[SECURITY WARNING] Refresh token reuse detected! Revoking family: ${tokenFamily}`);
      await userRepository.revokeTokenFamily(tokenFamily, now);
      await userRepository.updateSession(sessionId, { revokedAt: now });
    }
    throw new Error('Refresh token revoked or expired');
  }

  const user = await userRepository.findById(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw new Error('User inactive or not found');
  }

  // Revoke the old token
  await userRepository.updateRefreshToken(oldHash, { revokedAt: now });

  // Create new refresh token in the same family
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  const newHash = hashToken(newRefreshToken);
  const tokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await userRepository.createRefreshToken({
    token_hash: newHash,
    sessionId,
    tokenFamily,
    parentHash: oldHash,
    expiresAt: tokenExpiresAt,
    revokedAt: null
  });

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};

export const revokeSession = async (sessionId) => {
  const now = new Date().toISOString();
  await userRepository.updateSession(sessionId, { revokedAt: now });
  await userRepository.revokeActiveSessionTokens(sessionId, now);
};

export const revokeRefreshToken = async (refreshToken) => {
  const hash = hashToken(refreshToken);
  const tokenRecord = await userRepository.findRefreshTokenByHash(hash);
  if (tokenRecord) {
    await revokeSession(tokenRecord.sessionId);
  }
};

// MFA Operations
export const generateAndSendOtp = async (user) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = bcrypt.genSaltSync(10);
  const otpHash = bcrypt.hashSync(code, salt);
  
  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  console.log(`[MFA DELIVERY] Simulated Email/SMS OTP code for ${user.email} is: ${code}`);

  await userRepository.createMfaChallenge({
    id: challengeId,
    userId: user.id,
    otp_hash: otpHash,
    expires_at: expiresAt,
    attempts_count: 0,
    max_attempts: MAX_ATTEMPTS,
    consumed_at: null,
    resend_count: 0,
    created_at: createdAt,
    status: 'Pending'
  });

  return {
    success: true,
    challengeId,
    expiresAt,
    otpDevHint: process.env.NODE_ENV !== 'production' ? code : undefined
  };
};

export const verifyOtp = async (challengeId, code) => {
  const challenge = await userRepository.findMfaChallengeById(challengeId);
  if (!challenge) {
    return { success: false, message: 'MFA session expired or invalid' };
  }

  if (challenge.status === 'Verified' || challenge.consumed_at) {
    return { success: false, message: 'OTP already verified or consumed.' };
  }

  if (challenge.status === 'Blocked' || challenge.attempts_count >= challenge.max_attempts) {
    return { success: false, message: 'Too many incorrect attempts. Please sign in again.' };
  }

  const now = new Date().toISOString();
  if (now > challenge.expires_at) {
    return { success: false, message: 'OTP expired. Please request a new OTP.' };
  }

  const match = bcrypt.compareSync(code, challenge.otp_hash);

  if (match) {
    const consumedAt = new Date().toISOString();
    await userRepository.updateMfaChallenge(challengeId, { status: 'Verified', consumed_at: consumedAt });
    return { success: true, userId: challenge.userId };
  } else {
    const nextAttemptsCount = challenge.attempts_count + 1;
    const nextStatus = nextAttemptsCount >= challenge.max_attempts ? 'Blocked' : 'Pending';

    await userRepository.updateMfaChallenge(challengeId, { attempts_count: nextAttemptsCount, status: nextStatus });

    if (nextStatus === 'Blocked') {
      return { success: false, message: 'Too many incorrect attempts. Please sign in again.' };
    } else {
      return { success: false, message: 'Invalid OTP code.' };
    }
  }
};

export const resendOtp = async (challengeId) => {
  const challenge = await userRepository.findMfaChallengeById(challengeId);
  if (!challenge) {
    return { success: false, message: 'MFA session expired or invalid' };
  }

  if (challenge.resend_count >= MAX_RESENDS) {
    return { success: false, message: 'Maximum resend attempts reached for this session.' };
  }

  if (challenge.status === 'Verified' || challenge.consumed_at) {
    return { success: false, message: 'Session already completed.' };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = bcrypt.genSaltSync(10);
  const otpHash = bcrypt.hashSync(code, salt);
  
  const newExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const nextResendCount = challenge.resend_count + 1;

  const user = await userRepository.findById(challenge.userId);
  if (!user) {
    return { success: false, message: 'Associated user profile not found.' };
  }

  console.log(`[MFA DELIVERY] Simulated Resent Email/SMS OTP code for ${user.email} is: ${code}`);

  await userRepository.updateMfaChallenge(challengeId, {
    otp_hash: otpHash,
    expires_at: newExpiresAt,
    attempts_count: 0,
    resend_count: nextResendCount,
    status: 'Pending'
  });

  return {
    success: true,
    challengeId,
    expiresAt: newExpiresAt,
    otpDevHint: process.env.NODE_ENV !== 'production' ? code : undefined
  };
};
