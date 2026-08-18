import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are no records matching your current filter parameters.',
  onRetry,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
        {icon || <Inbox size={24} />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw size={14} /> Retry Query
        </button>
      )}
    </div>
  );
};

export default EmptyState;
