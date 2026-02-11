'use client';

import { useState, useMemo } from 'react';
import { calculateTaxBreakdown, TaxBreakdown } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, formatPercent, smartCurrency } from '@/lib/formatters';
import { trackTaxBreakdownView, trackSectionToggle } from '@/lib/analytics';

interface TaxBreakdownCardProps {
  grossIncome: number;
  countryCode: string;
  incomeType?: 'withdrawal' | 'capitalGains' | 'mixed';
  userCurrency?: string;
}

export function TaxBreakdownCard({ 
  grossIncome, 
  countryCode,
  incomeType = 'mixed',
  userCurrency = 'USD'
}: TaxBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Smart format for extreme currencies
  const fmt = (amount: number, currency: string) => {
    const s = smartCurrency(amount, currency, userCurrency);
    return formatCurrency(s.amount, s.currency);
  };
  
  const country = countries[countryCode];
  
  const breakdown = useMemo(() => {
    try {
      return calculateTaxBreakdown(grossIncome, countryCode, incomeType);
    } catch {
      return null;
    }
  }, [grossIncome, countryCode, incomeType]);
  
  if (!breakdown || grossIncome <= 0) return null;
  
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
      <button
        onClick={() => {
          const newState = !isExpanded;
          setIsExpanded(newState);
          if (newState) {
            trackSectionToggle('tax_breakdown', 'expand');
            trackTaxBreakdownView(countryCode, breakdown.effectiveRate);
          }
        }}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Tax Breakdown
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {country?.flag} {country?.name} • {formatPercent(breakdown.effectiveRate)} effective rate on withdrawals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {fmt(breakdown.totalTax, breakdown.currency)}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              total tax
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
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-slate-700 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Gross</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {fmt(breakdown.grossIncome, breakdown.currency)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
              <div className="text-xs text-red-600 dark:text-red-400">Tax</div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                -{fmt(breakdown.totalTax, breakdown.currency)}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
              <div className="text-xs text-green-600 dark:text-green-400">Net</div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                {fmt(breakdown.netIncome, breakdown.currency)}
              </div>
            </div>
          </div>
          
          {/* Tax Components */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Tax Components</h4>
            
            {breakdown.incomeTax > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {incomeType === 'mixed' ? 'Income Tax (pension portion)' : 'Income Tax'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fmt(breakdown.incomeTax, breakdown.currency)} ({formatPercent(breakdown.incomeTaxRate)})
                </span>
              </div>
            )}
            
            {breakdown.capitalGainsTax > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {incomeType === 'mixed' ? 'Capital Gains (investment portion)' : 'Capital Gains Tax'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fmt(breakdown.capitalGainsTax, breakdown.currency)} ({formatPercent(breakdown.capitalGainsRate)})
                </span>
              </div>
            )}
            
            {breakdown.socialTaxes > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">Social Taxes</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fmt(breakdown.socialTaxes, breakdown.currency)} ({formatPercent(breakdown.socialTaxRate)})
                </span>
              </div>
            )}
          </div>
          
          {/* Bracket Breakdown */}
          {breakdown.brackets.length > 0 && breakdown.incomeTax > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {incomeType === 'mixed' ? 'Income Tax Brackets (pension portion)' : 'Income Tax Brackets'}
              </h4>
              <div className="space-y-1">
                {breakdown.brackets.map((b, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs py-1">
                      <span className="text-gray-500 dark:text-gray-400">{b.bracket}</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatPercent(b.rate)} → {fmt(b.taxPaid, breakdown.currency)}
                      </span>
                    </div>
                    {/* Progress bar showing how much of this bracket is used */}
                    <div className="h-1 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                        style={{ width: `${Math.min(100, (b.taxableAmount / breakdown.grossIncome) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-slate-600">
            💡 This is a simplified estimate. Actual taxes depend on income sources, deductions, 
            tax treaties, and individual circumstances. Consult a tax professional.
          </div>
        </div>
      )}
    </div>
  );
}
