import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'blue',
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  children,
}) => {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case 'emerald':
        return 'badge-success';
      case 'amber':
        return 'badge-warning';
      case 'rose':
        return 'badge-danger';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      default:
        return 'badge-primary';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col justify-center space-y-4 animate-pulse py-8">
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-32 bg-slate-800/50 rounded w-full"></div>
          <div className="h-3 bg-slate-800 rounded w-2/3"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center py-10 space-y-3">
          <div className="text-rose-400 text-sm font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 max-w-md">
            {error}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-secondary btn-sm px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Retry Loading
            </button>
          )}
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
          <svg className="w-12 h-12 text-slate-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-bold text-slate-300">No Analytics Data Available</p>
          <p className="text-xs text-slate-500">There is no matching information in the database.</p>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="glass-panel p-6 min-h-[360px] flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {badgeText && <span className={`badge text-xs ${getBadgeClass()}`}>{badgeText}</span>}
      </div>

      <div className="w-full flex-1 flex flex-col justify-center">{renderContent()}</div>
    </div>
  );
};
