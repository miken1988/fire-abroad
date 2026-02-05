'use client';

import { countries } from '@/data/countries';
import { costOfLiving, getCostOfLivingComparison, getAdjustedSpending } from '@/data/costOfLiving';
import { formatCurrency } from '@/lib/formatters';
import { convertCurrency } from '@/lib/currency';

interface CostOfLivingCardProps {
  fromCountry: string;
  toCountry: string;
  annualSpending: number;
  spendingCurrency: string;
}

export function CostOfLivingCard({ 
  fromCountry, 
  toCountry, 
  annualSpending,
  spendingCurrency 
}: CostOfLivingCardProps) {
  if (fromCountry === toCountry) return null;
  
  const from = countries[fromCountry];
  const to = countries[toCountry];
  const comparison = getCostOfLivingComparison(fromCountry, toCountry);
  const fromCOL = costOfLiving[fromCountry];
  const toCOL = costOfLiving[toCountry];
  
  if (!from || !to || !fromCOL || !toCOL) return null;
  
  // Calculate equivalent spending in destination
  const adjustedSpending = getAdjustedSpending(annualSpending, fromCountry, toCountry);
  const adjustedInLocalCurrency = convertCurrency(adjustedSpending, spendingCurrency, to.currency);
  
  const categories = [
    { key: 'rent', label: 'Housing', icon: '🏠' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'restaurants', label: 'Dining Out', icon: '🍽️' },
    { key: 'transportation', label: 'Transport', icon: '🚗' },
    { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  ] as const;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        💰 Cost of Living Comparison
      </h3>
      
      {/* Main comparison */}
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Your {formatCurrency(annualSpending, spendingCurrency)}/yr in {from.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl dark:text-gray-300">→</span>
          <div>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(adjustedInLocalCurrency, to.currency)}/yr
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              equivalent in {to.name}
            </span>
          </div>
        </div>
        <p className={`text-sm mt-2 ${comparison.cheaper ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {comparison.cheaper ? '✓' : '⚠️'} {to.name} is {Math.abs(comparison.percentageDiff).toFixed(0)}% 
          {comparison.cheaper ? ' cheaper' : ' more expensive'} overall
        </p>
      </div>
      
      {/* Category breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">By Category (vs {from.name})</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map(({ key, label, icon }) => {
            const fromVal = fromCOL[key];
            const toVal = toCOL[key];
            const diff = fromVal > 0 ? ((toVal - fromVal) / fromVal) * 100 : 0;
            const isCheaper = toVal < fromVal;
            const isFree = toVal === 0;
            
            return (
              <div 
                key={key} 
                className={`rounded-lg p-2 text-center ${
                  isFree 
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                    : isCheaper 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50' 
                      : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50'
                }`}
              >
                <div className="text-base">{icon}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{label}</div>
                <div className={`text-xs font-semibold ${
                  isFree 
                    ? 'text-green-700 dark:text-green-400' 
                    : isCheaper 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isFree ? 'Free/Public' : `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
        Based on cost of living indices. Your actual costs may vary based on lifestyle.
      </p>
    </div>
  );
}
