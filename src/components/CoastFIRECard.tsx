'use client';

import { useState } from 'react';
import { FIREResult, UserInputs } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import { countries } from '@/data/countries';
import * as analytics from '@/lib/analytics';

interface CoastFIREProps {
  result: FIREResult;
  inputs: UserInputs;
  countryCode: string;
  label?: string;
}

function calculateCoastFIRE(
  currentAge: number,
  portfolioValue: number,
  fireNumber: number,
  expectedReturn: number,
  inflationRate: number,
  targetAge: number,
): { coastNumber: number; yearsToCoast: number; alreadyCoast: boolean; coastAge: number } {
  // CoastFIRE = amount needed now so that compound growth alone reaches FIRE number by targetAge
  const realReturn = expectedReturn - inflationRate;
  const yearsToTarget = targetAge - currentAge;
  
  if (yearsToTarget <= 0 || realReturn <= 0) {
    return { coastNumber: fireNumber, yearsToCoast: 0, alreadyCoast: portfolioValue >= fireNumber, coastAge: currentAge };
  }
  
  // coastNumber = fireNumber / (1 + realReturn)^years
  const coastNumber = fireNumber / Math.pow(1 + realReturn, yearsToTarget);
  const alreadyCoast = portfolioValue >= coastNumber;
  
  // If already coast, when did they reach it? (or how many more years of saving to reach coast)
  let coastAge = currentAge;
  if (!alreadyCoast) {
    // Years needed saving at current rate to reach coastNumber
    // This is approximate - just show the coast number deficit
    coastAge = currentAge; // They haven't reached it yet
  }
  
  return { coastNumber, yearsToCoast: yearsToTarget, alreadyCoast, coastAge };
}

export function CoastFIRECard({ result, inputs, countryCode, label }: CoastFIREProps) {
  const [isOpen, setIsOpen] = useState(false);
  const country = countries[countryCode];
  if (!country) return null;
  
  const currency = inputs.portfolioCurrency;
  
  // Calculate for traditional retirement age (65) and their target age
  const coast65 = calculateCoastFIRE(
    inputs.currentAge,
    result.liquidPortfolioValue,
    result.fireNumber,
    inputs.expectedReturn,
    inputs.inflationRate,
    65
  );
  
  const coastTarget = calculateCoastFIRE(
    inputs.currentAge,
    result.liquidPortfolioValue,
    result.fireNumber,
    inputs.expectedReturn,
    inputs.inflationRate,
    inputs.targetRetirementAge
  );
  
  // Don't show if they're already fully FI
  if (result.liquidPortfolioValue >= result.fireNumber) return null;
  
  // Don't show if coast number is meaningless (older than target)
  if (inputs.currentAge >= 65) return null;

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) analytics.trackSectionToggle('coast_fire', true);
  };

  const deficit = coastTarget.coastNumber - result.liquidPortfolioValue;
  const deficit65 = coast65.coastNumber - result.liquidPortfolioValue;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">⛵</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
              CoastFIRE {label ? `— ${label}` : ''}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {coast65.alreadyCoast 
                ? 'You could stop saving and still retire by 65'
                : `${formatCurrency(deficit65 > 0 ? deficit65 : 0, currency)} more to reach CoastFIRE for age 65`
              }
            </p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 pt-3">
            <strong className="text-gray-900 dark:text-white">CoastFIRE</strong> is the point where your 
            existing investments, through compound growth alone, will reach your FIRE number by a target age — 
            even if you never save another dollar.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CoastFIRE for target age */}
            <div className={`rounded-lg p-4 border ${
              coastTarget.alreadyCoast 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
            }`}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Coast to age {inputs.targetRetirementAge}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(coastTarget.coastNumber, currency)}
              </div>
              {coastTarget.alreadyCoast ? (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  ✓ Reached — growth alone covers your FIRE number
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(deficit > 0 ? deficit : 0, currency)} remaining
                </div>
              )}
            </div>
            
            {/* CoastFIRE for 65 */}
            <div className={`rounded-lg p-4 border ${
              coast65.alreadyCoast 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
            }`}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Coast to age 65
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(coast65.coastNumber, currency)}
              </div>
              {coast65.alreadyCoast ? (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  ✓ Reached — you could stop saving entirely
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(deficit65 > 0 ? deficit65 : 0, currency)} remaining
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 pt-1">
            Based on {((inputs.expectedReturn - inputs.inflationRate) * 100).toFixed(1)}% real return 
            ({(inputs.expectedReturn * 100).toFixed(0)}% nominal − {(inputs.inflationRate * 100).toFixed(0)}% inflation). 
            FIRE number: {formatCurrency(result.fireNumber, currency)} in {country.name}.
          </div>
        </div>
      )}
    </div>
  );
}
