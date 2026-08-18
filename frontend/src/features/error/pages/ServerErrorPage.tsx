import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { StacklyLogo } from '../../../components/common/StacklyLogo';

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn font-sans" style={{ minHeight: '80vh' }}>
      <div className="glass-panel p-8 md:p-12 max-w-lg w-full space-y-6 relative overflow-hidden shadow-2xl border-amber-500/30">
        {/* Top Logo */}
        <div className="flex justify-center">
          <StacklyLogo size={40} showText={true} />
        </div>

        {/* 500 Large Badge */}
        <div className="relative my-4">
          <span className="text-8xl font-black tracking-tighter text-amber-500/20 select-none">
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-lg">
              <ServerCrash size={36} />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">System Exceptional Event</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            An unexpected server runtime error occurred while processing your request. Our automated observability monitor has dispatched an alert to IT Infrastructure.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Reload Page
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
