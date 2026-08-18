import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../security/roles/roles';
import { authService } from '../services/auth.service';
import { StacklyLogo } from '../../components/common/StacklyLogo';
import {
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  User,
  Hash,
  Briefcase,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';

const ROLE_DETAILS = {
  admin: {
    label: 'Admin Portal',
    email: 'admin@thestackly.com',
    roleName: 'Administrator',
    accessLevel: 'Super Admin (Full Access)',
    permissions: 'Read/Write All, Audit Logs, Security Policies',
    dashboard: 'Admin Control Center'
  },
  hr: {
    label: 'HR Manager',
    email: 'hr@thestackly.com',
    roleName: 'HR Manager',
    accessLevel: 'Department Admin',
    permissions: 'Employee Profiles, Leaves, Attendance Analytics',
    dashboard: 'HR Operations Center'
  },
  manager: {
    label: 'Team Manager',
    email: 'manager@thestackly.com',
    roleName: 'Department Manager',
    accessLevel: 'Team Scope (Read/Write)',
    permissions: 'Department Scoped Analytics, Approval Roster',
    dashboard: 'Manager Dashboard'
  },
  lead: {
    label: 'Team Lead',
    email: 'lead@thestackly.com',
    roleName: 'Team Lead',
    accessLevel: 'Team Scope (Read-Only)',
    permissions: 'Team Productivity Metrics, Attendance Logs',
    dashboard: 'Lead Dashboard'
  },
  employee: {
    label: 'Employee',
    email: 'employee@thestackly.com',
    roleName: 'Employee',
    accessLevel: 'Self Service',
    permissions: 'View Profile, Request Leaves, Attendance Logs',
    dashboard: 'Employee Dashboard'
  }
};

export const LoginPage: React.FC = () => {
  const { login, verifyMfa, resendMfa, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Active form tab: 'login' | 'otp' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'otp' | 'signup'>(() => {
    const savedTab = sessionStorage.getItem('login_active_tab');
    return (savedTab === 'otp' || savedTab === 'signup') ? savedTab : 'login';
  });
  
  // Selected role config
  const [selectedRole, setSelectedRole] = useState<'admin' | 'hr' | 'manager' | 'lead' | 'employee'>('admin');

  // Forms states
  const [email, setEmail] = useState('admin@thestackly.com');
  const [password, setPassword] = useState('StacklyWFA2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP inputs & session states
  const [otpValues, setOtpValues] = useState<string[]>(() => {
    const hint = sessionStorage.getItem('mfa_otp_dev_hint');
    return hint ? hint.split('') : ['', '', '', '', '', ''];
  });
  const [challengeId, setChallengeId] = useState<string | null>(() => sessionStorage.getItem('mfa_challenge_id'));
  const [expiresAt, setExpiresAt] = useState<string | null>(() => sessionStorage.getItem('mfa_expires_at'));
  const [timer, setTimer] = useState(0);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem('mfa_challenge_id');
      sessionStorage.removeItem('mfa_expires_at');
      sessionStorage.removeItem('mfa_otp_dev_hint');
      sessionStorage.removeItem('login_active_tab');
      const homePath = ROLE_HOME_PATHS[role] || '/admin/dashboard';
      navigate(homePath);
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (challengeId) {
      sessionStorage.setItem('mfa_challenge_id', challengeId);
    } else {
      sessionStorage.removeItem('mfa_challenge_id');
    }
  }, [challengeId]);

  useEffect(() => {
    sessionStorage.setItem('login_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (expiresAt) {
      sessionStorage.setItem('mfa_expires_at', expiresAt);
    } else {
      sessionStorage.removeItem('mfa_expires_at');
    }
  }, [expiresAt]);

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

  useEffect(() => {
    if (expiresAt && timer === 0) {
      setError('OTP expired. Please request a new OTP.');
      setOtpValues(['', '', '', '', '', '']);
    }
  }, [expiresAt, timer]);

  const handleRoleSelect = (roleKey: 'admin' | 'hr' | 'manager' | 'lead' | 'employee') => {
    setSelectedRole(roleKey);
    setEmail(ROLE_DETAILS[roleKey].email);
    setPassword('StacklyWFA2026!');
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '');
    if (!digit && value !== '') return;
    const newOtp = [...otpValues];
    newOtp[index] = digit.substring(digit.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-submit when exactly 6 digits entered
    const currentCode = [...newOtp];
    currentCode[index] = digit.substring(digit.length - 1);
    const codeStr = currentCode.join('');
    if (codeStr.length === 6 && !codeStr.includes('')) {
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
    const text = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      const newOtp = text.split('');
      setOtpValues(newOtp);
      otpRefs[5].current?.focus();
      verifyMfaAction(text);
    }
  };

  const handleResendOtp = async () => {
    if (!challengeId) {
      setError('MFA session expired or invalid. Please request a new code.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await resendMfa(challengeId);
      setChallengeId(res.challengeId);
      setExpiresAt(res.expiresAt);
      setOtpValues(['', '', '', '', '', '']);
      if (res.otpDevHint) {
        const otpStr = res.otpDevHint.toString();
        setOtpValues(otpStr.split(''));
        sessionStorage.setItem('mfa_otp_dev_hint', otpStr);
      } else {
        sessionStorage.removeItem('mfa_otp_dev_hint');
      }
      setSuccessMsg('MFA verification code has been resent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailDomain = email.trim().toLowerCase();
    if (!emailDomain.endsWith('@thestackly.com') && !emailDomain.endsWith('@company.com')) {
      setError('Only official @thestackly.com or @company.com company email addresses are permitted.');
      return;
    }

    setIsLoading(true);
    try {
      const res = (await authService.login(email.trim(), password)) as any;
      if (res.requiresMfa) {
        setChallengeId(res.challengeId);
        setExpiresAt(res.expiresAt);
        setOtpValues(['', '', '', '', '', '']);
        if (res.otpDevHint) {
          const otpStr = res.otpDevHint.toString();
          setOtpValues(otpStr.split(''));
          sessionStorage.setItem('mfa_otp_dev_hint', otpStr);
        } else {
          sessionStorage.removeItem('mfa_otp_dev_hint');
        }
        setActiveTab('otp');
        setSuccessMsg('OTP Code has been generated.');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMfaAction = async (otpCode: string) => {
    if (!challengeId) {
      setError('MFA session expired or invalid. Please request a new code.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await verifyMfa(challengeId, otpCode);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtpValues(['', '', '', '', '', '']);
      sessionStorage.removeItem('mfa_otp_dev_hint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    await verifyMfaAction(otpCode);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!agreeTerms) {
      setError('You must agree to the Terms & Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setSuccessMsg('Account request submitted successfully! Try logging in.');
      setIsLoading(false);
      setActiveTab('login');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans overflow-y-auto lg:overflow-hidden bg-[#050B18]">
      
      {/* LEFT SECTION: Branding & Product Info (Order-2 on mobile, Order-1 on desktop) */}
      <div className="order-2 lg:order-1 bg-[#050B18] p-8 md:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden min-h-[50vh] lg:min-h-screen border-t lg:border-t-0 lg:border-r border-slate-800/80">
        
        {/* Subtle Background glow */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8 relative z-10 my-auto">
          {/* Logo & Company Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <StacklyLogo size={36} showText={false} />
            </div>
            <span className="text-xl font-black tracking-widest text-white leading-none">STACKLY</span>
          </div>

          {/* Heading Description */}
          <div className="space-y-3">
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
              Workforce Analytics & Intelligence Platform
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg font-medium">
              Empowering organizations with AI-driven workforce intelligence, analytics, and employee insights.
            </p>
          </div>

          {/* Feature List Cards */}
          <div className="space-y-3.5 max-w-lg">
            {[
              { title: 'Workforce Analytics', desc: 'Real-time daily punch logs & office hours calculations' },
              { title: 'Role-Based Access', desc: 'Secure authorization structures for multiple org roles' },
              { title: 'Secure OTP Authentication', desc: 'Seamless single sign-on security via quick email OTP' },
              { title: 'Enterprise Dashboard', desc: 'Complete high-level department analytics feed' }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300">
                <span className="w-5.5 h-5.5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-blue-500/30">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{feat.title}</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono relative z-10">
          <span>Version 2.0</span>
          <span>© Stackly Technologies</span>
        </div>
      </div>

      {/* RIGHT SECTION: Centered Glassmorphism Authentication Panel (Order-1 on mobile, Order-2 on desktop) */}
      <div className="order-1 lg:order-2 bg-slate-50 dark:bg-[#0B1120] p-6 sm:p-12 lg:p-16 flex items-center justify-center min-h-[50vh] lg:min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
        
        {/* Glow behind login elements */}
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Glassmorphism Card */}
        <div className="w-full max-w-[440px] p-6 sm:p-8 rounded-[20px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10 space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sign in to continue to your workforce dashboard.</p>
          </div>

          {/* Form states alert messaging */}
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                <ShieldCheck size={14} className="shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: PASSWORD LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Role selection dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Role Selection</label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleSelect(e.target.value as any)}
                      className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="hr">HR Manager</option>
                      <option value="manager">Team Manager</option>
                      <option value="lead">Team Lead</option>
                      <option value="employee">Employee</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                  </div>
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-350">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@thestackly.com"
                      className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-350">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl pl-9 pr-10 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0 bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Reset: Verification code is always 849201.')}
                    className="text-blue-500 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#ffffff' }}
                    className="w-full py-3 rounded-xl hover:scale-[1.01] font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                    <ArrowRight size={14} />
                  </button>

                  {/* OR Divider */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                    <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                  </div>

                  {/* Secondary Login with OTP toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('otp');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-transparent border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Login with OTP
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: OTP LOGIN */}
            {activeTab === 'otp' && (
              <form onSubmit={handleOtpLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-350">Corporate Email</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@thestackly.com"
                        className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={timer > 0 || isLoading}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 border-none cursor-pointer"
                    >
                      {timer > 0 ? `Resend (${timer}s)` : 'Resend'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-350">6-Digit OTP Code</label>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">Resend OTP in 00:{timer.toString().padStart(2, '0')}</span>
                  </div>

                  <div className="flex justify-between gap-2 py-1">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        required
                        maxLength={1}
                        value={val}
                        disabled={timer === 0 || isLoading}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-12 rounded-xl text-center text-sm font-black font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner disabled:opacity-50"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timer > 0 || isLoading}
                    className="text-blue-500 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    Resend OTP code
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500 animate-pulse" /> Auto Verify Enabled
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || timer === 0}
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#ffffff' }}
                  className="w-full py-3 rounded-xl hover:scale-[1.01] font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? 'Verifying...' : 'Sign In with OTP'}
                  <ArrowRight size={14} />
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                  <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-transparent border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Password Login
                </button>
              </form>
            )}

            {/* TAB 3: SIGN UP */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Employee ID</label>
                    <div className="relative">
                      <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="EMP-1002"
                        className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <div className="relative">
                      <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Engineering"
                        className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Corporate Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@thestackly.com"
                      className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span>I agree to Terms & Privacy Policy</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#ffffff' }}
                  className="w-full py-2.5 rounded-xl hover:scale-[1.01] font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          {/* Bottom text */}
          {activeTab !== 'signup' ? (
            <div className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
              >
                Login
              </button>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
};
