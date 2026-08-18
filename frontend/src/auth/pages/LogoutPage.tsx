import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, CheckCircle2, ShieldCheck, LogIn } from 'lucide-react';
import { StacklyLogo } from '../../components/common/StacklyLogo';

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* CENTERED LOGOUT CARD */}
      <div className="w-full max-w-[420px] mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl dark:shadow-2xl shadow-slate-900/10 relative z-10 text-center">
        
        {/* Brand Header */}
        <div className="flex justify-center pb-1">
          <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 shadow-sm">
            <StacklyLogo size={42} showText={true} />
          </div>
        </div>

        {/* Icon Badge */}
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mx-auto shadow-md">
          <LogOut size={30} />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Logged Out Safely</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
            Your active session at <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">@thestackly.com</span> has been securely terminated and access tokens cleared.
          </p>
        </div>

        {/* Redirecting Badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 py-3 px-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle2 size={16} />
          <span>Redirecting to Sign In...</span>
        </div>

        {/* Manual Redirect Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2">
          <Link
            to="/login"
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 no-underline active:scale-[0.99]"
          >
            <LogIn size={15} />
            <span>Sign In Again</span>
          </Link>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 font-mono pt-1">
            <ShieldCheck size={12} className="text-emerald-500" /> 256-Bit SSL Encrypted Session Terminated
          </div>
        </div>

      </div>
    </div>
  );
};
