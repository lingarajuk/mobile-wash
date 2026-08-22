import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-800/80 animate-pulse rounded-xl ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center mt-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);
