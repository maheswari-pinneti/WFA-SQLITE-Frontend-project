import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

interface AnalyticsChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  minHeight?: number;
  children: React.ReactNode;
}

export const AnalyticsChartContainer: React.FC<AnalyticsChartContainerProps> = ({
  title,
  subtitle,
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  minHeight = 360,
  children
}) => {
  return (
    <section
      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl font-sans text-[var(--text-primary)] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-blue-500/40"
      style={{ minHeight }}
      aria-busy={isLoading}
    >
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold tracking-tight text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center min-h-[260px] w-full">
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading analysis data...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Failed to load chart</span>
            <span className="text-[10px] text-slate-400 max-w-[200px]">{error}</span>
            {onRetry && (
              <button type="button" onClick={onRetry} className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-500">
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
            <Inbox className="h-8 w-8 text-slate-500" />
            <span className="text-xs font-bold text-slate-400">No data available</span>
            <span className="text-[10px] text-slate-500">There are no records matching current filters</span>
          </div>
        )}

        {!isLoading && !error && !isEmpty && (
          <div className="w-full h-full min-h-[260px]">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
