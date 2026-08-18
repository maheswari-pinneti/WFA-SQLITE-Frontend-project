import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StacklyLogo } from '../../components/common/StacklyLogo';
import {
  Mail,
  User,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [roleType, setRoleType] = useState('EMPLOYEE');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.toLowerCase().endsWith('@thestackly.com')) {
      setError('Only official @thestackly.com corporate email addresses are permitted.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      login(email);
      navigate('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* CENTERED SIGN UP CARD */}
      <div className="w-full max-w-[440px] mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-9 rounded-3xl shadow-xl dark:shadow-2xl shadow-slate-900/10 relative z-10">
        
        {/* Header & Logo */}
        <div className="space-y-3 text-center flex flex-col items-center">
          <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 shadow-sm">
            <StacklyLogo size={42} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Register your corporate profile to access Workforce Analytics.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-medium">Account created successfully! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Corporate Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Corporate Email</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.connor@thestackly.com"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Department Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Department</label>
            <div className="relative flex items-center">
              <Building2 size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner cursor-pointer"
              >
                <option value="Engineering">Engineering & Development</option>
                <option value="Human Resources">Human Resources & People</option>
                <option value="Product Operations">Product & Design Operations</option>
                <option value="Sales & Marketing">Enterprise Sales & Growth</option>
                <option value="Finance & Legal">Finance & Corporate Legal</option>
              </select>
            </div>
          </div>

          {/* Role Scope Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Assigned Role Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoleType('EMPLOYEE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  roleType === 'EMPLOYEE'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Employee
              </button>

              <button
                type="button"
                onClick={() => setRoleType('MANAGER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  roleType === 'MANAGER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Dept Manager
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
              I agree to the <span className="text-blue-600 dark:text-blue-400 font-bold underline">Enterprise Security Policy</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!agreeTerms}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-0 cursor-pointer active:scale-[0.99]"
          >
            <span>Register Enterprise Account</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-3 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1">
              <LogIn size={13} /> Sign In
            </Link>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 font-mono">
            <ShieldCheck size={12} className="text-emerald-500" /> 256-Bit Encrypted Registration Protocol
          </div>
        </div>

      </div>
    </div>
  );
};
