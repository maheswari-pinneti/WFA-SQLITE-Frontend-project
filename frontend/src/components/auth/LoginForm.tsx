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
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (savedChallengeId && savedExpiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(savedExpiresAt).getTime() - Date.now()) / 1000));
      if (remaining > 0) {
        setChallengeId(savedChallengeId);
        setExpiresAt(savedExpiresAt);
        setIsOtpMode(true);
        const devHint = sessionStorage.getItem('mfa_otp_dev_hint');
        if (devHint) {
          setOtpValues(devHint.split(''));
        }
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
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
      const res = (await authService.login(email.trim(), password)) as any;
      if (res.requiresMfa) {
        setChallengeId(res.challengeId);
        setExpiresAt(res.expiresAt);
        sessionStorage.setItem('mfa_challenge_id', res.challengeId);
        sessionStorage.setItem('mfa_expires_at', res.expiresAt);
        setOtpValues(['', '', '', '', '', '']);
        if (res.otpDevHint) {
          const otpStr = res.otpDevHint.toString();
          setOtpValues(otpStr.split(''));
          sessionStorage.setItem('mfa_otp_dev_hint', otpStr);
        }
        setIsOtpMode(true);
        setSuccessMsg('MFA code generated. Enter the code to continue.');
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
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
      await verifyMfa(challengeId, otpCode);
      sessionStorage.removeItem('mfa_challenge_id');
      sessionStorage.removeItem('mfa_expires_at');
      sessionStorage.removeItem('mfa_otp_dev_hint');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setOtpValues(['', '', '', '', '', '']);
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
      const res = await resendMfa(challengeId);
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
        subtitle={isOtpMode ? 'Enter the 6-digit code sent to your device' : 'Sign in to access your dashboard'}
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
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verifyMfaAction(otpValues.join('')); }} className="auth-space-y-6">
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

          <button
            type="submit"
            disabled={isLoading || otpValues.includes('')}
            className="auth-btn-primary"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div className="auth-controls-row">
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Time remaining: {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Expired'}
            </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || timer > 30}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Resend Code
            </button>
          </div>
        </form>
      )}

      <AuthFooter />
    </div>
  );
};

export default LoginForm;
