import React from 'react';

export const SkeletonLoader = ({ type = 'table', count = 5 }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-24 h-4 bg-neutral-200 rounded" />
              <div className="w-8 h-8 bg-neutral-200 rounded-lg" />
            </div>
            <div className="w-16 h-7 bg-neutral-300 rounded mb-2" />
            <div className="w-32 h-3 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200 animate-pulse">
            <div className="w-1/3 h-5 bg-neutral-300 rounded mb-4" />
            <div className="space-y-2.5 mb-4">
              <div className="w-full h-3.5 bg-neutral-200 rounded" />
              <div className="w-4/5 h-3.5 bg-neutral-200 rounded" />
            </div>
            <div className="w-1/4 h-6 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Default table skeleton
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-neutral-100 border-b border-neutral-200" />
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="w-28 h-4 bg-neutral-200 rounded" />
            <div className="w-36 h-4 bg-neutral-200 rounded" />
            <div className="w-20 h-4 bg-neutral-200 rounded" />
            <div className="w-16 h-6 bg-neutral-200 rounded-full" />
            <div className="w-12 h-6 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
