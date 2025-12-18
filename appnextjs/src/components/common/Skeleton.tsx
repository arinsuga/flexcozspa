'use client';

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 h-10 w-full mb-1" />
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex px-6 py-4 gap-4">
              {[...Array(cols)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
