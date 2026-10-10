import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-neutral-200 border-t-[#D71920] animate-spin mb-3`}
      />
      {message && <p className="text-sm font-medium text-neutral-600">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
