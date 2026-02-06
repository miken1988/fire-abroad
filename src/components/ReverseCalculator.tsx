'use client';

import { useState, useMemo } from 'react';
import { calculateSustainableSpending, ReverseCalculationResult } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency } from '@/lib/formatters';

interface ReverseCalculatorProps {
  portfolioValue: number;
  portfolioCurrency: string;
  country1Code: string;
  country2Code: string;
  currentSpending?: number;
  safeWithdrawalRate: number;
  usState?: string;
}

export function ReverseCalculator({
  portfolioValue,
  portfolioCurrency,
  country1Code,
  country2Code,
  currentSpending,
  safeWithdrawalRate,
  usState
}: ReverseCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const country1 = countries[country1Code];
  const country2 = countries[country2Code];
  const isSameCountry = country1Code === country2Code;
  
  const result1 = useMemo(() => {
    try {
      return calculateSustainableSpending(
        portfolioValue,
        portfolioCurrency,
        country1Code,
        safeWithdrawalRate,
        currentSpending,
        country1Code === 'US' ? usState : undefined
      );
    } catch {
      return null;
    }
  }, [portfolioValue, portfolioCurrency, country1Code, safeWithdrawalRate, currentSpending, usState]);
  
  const result2 = useMemo(() => {
    if (isSameCountry) return null;
    try {
      return calculateSustainableSpending(
        portfolioValue,
        portfolioCurrency,
        country2Code,
        safeWithdrawalRate,
        currentSpending,
        country2Code === 'US' ? usState : undefined
      );
    } catch {
      return null;
    }
  }, [portfolioValue, portfolioCurrency, country2Code, safeWithdrawalRate, currentSpending, isSameCountry, usState]);

  const getLuxuryEmoji = (level: string) => {
    switch (level) {
      case 'lean': return '🥗';
      case 'moderate': return '🍝';
      case 'comfortable': return '🥩';
      case 'fat': return '🦞';
      default: return '💰';
    }
  };

  const getLuxuryLabel = (level: string) => {
    switch (level) {
      case 'lean': return 'Lean FIRE';
      case 'moderate': return 'Moderate FIRE';
      case 'comfortable': return 'Comfortable';
      case 'fat': return 'Fat FIRE';
      default: return level;
    }
  };

  if (!result1) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              If You Retired Today
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              With your current {formatCurrency(portfolioValue, portfolioCurrency)} portfolio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(result1.sustainableSpendingNet, result1.currency)}/yr
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              {getLuxuryEmoji(result1.luxuryLevel)} {getLuxuryLabel(result1.luxuryLevel)}
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4">
          {/* Country comparison */}
          <div className={`grid ${isSameCountry ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            <SpendingCard 
              result={result1} 
              country={country1}
              getLuxuryEmoji={getLuxuryEmoji}
              getLuxuryLabel={getLuxuryLabel}
            />
            {result2 && (
              <SpendingCard 
                result={result2} 
                country={country2}
                getLuxuryEmoji={getLuxuryEmoji}
                getLuxuryLabel={getLuxuryLabel}
              />
            )}
          </div>
          
          {/* Comparison to current spending */}
          {result1.comparison && (
            <div className={`text-xs sm:text-sm p-2 rounded-lg ${
              result1.comparison.canAffordMore 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            }`}>
              {result1.comparison.canAffordMore ? '✓' : '⚠️'} 
              {' '}Your current spending is {Math.abs(result1.comparison.vsCurrentSpending).toFixed(0)}% 
              {result1.comparison.vsCurrentSpending >= 0 ? ' below' : ' above'} your sustainable spending in {country1?.name}
            </div>
          )}
          
          {/* Explanation */}
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            💡 Based on {(safeWithdrawalRate * 100).toFixed(0)}% safe withdrawal rate. 
            Sustainable spending = what you can withdraw indefinitely without depleting your portfolio.
          </p>
        </div>
      )}
    </div>
  );
}

function SpendingCard({ 
  result, 
  country,
  getLuxuryEmoji,
  getLuxuryLabel
}: { 
  result: ReverseCalculationResult;
  country: typeof countries[string];
  getLuxuryEmoji: (level: string) => string;
  getLuxuryLabel: (level: string) => string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <span>{country?.flag}</span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{country?.name}</span>
      </div>
      
      <div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(result.sustainableSpendingNet, result.currency)}<span className="text-xs font-normal text-gray-500">/yr</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatCurrency(result.monthlyNet, result.currency)}/month
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">{getLuxuryEmoji(result.luxuryLevel)}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">{getLuxuryLabel(result.luxuryLevel)}</span>
      </div>
      
      <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-slate-700">
        Gross: {formatCurrency(result.sustainableSpendingGross, result.currency)} • 
        Tax: {(result.effectiveTaxRate * 100).toFixed(1)}%
      </div>
    </div>
  );
}
