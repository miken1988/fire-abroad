'use client';

import React, { useState } from 'react';
import { MonteCarloResult, runMonteCarloSimulation } from '@/lib/monteCarlo';
import { UserInputs, FIREResult } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCompact, formatPercent } from '@/lib/formatters';

interface MonteCarloCardProps {
  inputs: UserInputs;
  fireResult: FIREResult;
  countryCode: string;
}

export function MonteCarloCard({ inputs, fireResult, countryCode }: MonteCarloCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  const country = countries[countryCode];
  const currency = country?.currency || 'USD';

  // Only run simulation on client to avoid hydration mismatch
  // (random numbers differ between server and client)
  React.useEffect(() => {
    setIsClient(true);
    try {
      const simResult = runMonteCarloSimulation(inputs, fireResult);
      setResult(simResult);
    } catch (e) {
      console.error('Monte Carlo error:', e);
      setResult(null);
    }
  }, [inputs, fireResult]);

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="w-full p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎲</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Monte Carlo Analysis
                    <span className="text-gray-500 dark:text-gray-400 font-normal"> • {country?.flag} {country?.name}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Running simulations...</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-400">—%</div>
                <div className="text-xs font-medium text-gray-400">Loading</div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gray-300 dark:bg-slate-600 animate-pulse" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const successPct = Math.round(result.successRate * 100);
  const ratingColor = getSuccessColor(successPct);
  const ratingLabel = getSuccessLabel(successPct);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎲</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Monte Carlo Analysis
                  <span className="text-gray-500 dark:text-gray-400 font-normal"> • {country?.flag} {country?.name}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">1,000 simulations with market volatility</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${ratingColor}`}>{successPct}%</div>
              <div className={`text-xs font-medium ${ratingColor}`}>{ratingLabel}</div>
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
        </div>

        {/* Mini success bar - always visible */}
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getSuccessBgColor(successPct)}`}
              style={{ width: `${successPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            <span>0%</span>
            <span>Chance your money lasts 50 years</span>
            <span>100%</span>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-slate-700 p-3 sm:p-4 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Median balance at 85"
              value={formatCompact(result.medianPath[Math.min(result.ages.indexOf(85), result.medianPath.length - 1)] || result.medianEndingBalance, currency)}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatBox
              label="Worst 10% scenario"
              value={formatCompact(result.p10Path[result.p10Path.length - 1], currency)}
              color={result.p10Path[result.p10Path.length - 1] > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}
            />
            <StatBox
              label={result.averageFailureAge ? 'Avg failure age' : 'Best 90% scenario'}
              value={result.averageFailureAge ? `Age ${Math.round(result.averageFailureAge)}` : formatCompact(result.p90Path[result.p90Path.length - 1], currency)}
              color={result.averageFailureAge ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
            />
          </div>

          {/* Confidence band chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Portfolio Projections</h4>
              {hoveredYear !== null && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Age {result.ages[hoveredYear]} • Median: {formatCompact(result.medianPath[hoveredYear], currency)}
                </span>
              )}
            </div>
            
            <ConfidenceBandChart
              result={result}
              currency={currency}
              retirementAge={inputs.targetRetirementAge}
              onHover={setHoveredYear}
            />

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-6 h-2 rounded-sm bg-blue-500" /> Median
              </span>
              <span className="flex items-center gap-1">
                <span className="w-6 h-2 rounded-sm bg-blue-300/50 dark:bg-blue-400/30" /> 25th–75th
              </span>
              <span className="flex items-center gap-1">
                <span className="w-6 h-2 rounded-sm bg-blue-200/30 dark:bg-blue-500/20" /> 10th–90th
              </span>
            </div>
          </div>

          {/* Interpretation */}
          <div className={`rounded-lg p-3 text-xs ${getInterpretationBg(successPct)}`}>
            <p className="font-medium mb-1">{getInterpretation(successPct, result, inputs)}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Based on 1,000 randomized simulations using historical market volatility 
              (~17.5% annual std dev for stocks). Each simulation generates different sequences 
              of returns to test your plan against real-world uncertainty.
            </p>
          </div>
          
          {/* Sequence of Returns Risk Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-base">📉</span>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Why Monte Carlo Matters: Sequence of Returns Risk
                </p>
                <p className="text-blue-700 dark:text-blue-400">
                  Two retirees with identical portfolios and spending can have wildly different outcomes 
                  based on <em>when</em> market drops occur. A crash early in retirement (when you're 
                  withdrawing) is far more damaging than one later. This simulation tests your plan 
                  against thousands of different market sequences—not just the average return.
                </p>
                <p className="text-blue-600 dark:text-blue-500 mt-2">
                  💡 <strong>Rule of thumb:</strong> Aim for 80%+ success rate. Below 75% suggests 
                  your plan is too aggressive. Above 95% means you could potentially spend more.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ConfidenceBandChart({ 
  result, 
  currency,
  retirementAge,
  onHover
}: { 
  result: MonteCarloResult; 
  currency: string;
  retirementAge: number;
  onHover: (year: number | null) => void;
}) {
  const years = result.ages.length;
  const minAge = result.ages[0];
  const maxAge = result.ages[years - 1];
  
  // Find max value across all paths for scaling
  const maxValue = Math.max(...result.p90Path) * 1.1;
  
  const toX = (i: number) => (i / (years - 1)) * 100;
  const toY = (val: number) => Math.max(0, Math.min(100, (1 - val / maxValue) * 100));

  // Generate SVG paths for bands
  const p10p90Area = generateBandPath(result.p10Path, result.p90Path, years, maxValue);
  const p25p75Area = generateBandPath(result.p25Path, result.p75Path, years, maxValue);
  const medianLine = result.medianPath
    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(val)}`)
    .join(' ');

  // Zero line
  const zeroY = toY(0);

  return (
    <div 
      className="relative h-40 sm:h-48 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
      onMouseLeave={() => onHover(null)}
    >
      {/* Y-axis labels */}
      <div className="absolute left-2 top-2 bottom-6 w-14 flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500 z-10">
        <span>{formatCompact(maxValue, currency)}</span>
        <span>{formatCompact(maxValue / 2, currency)}</span>
        <span>0</span>
      </div>

      {/* Chart area */}
      <div className="absolute left-16 right-4 top-2 bottom-6">
        {/* Retirement line */}
        {retirementAge > minAge && retirementAge < maxAge && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-green-500/40 z-10"
            style={{ left: `${((retirementAge - minAge) / (maxAge - minAge)) * 100}%` }}
          >
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-b font-medium">
              Retire
            </div>
          </div>
        )}

        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="mc-band-outer" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="mc-band-inner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* 10th-90th percentile band */}
          <path d={p10p90Area} fill="url(#mc-band-outer)" />

          {/* 25th-75th percentile band */}
          <path d={p25p75Area} fill="url(#mc-band-inner)" />

          {/* Median line */}
          <path
            d={medianLine}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: '2.5px' }}
          />

          {/* Zero line */}
          <line
            x1="0" y1={zeroY} x2="100" y2={zeroY}
            stroke="#e5e7eb"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: '1px' }}
            className="dark:stroke-slate-600"
          />
        </svg>

        {/* Hover zones */}
        <div className="absolute inset-0 flex z-20">
          {result.ages.map((age, i) => (
            <div
              key={age}
              className="flex-1 hover:bg-blue-500/5 cursor-crosshair"
              onMouseEnter={() => onHover(i)}
            />
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="absolute left-16 right-4 bottom-0 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
        <span>{minAge}</span>
        <span>{Math.round((minAge + maxAge) / 2)}</span>
        <span>{maxAge}</span>
      </div>
    </div>
  );
}

function generateBandPath(lower: number[], upper: number[], years: number, maxValue: number): string {
  const toX = (i: number) => (i / (years - 1)) * 100;
  const toY = (val: number) => Math.max(0, Math.min(100, (1 - val / maxValue) * 100));

  // Upper path (left to right)
  const upperPath = upper.map((val, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(val)}`).join(' ');
  
  // Lower path (right to left)
  const lowerPath = [...lower].reverse().map((val, i) => {
    const origIndex = lower.length - 1 - i;
    return `L ${toX(origIndex)} ${toY(val)}`;
  }).join(' ');

  return `${upperPath} ${lowerPath} Z`;
}

function getSuccessColor(pct: number): string {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 75) return 'text-green-600 dark:text-green-400';
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getSuccessBgColor(pct: number): string {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getInterpretationBg(pct: number): string {
  if (pct >= 90) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300';
  if (pct >= 75) return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
  if (pct >= 50) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
  return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
}

function getSuccessLabel(pct: number): string {
  if (pct >= 95) return 'Excellent';
  if (pct >= 85) return 'Very Good';
  if (pct >= 75) return 'Good';
  if (pct >= 60) return 'Fair';
  if (pct >= 40) return 'Risky';
  return 'High Risk';
}

function getInterpretation(pct: number, result: MonteCarloResult, inputs: UserInputs): string {
  if (pct >= 95) {
    return `Your plan is very robust. In 95%+ of simulated market scenarios, your portfolio lasts well beyond age ${inputs.currentAge + 50}.`;
  }
  if (pct >= 85) {
    return `Strong plan. Your money lasts in most market scenarios, though the worst 10% of outcomes could see your portfolio dip to ${formatCompact(result.p10Path[result.p10Path.length - 1], 'USD')} by the end.`;
  }
  if (pct >= 75) {
    return `Reasonable plan, but there's some risk. Consider either reducing spending slightly or building a larger buffer before retiring.`;
  }
  if (pct >= 50) {
    return `Your plan works in about half of scenarios. Consider reducing annual spending, working a few more years, or increasing your savings rate to improve your odds.`;
  }
  return `Your plan has significant risk. In many market scenarios, your portfolio runs out${result.averageFailureAge ? ` around age ${Math.round(result.averageFailureAge)}` : ''}. Consider major adjustments to spending or timeline.`;
}
