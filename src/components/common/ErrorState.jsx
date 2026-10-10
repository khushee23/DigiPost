import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching information from the server.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-red-200 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4 border border-red-100">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
};
