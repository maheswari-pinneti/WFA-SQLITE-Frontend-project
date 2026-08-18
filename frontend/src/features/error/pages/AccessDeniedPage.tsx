import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { ROLE_LABELS } from '../../../security/roles/roles';
import { StacklyLogo } from '../../../components/common/StacklyLogo';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn font-sans" style={{ minHeight: '80vh' }}>
      <div className="glass-panel p-8 md:p-12 max-w-lg w-full space-y-6 relative overflow-hidden shadow-2xl border-rose-500/30">
        {/* Top Logo */}
        <div className="flex justify-center">
          <StacklyLogo size={40} showText={true} />
        </div>

        {/* 403 Large Badge */}
        <div className="relative my-4">
          <span className="text-8xl font-black tracking-tighter text-rose-500/20 select-none">
            403
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/30 shadow-lg">
              <ShieldAlert size={36} />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Access Forbidden</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your active role <span className="font-bold text-rose-400">({user?.role || ROLE_LABELS[role]})</span> does not hold permission to view or execute this resource.
          </p>
        </div>

        {/* Security Scope Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-mono font-bold border border-rose-500/20">
          <Lock size={14} /> Security Policy Boundary Active
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
