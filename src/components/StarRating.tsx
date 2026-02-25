'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wtf_star_rating';
const CALC_COUNT_KEY = 'wtf_calc_count';

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag(...args);
  }
}

export function StarRating() {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Don't show if already rated or dismissed
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return;

    // Increment calc count
    const count = parseInt(localStorage.getItem(CALC_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(CALC_COUNT_KEY, String(count));

    // Show after 2nd calculation
    if (count >= 1) {
      const timer = setTimeout(() => {
        setVisible(true);
        // Trigger entrance animation after mount
        requestAnimationFrame(() => setMounted(true));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRate = (stars: number) => {
    setRating(stars);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, String(stars));

    // Track in GA4
    gtag('event', 'star_rating', {
      event_category: 'engagement',
      event_label: 'calculator_rating',
      value: stars,
    });

    // Auto-dismiss after thank you
    setTimeout(() => {
      setMounted(false);
      setTimeout(() => setDismissed(true), 400);
    }, 2200);
  };

  const handleDismiss = () => {
    setMounted(false);
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setTimeout(() => setDismissed(true), 400);
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border
        bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/50
        dark:from-slate-800/60 dark:to-indigo-900/20 dark:border-indigo-500/20
        backdrop-blur-sm
        px-4 py-3.5 sm:py-3
        transition-all duration-500 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
      `}
    >
      {/* Dismiss X — big touch target */}
      {!submitted && (
        <button
          onClick={handleDismiss}
          className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 -m-1 touch-manipulation"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      )}

      {!submitted ? (
        <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:gap-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            How useful was this? ⭐
          </span>
          <div className="flex gap-2 sm:gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="touch-manipulation p-1.5 sm:p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  className={`sm:w-7 sm:h-7 transition-all duration-200 ${
                    star <= (hoveredStar || rating)
                      ? 'fill-amber-400 stroke-amber-500 drop-shadow-[0_1px_3px_rgba(251,191,36,0.5)]'
                      : 'fill-gray-200/80 stroke-gray-300 dark:fill-slate-600/80 dark:stroke-slate-500'
                  }`}
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center">
          <span className="text-base">🎉</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Thanks for the feedback!
          </span>
          <div className="flex gap-0.5 ml-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                className={
                  star <= rating
                    ? 'fill-amber-400 stroke-amber-500'
                    : 'fill-gray-200 stroke-gray-300 dark:fill-slate-600 dark:stroke-slate-500'
                }
                strokeWidth="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
