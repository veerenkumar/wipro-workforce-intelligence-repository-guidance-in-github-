import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Computing workforce intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between text-sm mb-6">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Notice:</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};
