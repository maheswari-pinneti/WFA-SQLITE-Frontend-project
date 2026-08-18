import React from 'react';
import { Search, X } from 'lucide-react';

export interface AdvancedFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  onClear?: () => void;
  children?: React.ReactNode;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Filter records...',
  onClear,
  children,
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="relative flex-1 flex items-center">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: '2.25rem' }}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {searchQuery && onClear && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
