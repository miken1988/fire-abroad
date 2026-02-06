'use client';

import { useState, ReactNode, useCallback } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return (
    <span 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
    >
      {children}
      <span className="ml-1 text-gray-400 cursor-help text-sm">ⓘ</span>
      {isVisible && (
        <>
          {/* Backdrop for mobile - tap to close */}
          <div 
            className="fixed inset-0 z-40 sm:hidden" 
            onClick={() => setIsVisible(false)}
            onTouchStart={() => setIsVisible(false)}
          />
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-lg">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
            {/* Close hint on mobile */}
            <div className="text-gray-400 text-[10px] mt-2 sm:hidden text-center">
              Tap anywhere to close
            </div>
          </div>
        </>
      )}
    </span>
  );
}

interface InfoIconProps {
  content: ReactNode;
}

export function InfoIcon({ content }: InfoIconProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return (
    <span 
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
    >
      <span className="text-gray-400 cursor-help text-sm hover:text-gray-600 dark:hover:text-gray-300">ⓘ</span>
      {isVisible && (
        <>
          {/* Backdrop for mobile - tap to close */}
          <div 
            className="fixed inset-0 z-40 sm:hidden" 
            onClick={() => setIsVisible(false)}
            onTouchStart={() => setIsVisible(false)}
          />
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-gray-900 dark:bg-slate-700 text-white text-xs sm:text-sm rounded-lg shadow-lg max-w-[calc(100vw-2rem)]">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-slate-700" />
            {/* Close hint on mobile */}
            <div className="text-gray-400 text-[10px] mt-2 sm:hidden text-center">
              Tap anywhere to close
            </div>
          </div>
        </>
      )}
    </span>
  );
}
