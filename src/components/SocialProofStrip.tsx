'use client';

import { useState, useEffect } from 'react';

export function SocialProofStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        flex flex-wrap items-center justify-center gap-3 sm:gap-5
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Star rating pill */}
      <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-full px-3.5 py-1.5 shadow-sm">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className={
                star <= 4
                  ? 'fill-amber-400 stroke-amber-500'
                  : 'fill-amber-400/40 stroke-amber-400/60'
              }
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">4.5/5</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">rating</span>
      </div>

      {/* Calculations pill */}
      <div className="inline-flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-full px-3.5 py-1.5 shadow-sm">
        <span className="text-sm">🔥</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">37,000+</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">calculations run</span>
      </div>

      {/* Countries pill */}
      <div className="inline-flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-full px-3.5 py-1.5 shadow-sm">
        <span className="text-sm">🌍</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">24</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">countries</span>
      </div>
    </div>
  );
}
