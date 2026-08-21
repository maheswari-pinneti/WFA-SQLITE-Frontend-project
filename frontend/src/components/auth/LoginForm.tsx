import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { authService } from '../../auth/services/auth.service';
import PasswordField from './PasswordField';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import { RoleType } from '../../theme/roles';

interface LoginFormProps {
  selectedRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onSuccess: () => void;
}

const DEMO_ACCOUNTS: { role: RoleType; email: string; label: string; name: string }[] = [
  { role: 'ADMIN', email: 'admin@thestackly.com', label: 'Sarah Connor', name: 'Admin' },
  { role: 'HR', email: 'hr@thestackly.com', label: 'Elena Rostova', name: 'HR Manager' },
  { role: 'MANAGER', email: 'manager@thestackly.com', label: 'David Sterling', name: 'Manager' },
  { role: 'TEAM_LEAD', email: 'lead@thestackly.com', label: 'Marcus Vance', name: 'Team Lead' },
  { role: 'EMPLOYEE', email: 'employee@thestackly.com', label: 'Alex Carter', name: 'Employee' }
];

export const LoginForm: React.FC<LoginFormProps> = ({ selectedRole, onRoleChange, onSuccess }) => {
  const { login, verifyMfa, resendMfa } = useAuth();
  
  // Forms states
  const [email, setEmail] = useState('admin@thestackly.com');
  const [password, setPassword] = useState('StacklyWFA2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<'email' | 'sms'>('email');

  // OTP Verification states
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // OTP Countdown timer
  useEffect(() => {
    if (!expiresAt) {
      setTimer(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimer(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Recover MFA session if present and valid on load
  useEffect(() => {
    const savedChallengeId = sessionStorage.getItem('mfa_challenge_id');
    const savedExpiresAt = sessionStorage.getItem('mfa_expires_at');
    const savedRequiresTotp = sessionStorage.getItem('mfa_requires_totp');
    const savedRequiresMfaSetup = sessionStorage.getItem('mfa_requires_setup');
    if (savedChallengeId && savedExpiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(savedExpiresAt).getTime() - Date.now()) / 1000));
      if (remaining > 0) {
        setChallengeId(savedChallengeId);
        setExpiresAt(savedExpiresAt);
        setIsOtpMode(true);
        if (savedRequiresMfaSetup === 'true') {
          setRequiresMfaSetup(true);
          setRequiresTotp(true);
          const secret = sessionStorage.getItem('mfa_setup_secret') || '';
          const qrCodeDataUrl = sessionStorage.getItem('mfa_setup_qr') || '';
          const otpauthUrl = sessionStorage.getItem('mfa_setup_otpauth') || '';
          setSetupData({ secret, qrCodeDataUrl, otpauthUrl });
        } else if (savedRequiresTotp === 'true') {
          setRequiresTotp(true);
        } else {
          setRequiresTotp(false);
          const devHint = sessionStorage.getItem('mfa_otp_dev_hint');
          if (devHint) {
            setOtpValues(devHint.split(''));
          }
        }
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
      }
    }
  }, []);

  const handleDemoClick = (demo: typeof DEMO_ACCOUNTS[0]) => {
    onRoleChange(demo.role);
    setEmail(demo.email);
    setPassword('StacklyWFA2026!');
    setError('');
    setSuccessMsg(`Pre-filled credentials for ${demo.label} (${demo.name})`);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailDomain = email.trim().toLowerCase();
    if (!emailDomain.endsWith('@thestackly.com') && !emailDomain.endsWith('@company.com')) {
      setError('Only official @thestackly.com or @company.com email addresses are permitted.');
      return;
    }

    setIsLoading(true);
    try {
      const res = (await authService.login(email.trim(), password, mfaMethod)) as any;
      if (res.requiresMfa) {
        setChallengeId(res.challengeId);
        setExpiresAt(res.expiresAt);
        sessionStorage.setItem('mfa_challenge_id', res.challengeId);
        sessionStorage.setItem('mfa_expires_at', res.expiresAt);
        
        if (res.requiresMfaSetup) {
          setRequiresMfaSetup(true);
          setRequiresTotp(true);
          setSetupData({
            secret: res.secret,
            qrCodeDataUrl: res.qrCodeDataUrl,
            otpauthUrl: res.otpauthUrl
          });
          sessionStorage.setItem('mfa_requires_setup', 'true');
          sessionStorage.setItem('mfa_requires_totp', 'true');
          sessionStorage.setItem('mfa_setup_secret', res.secret);
          sessionStorage.setItem('mfa_setup_qr', res.qrCodeDataUrl);
          sessionStorage.setItem('mfa_setup_otpauth', res.otpauthUrl);
          setTotpCode('');
        } else if (res.requiresTotp) {
          setRequiresTotp(true);
          sessionStorage.setItem('mfa_requires_totp', 'true');
          setTotpCode('');
        } else {
          setRequiresTotp(false);
          sessionStorage.setItem('mfa_requires_totp', 'false');
          setOtpValues(['', '', '', '', '', '']);
          if (res.otpDevHint) {
            const otpStr = res.otpDevHint.toString();
            setOtpValues(otpStr.split(''));
            sessionStorage.setItem('mfa_otp_dev_hint', otpStr);
          }
        }
        setIsOtpMode(true);
        setSuccessMsg(res.requiresMfaSetup ? 'Authenticator setup required.' : res.requiresTotp ? 'Two-Factor verification required.' : 'MFA code generated. Enter the code to continue.');
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
        await login(email, password);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMfaAction = async (otpCode: string) => {
    if (!challengeId) {
      setError('MFA session expired or invalid. Please login again.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const verifyRes = await verifyMfa(challengeId, otpCode) as any;
      
      // If recovery codes are returned (first-time activation), intercept redirection
      if (verifyRes && verifyRes.recoveryCodes && verifyRes.recoveryCodes.length > 0) {
        setRecoveryCodes(verifyRes.recoveryCodes);
        setSuccessMsg('Two-Factor Authentication enabled successfully! Store your recovery codes safely.');
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      if (!requiresTotp) {
        setOtpValues(['', '', '', '', '', '']);
      } else {
        setTotpCode('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '');
    if (!digit && val !== '') return;
    const newOtp = [...otpValues];
    newOtp[index] = digit.substring(digit.length - 1);
    setOtpValues(newOtp);

    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    const codeStr = newOtp.join('');
    if (codeStr.length === 6 && !newOtp.includes('')) {
      verifyMfaAction(codeStr);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpValues(newOtp);
      verifyMfaAction(pastedData);
    } else {
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpValues(newOtp);
      const nextIdx = Math.min(pastedData.length, 5);
      otpRefs[nextIdx].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!challengeId) return;
    setIsLoading(true);
    try {
      const res = await resendMfa(challengeId, mfaMethod);
      setChallengeId(res.challengeId);
      setExpiresAt(res.expiresAt);
      setOtpValues(['', '', '', '', '', '']);
      if (res.otpDevHint) {
        setOtpValues(res.otpDevHint.toString().split(''));
      }
      setSuccessMsg('Verification code has been resent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-space-y-6">
      <AuthHeader
        title={isOtpMode ? 'MFA Verification' : 'Welcome Back'}
        subtitle={isOtpMode ? `Enter the 6-digit code sent to your ${mfaMethod === 'sms' ? 'SMS' : 'Email'}` : 'Sign in to access your dashboard'}
      />

      {error && (
        <div className="auth-alert-error">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="auth-alert-success">
          {successMsg}
        </div>
      )}

      {!isOtpMode ? (
        <form onSubmit={handleLoginSubmit} className="auth-space-y-4">
          <div className="auth-form-group">
            <label className="auth-label">
              Roles
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                const demo = DEMO_ACCOUNTS.find(d => d.role === e.target.value);
                if (demo) handleDemoClick(demo);
              }}
              className="auth-select"
            >
              {DEMO_ACCOUNTS.map((demo) => (
                <option key={demo.role} value={demo.role}>
                  {demo.name} — {demo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              Email / Employee ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@thestackly.com"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              MFA Delivery Channel
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <input
                  type="radio"
                  name="mfaMethod"
                  value="email"
                  checked={mfaMethod === 'email'}
                  onChange={() => setMfaMethod('email')}
                  style={{ accentColor: 'var(--role-primary)' }}
                />
                Email
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <input
                  type="radio"
                  name="mfaMethod"
                  value="sms"
                  checked={mfaMethod === 'sms'}
                  onChange={() => setMfaMethod('sms')}
                  style={{ accentColor: 'var(--role-primary)' }}
                />
                SMS
              </label>
            </div>
          </div>

          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-controls-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-checkbox"
              />
              Remember me
            </label>
            <a href="#forgot" className="auth-link">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      ) : recoveryCodes.length > 0 ? (
        <div className="auth-space-y-6">
          <div className="auth-alert-success" style={{ textAlign: 'center', fontWeight: 'bold' }}>
            🎉 Two-Factor Authentication (2FA) is now configured!
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: 'var(--role-primary)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>⚠️ IMPORTANT: Store these 10 one-time recovery codes safely!</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>If you lose access to your authenticator app, you can use these codes to log in. Each code can be used only once.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>
              {recoveryCodes.map((code, idx) => (
                <div key={idx} style={{ padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  {code}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => {
                const text = recoveryCodes.join('\n');
                navigator.clipboard.writeText(text);
                alert('Recovery codes copied to clipboard.');
              }}
              className="auth-btn-primary"
              style={{ background: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              Copy to Clipboard
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('mfa_challenge_id');
              sessionStorage.removeItem('mfa_expires_at');
              sessionStorage.removeItem('mfa_otp_dev_hint');
              sessionStorage.removeItem('mfa_requires_totp');
              sessionStorage.removeItem('mfa_requires_setup');
              sessionStorage.removeItem('mfa_setup_secret');
              sessionStorage.removeItem('mfa_setup_qr');
              sessionStorage.removeItem('mfa_setup_otpauth');
              onSuccess();
            }}
            className="auth-btn-primary"
            style={{ cursor: 'pointer' }}
          >
            Proceed to Dashboard
          </button>
        </div>
      ) : requiresMfaSetup ? (
        <form onSubmit={(e) => { e.preventDefault(); verifyMfaAction(totpCode); }} className="auth-space-y-6">
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 'bold', margin: 0, textAlign: 'center', color: 'var(--role-primary)' }}>⚠️ Scan this QR code with Microsoft Authenticator ONLY. (Google Authenticator is restricted by corporate policy.)</p>
            {setupData && (
              <>
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="Setup QR Code"
                  style={{ width: '9rem', height: '9rem', border: '1px solid var(--border-color)', padding: '0.25rem', borderRadius: '8px', background: 'white' }}
                />
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>Or enter the secret key manually:</p>
                  <code style={{ fontSize: '0.8125rem', fontWeight: 'bold', display: 'block', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', wordBreak: 'break-all', userSelect: 'all' }}>
                    {setupData.secret}
                  </code>
                </div>
              </>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="setupTotpCode" className="auth-label" style={{ marginBottom: '0.5rem', display: 'block', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
              Enter 6-Digit Authenticator Code
            </label>
            <input
              id="setupTotpCode"
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="auth-input"
              style={{ textAlign: 'center', letterSpacing: '0.1em', fontSize: '1.25rem', padding: '0.75rem' }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || totpCode.length !== 6}
            className="auth-btn-primary"
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Verifying...' : 'Confirm & Enable 2FA'}
          </button>

          <div className="auth-controls-row">
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Time remaining: {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Expired'}
            </span>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('mfa_challenge_id');
                sessionStorage.removeItem('mfa_expires_at');
                sessionStorage.removeItem('mfa_requires_totp');
                sessionStorage.removeItem('mfa_requires_setup');
                sessionStorage.removeItem('mfa_setup_secret');
                sessionStorage.removeItem('mfa_setup_qr');
                sessionStorage.removeItem('mfa_setup_otpauth');
                setIsOtpMode(false);
                setRequiresMfaSetup(false);
                setRequiresTotp(false);
                setError('');
              }}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verifyMfaAction(requiresTotp ? totpCode : otpValues.join('')); }} className="auth-space-y-6">
          {requiresTotp ? (
            <div className="auth-form-group">
              <label htmlFor="totpCode" className="auth-label" style={{ marginBottom: '0.5rem', display: 'block', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                Authenticator / Recovery Code
              </label>
              <input
                id="totpCode"
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.toUpperCase())}
                placeholder="6-digit code or recovery code"
                required
                className="auth-input"
                style={{ textAlign: 'center', letterSpacing: '0.1em', fontSize: '1.25rem', padding: '0.75rem', textTransform: 'uppercase' }}
                autoFocus
              />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  style={{ width: '3rem', height: '3rem' }}
                  className="auth-input"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (requiresTotp ? !totpCode : otpValues.includes(''))}
            className="auth-btn-primary"
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>

          {!requiresTotp && (
            <div className="auth-form-group" style={{ margin: '1rem 0' }}>
              <label className="auth-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resend via:
              </label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="radio"
                    name="mfaResendMethod"
                    value="email"
                    checked={mfaMethod === 'email'}
                    onChange={() => setMfaMethod('email')}
                    style={{ accentColor: 'var(--role-primary)' }}
                  />
                  Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="radio"
                    name="mfaResendMethod"
                    value="sms"
                    checked={mfaMethod === 'sms'}
                    onChange={() => setMfaMethod('sms')}
                    style={{ accentColor: 'var(--role-primary)' }}
                  />
                  SMS
                </label>
              </div>
            </div>
          )}

          <div className="auth-controls-row">
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Time remaining: {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Expired'}
            </span>
            {!requiresTotp ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || timer > 30}
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Resend Code
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('mfa_challenge_id');
                  sessionStorage.removeItem('mfa_expires_at');
                  sessionStorage.removeItem('mfa_requires_totp');
                  setIsOtpMode(false);
                  setRequiresTotp(false);
                  setError('');
                }}
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Back to Login
              </button>
            )}
          </div>
        </form>
      )}

      <AuthFooter />
    </div>
  );
};

export default LoginForm;
