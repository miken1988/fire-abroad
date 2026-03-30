'use client';

import { useState } from 'react';
import { FIREResult, UserInputs, MultiCountryResult } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, smartCurrency } from '@/lib/formatters';
import { CostOfLivingCard } from './CostOfLivingCard';
import { MonteCarloCard } from './MonteCarloCard';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import { JourneyTimeline } from './JourneyTimeline';

interface MultiResultsPanelProps {
  multiResult: MultiCountryResult;
  currentCountryCode: string;
  inputs: UserInputs;
}

type SortKey = 'fireAge' | 'fireNumber' | 'taxRate';

export function MultiResultsPanel({ multiResult, currentCountryCode, inputs }: MultiResultsPanelProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(multiResult.rankings.overall);
  const [sortKey, setSortKey] = useState<SortKey>('fireAge');
  const [showDetails, setShowDetails] = useState(true);

  const winner = multiResult.rankings.overall;
  const winnerCountry = countries[winner];

  const sorted = [...multiResult.targets].sort((a, b) => {
    if (sortKey === 'fireAge') return a.result.fireAge - b.result.fireAge;
    if (sortKey === 'fireNumber') return a.result.fireNumberUSD - b.result.fireNumberUSD;
    return a.result.effectiveTaxRate - b.result.effectiveTaxRate;
  });

  const selectedTarget = multiResult.targets.find(t => t.countryCode === selectedCountry);
  const currentCountryData = countries[currentCountryCode];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Winner Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">{winnerCountry?.flag}</span>
          <div>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium uppercase tracking-wide">Best for FIRE</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{winnerCountry?.name}</p>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
              Retire at age {multiResult.targets.find(t => t.countryCode === winner)?.result.fireAge || '?'}
            </p>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Country Rankings</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click a row to see detailed analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">Country</th>
                <th
                  className="px-4 py-2 text-right font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setSortKey('fireAge')}
                >
                  FIRE Age {sortKey === 'fireAge' && <span className="text-blue-500">v</span>}
                </th>
                <th
                  className="px-4 py-2 text-right font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setSortKey('fireNumber')}
                >
                  FIRE Number {sortKey === 'fireNumber' && <span className="text-blue-500">v</span>}
                </th>
                <th
                  className="px-4 py-2 text-right font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setSortKey('taxRate')}
                >
                  Tax Rate {sortKey === 'taxRate' && <span className="text-blue-500">v</span>}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {sorted.map((target, i) => {
                const c = countries[target.countryCode];
                const isWinner = target.countryCode === winner;
                const isSelected = target.countryCode === selectedCountry;
                return (
                  <tr
                    key={target.countryCode}
                    onClick={() => setSelectedCountry(target.countryCode)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
                        : isWinner
                          ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {isWinner ? <span className="text-green-600 dark:text-green-400 font-bold">1</span> : i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {c?.flag} {c?.name}
                      {isWinner && <span className="ml-2 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">BEST</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {target.result.canRetire ? target.result.fireAge : '--'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      ${Math.round(target.result.fireNumberUSD).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {(target.result.effectiveTaxRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Current Country Reference */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>For reference: {currentCountryData?.flag} {currentCountryData?.name} (current)</span>
            <span>
              Age {multiResult.current.fireAge} | ${Math.round(multiResult.current.fireNumberUSD).toLocaleString()} | {(multiResult.current.effectiveTaxRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Selected Country Detail */}
      {selectedTarget && (
        <div className="space-y-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <span>{countries[selectedCountry]?.flag} {countries[selectedCountry]?.name} Detail</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">FIRE Number</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(selectedTarget.result.fireNumber, countries[selectedCountry]?.currency || 'USD')}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">FIRE Age</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                    {selectedTarget.result.canRetire ? selectedTarget.result.fireAge : 'Not achievable'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tax Rate</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                    {(selectedTarget.result.effectiveTaxRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Annual Spend</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(selectedTarget.result.annualWithdrawalNet, countries[selectedCountry]?.currency || 'USD')}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {selectedTarget.result.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  {selectedTarget.result.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                  ))}
                </div>
              )}

              {/* Journey Timeline */}
              <JourneyTimeline
                projections1={multiResult.current.projections}
                projections2={selectedTarget.result.projections}
                country1Code={currentCountryCode}
                country2Code={selectedCountry}
                retirementAge={inputs.targetRetirementAge}
                expectedReturn={inputs.expectedReturn}
                inflationRate={inputs.inflationRate}
              />

              {/* COL Comparison */}
              {currentCountryCode !== selectedCountry && (
                <CostOfLivingCard
                  fromCountry={currentCountryCode}
                  toCountry={selectedCountry}
                  annualSpending={inputs.annualSpending}
                  spendingCurrency={inputs.spendingCurrency}
                />
              )}

              {/* Monte Carlo */}
              <MonteCarloCard
                inputs={inputs}
                fireResult={selectedTarget.result}
                countryCode={selectedCountry}
              />

              {/* Tax Breakdown */}
              <TaxBreakdownCard
                grossIncome={selectedTarget.result.annualWithdrawalGross}
                countryCode={selectedCountry}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
