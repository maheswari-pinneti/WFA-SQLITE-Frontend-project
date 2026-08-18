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
    <div className="space-y-6">
      <AuthHeader
        title={isOtpMode ? 'MFA Verification' : 'Welcome Back'}
        subtitle={isOtpMode ? 'Enter the 6-digit code sent to your device' : 'Sign in to access your dashboard'}
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-pulse">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {!isOtpMode ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Email / Employee ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@thestackly.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
            />
          </div>

          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[var(--border-color)] text-[var(--role-primary)] focus:ring-[var(--role-primary)]/20"
              />
              Remember me
            </label>
            <a href="#forgot" className="font-semibold text-[var(--role-primary)] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-bold bg-[var(--role-primary)] text-white hover:bg-[var(--role-primary)]/90 active:scale-[0.98] transition disabled:opacity-50 select-none shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verifyMfaAction(otpValues.join('')); }} className="space-y-6">
          <div className="flex justify-between gap-2">
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
                className="w-12 h-12 rounded-xl text-center font-bold text-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpValues.includes('')}
            className="w-full py-2.5 rounded-xl font-bold bg-[var(--role-primary)] text-white hover:bg-[var(--role-primary)]/90 active:scale-[0.98] transition disabled:opacity-50 select-none shadow-md"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-medium">
              Time remaining: {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Expired'}
            </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || timer > 30}
              className="font-semibold text-[var(--role-primary)] hover:underline focus:outline-none disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}

      {/* Demo Credentials Quick Picker */}
      {!isOtpMode && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Quick demo account access:
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemoClick(demo)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition"
              >
                {demo.label} ({demo.name})
              </button>
            ))}
          </div>
        </div>
      )}

      <AuthFooter />
    </div>
  );
};

export default LoginForm;
