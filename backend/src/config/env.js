import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  });
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'wfa_platform_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wfa_platform_secret_refresh_key_2026';
const TOTP_ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || 'wfa_totp_dev_default_key_32bytes!';

if (NODE_ENV === 'production' && (!process.env.TOTP_ENCRYPTION_KEY || process.env.TOTP_ENCRYPTION_KEY.length < 32)) {
  throw new Error('PRODUCTION ERROR: TOTP_ENCRYPTION_KEY must be a cryptographically secure key of at least 32 characters in production.');
}

export const env = {
  NODE_ENV,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  TOTP_ENCRYPTION_KEY,
  PORT: process.env.PORT || 5001
};
