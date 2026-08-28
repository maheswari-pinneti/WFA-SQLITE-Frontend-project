import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import { env } from '../../config/env.js';

const nobleCrypto = new NobleCryptoPlugin();
const base32Plugin = new ScureBase32Plugin();
const totpInstance = new TOTP({ crypto: nobleCrypto, base32: base32Plugin });

// Derive 32-byte key from environment configuration key
const getEncryptionKey = (): Buffer => {
  const rawKey = env.TOTP_ENCRYPTION_KEY || 'wfa_totp_dev_default_key_32bytes!';
  return crypto.createHash('sha256').update(rawKey).digest();
};

/**
 * Encrypt standard string using AES-256-GCM
 */
export const encryptSecret = (plaintext: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}.${ciphertext}.${authTag}`;
};

/**
 * Decrypt standard string using AES-256-GCM
 */
export const decryptSecret = (encryptedText: string): string => {
  const key = getEncryptionKey();
  const parts = encryptedText.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted secret format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const ciphertext = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let plaintext = decipher.update(ciphertext as any, undefined, 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
};

/**
 * Generate a new cryptographically secure TOTP secret key
 */
export const generateTotpSecret = (): string => {
  return totpInstance.generateSecret();
};

/**
 * Generate otpauth:// URI and scan QR Code image representation
 */
export const generateQrCode = async (email: string, secret: string): Promise<{ otpauthUrl: string; qrCodeDataUrl: string }> => {
  const issuer = process.env.MFA_ISSUER || 'WorkforceAnalytics';
  const otpauthUrl = totpInstance.toURI({ secret, label: email, issuer });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return { otpauthUrl, qrCodeDataUrl };
};

/**
 * Validate standard 6-digit TOTP code
 */
export const verifyTotpCode = async (code: string, secret: string): Promise<boolean> => {
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return false;
  }
  try {
    const result = await totpInstance.verify(code, { secret, window: 4 } as any);
    return result.valid;
  } catch (err) {
    return false;
  }
};

/**
 * Generate 10 secure, single-use one-time recovery codes
 */
export const generateRecoveryCodes = (): { plaintextCodes: string[]; hashedCodes: string[] } => {
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    // Generate secure 10-character code
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase(); // e.g. "A4F2E78C90"
    const displayFormat = `${raw.substring(0, 5)}-${raw.substring(5)}`; // "A4F2E-78C90"
    plaintextCodes.push(displayFormat);
    
    // Hash code for database storage
    const hash = crypto.createHash('sha256').update(displayFormat).digest('hex');
    hashedCodes.push(hash);
  }
  
  return { plaintextCodes, hashedCodes };
};

/**
 * Verify a recovery code against stored hashes
 */
export const verifyRecoveryCode = (userInput: string, storedHashes: string[]): string | null => {
  if (!userInput) return null;
  const hash = crypto.createHash('sha256').update(userInput.trim()).digest('hex');
  return storedHashes.includes(hash) ? hash : null;
};

export const getTotpCode = async (secret: string): Promise<string> => {
  return await totpInstance.generate({ secret });
};
