'use client';

export function ResultsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-slate-700/50 rounded mt-2" />
      </div>

      {/* Winner banner skeleton */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-800/50 border-2 border-gray-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-56 bg-gray-100 dark:bg-slate-700/50 rounded" />
          </div>
        </div>
      </div>

      {/* Country cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl p-4 border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700/50 rounded mb-1" />
              <div className="h-8 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700/50 rounded mb-1" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
            <div>
              <div className="h-3 w-20 bg-gray-100 dark:bg-slate-700/50 rounded mb-1" />
              <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-3 bg-gray-50 dark:bg-slate-800/50">
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-48 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative">
          <div className="absolute inset-x-16 bottom-6 top-4">
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-blue-100/40 to-transparent dark:from-blue-900/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
