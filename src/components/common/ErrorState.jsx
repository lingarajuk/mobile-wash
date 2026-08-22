import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something Went Wrong',
  description = 'We encountered an error processing your request. Please try again.',
  onRetry,
  onHome,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center glass-card border-rose-500/20 rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="primary" icon={RefreshCw}>
            Try Again
          </Button>
        )}
        {onHome && (
          <Button onClick={onHome} variant="secondary">
            Back to Home
          </Button>
        )}
      </div>
    </div>
  );
};
