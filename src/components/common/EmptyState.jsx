import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionText = null,
  onAction = null,
  actionIcon = null,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-neutral-200 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
