'use client';

import { useState, useMemo } from 'react';
import { YearlyProjection } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, formatCompact } from '@/lib/formatters';

interface JourneyTimelineProps {
  projections1: YearlyProjection[];
  projections2?: YearlyProjection[];
  country1Code: string;
  country2Code?: string;
  retirementAge: number;
  expectedReturn?: number;
  inflationRate?: number;
}

export function JourneyTimeline({ 
  projections1, 
  projections2, 
  country1Code, 
  country2Code,
  retirementAge,
  expectedReturn = 0.07,
  inflationRate = 0.03
}: JourneyTimelineProps) {
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  
  const country1 = countries[country1Code];
  const country2 = country2Code ? countries[country2Code] : null;
  const isComparison = !!projections2 && !!country2;

  // Calculate chart bounds
  const allValues = [...projections1.map(p => p.portfolioEnd), ...(projections2?.map(p => p.portfolioEnd) || [])];
  const maxValue = Math.max(...allValues) * 1.1;
  const minAge = projections1[0]?.age || 35;
  const maxAge = projections1[projections1.length - 1]?.age || 90;

  // Find key milestones - use liquidEnd for depletion (property is illiquid)
  const peak1Age = projections1.reduce((max, p) => p.portfolioEnd > max.portfolioEnd ? p : max, projections1[0])?.age;
  const depleted1 = projections1.find(p => p.liquidEnd <= 0);
  const peak2Age = projections2?.reduce((max, p) => p.portfolioEnd > max.portfolioEnd ? p : max, projections2[0])?.age;
  const depleted2 = projections2?.find(p => p.liquidEnd <= 0);

  const getDataAtAge = (age: number) => {
    const p1 = projections1.find(p => p.age === age);
    const p2 = projections2?.find(p => p.age === age);
    return { p1, p2 };
  };

  const displayAge = hoveredAge || minAge;
  const displayData = getDataAtAge(displayAge);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your FIRE Journey</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hover over the chart to explore</p>
        </div>
        
        <div className="flex items-start gap-4 text-right">
          <div className="min-h-[52px]">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{country1.flag} {country1.name}</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCompact(displayData.p1?.portfolioEnd || 0, country1.currency)}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 h-4">
              {displayData.p1?.isRetired ? `-${formatCompact(displayData.p1.withdrawal, country1.currency)}/yr` : ''}
            </div>
          </div>
          {isComparison && displayData.p2 && (
            <div className="min-h-[52px]">
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{country2?.flag} {country2?.name}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCompact(displayData.p2?.portfolioEnd || 0, country2?.currency || 'USD')}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 h-4">
                {displayData.p2?.isRetired ? `-${formatCompact(displayData.p2.withdrawal, country2?.currency || 'USD')}/yr` : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Age indicator */}
      <div className="text-center">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          displayData.p1?.isRetired 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          Age {displayAge}
          <span className="text-xs font-normal opacity-75">
            {displayData.p1?.isRetired ? '(Retired)' : '(Working)'}
          </span>
        </span>
      </div>

      {/* Desktop Chart */}
      <div className="hidden sm:block">
        <div 
          className="relative h-48 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          onMouseLeave={() => setHoveredAge(null)}
        >
          {/* Background phases */}
          <div className="absolute inset-0 flex">
            <div 
              className="bg-blue-50/50 dark:bg-blue-900/20 border-r border-blue-200/50 dark:border-blue-700/50"
              style={{ width: `${((retirementAge - minAge) / (maxAge - minAge)) * 100}%` }}
            />
            <div className="flex-1 bg-green-50/30 dark:bg-green-900/10" />
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-2 top-2 bottom-6 w-14 flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500 z-10">
            <span>{formatCompact(maxValue, country1.currency)}</span>
            <span>{formatCompact(maxValue / 2, country1.currency)}</span>
            <span>0</span>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-16 right-4 top-2 bottom-6">
            {/* Retirement line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-green-500/60 z-10"
              style={{ left: `${((retirementAge - minAge) / (maxAge - minAge)) * 100}%` }}
            >
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-b font-medium">
                Retire {retirementAge}
              </div>
            </div>

            {/* Depletion markers */}
            {depleted1 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-400/60 z-10"
                style={{ left: `${((depleted1.age - minAge) / (maxAge - minAge)) * 100}%` }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap">
                  {country1.flag} {depleted1.age}
                </div>
              </div>
            )}
            {depleted2 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400/60 z-10"
                style={{ left: `${((depleted2.age - minAge) / (maxAge - minAge)) * 100}%` }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap">
                  {country2?.flag} {depleted2.age}
                </div>
              </div>
            )}

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {projections2 && (
                <>
                  <path d={generateAreaPath(projections2, maxValue, minAge, maxAge)} fill="url(#gradient2)" />
                  <path d={generateLinePath(projections2, maxValue, minAge, maxAge)} fill="none" stroke="#10b981" strokeWidth="0.8" vectorEffect="non-scaling-stroke" style={{ strokeWidth: '2px' }} />
                </>
              )}

              <path d={generateAreaPath(projections1, maxValue, minAge, maxAge)} fill="url(#gradient1)" />
              <path d={generateLinePath(projections1, maxValue, minAge, maxAge)} fill="none" stroke="#3b82f6" strokeWidth="0.8" vectorEffect="non-scaling-stroke" style={{ strokeWidth: '2px' }} />
            </svg>

            {/* Hover zones */}
            <div className="absolute inset-0 flex z-20">
              {projections1.map((proj) => (
                <div
                  key={proj.age}
                  className="flex-1 cursor-crosshair hover:bg-blue-500/5"
                  onMouseEnter={() => setHoveredAge(proj.age)}
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
      </div>

      {/* Mobile: Milestone Cards */}
      <div className="sm:hidden">
        <MilestoneCards 
          projections1={projections1}
          projections2={projections2}
          country1={country1}
          country2={country2}
          retirementAge={retirementAge}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-300">{country1.flag} {country1.name}</span>
        </span>
        {isComparison && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-300">{country2?.flag} {country2?.name}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-green-500" />
          <span className="text-gray-600 dark:text-gray-300">Retirement</span>
        </span>
        {(depleted1 || depleted2) && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500" />
            <span className="text-gray-600 dark:text-gray-300">Depletion</span>
          </span>
        )}
      </div>

      {/* Projection Note */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
        💡 Projection assumes {(() => {
          // Calculate actual blended return from projections
          const firstProj = projections1[0];
          const actualReturn = firstProj && firstProj.portfolioStart > 0 
            ? firstProj.growth / firstProj.portfolioStart 
            : expectedReturn;
          const realReturn = actualReturn - inflationRate;
          return `${(realReturn * 100).toFixed(0)}% real return (${(actualReturn * 100).toFixed(0)}% blended growth − ${(inflationRate * 100).toFixed(0)}% inflation)`;
        })()}. 
        Actual results will vary with market conditions.
      </p>
    </div>
  );
}

function MilestoneCards({ projections1, projections2, country1, country2, retirementAge }: { 
  projections1: YearlyProjection[];
  projections2?: YearlyProjection[];
  country1: typeof countries[string];
  country2?: typeof countries[string] | null;
  retirementAge: number;
}) {
  const [selectedCountry, setSelectedCountry] = useState<1 | 2>(1);
  
  const projections = selectedCountry === 1 ? projections1 : (projections2 || projections1);
  const country = selectedCountry === 1 ? country1 : (country2 || country1);

  const keyAges = [
    projections[0]?.age,
    retirementAge,
    retirementAge + 10,
    retirementAge + 20,
    80,
  ].filter((age, i, arr) => age && arr.indexOf(age) === i && age <= 90);

  const peak = projections.reduce((max, p) => p.portfolioEnd > max.portfolioEnd ? p : max, projections[0]);
  const depleted = projections.find(p => p.liquidEnd <= 0);

  return (
    <div className="space-y-3">
      {projections2 && country2 && (
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
          <button
            onClick={() => setSelectedCountry(1)}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
              selectedCountry === 1 
                ? 'bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {country1.flag} {country1.name}
          </button>
          <button
            onClick={() => setSelectedCountry(2)}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
              selectedCountry === 2 
                ? 'bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {country2.flag} {country2.name}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {keyAges.map(age => {
          const proj = projections.find(p => p.age === age);
          if (!proj) return null;

          const isPeak = proj.age === peak.age;
          const isDepleted = depleted && proj.age >= depleted.age;
          const isRetirementStart = proj.age === retirementAge;
          const isLow = proj.liquidEnd < peak.portfolioEnd * 0.25 && proj.liquidEnd > 0;
          const hasProperty = proj.illiquidEnd > 0;

          let bgColor = 'bg-white dark:bg-slate-800';
          let borderColor = 'border-gray-200 dark:border-slate-700';
          let icon = '📅';

          if (isDepleted) {
            bgColor = 'bg-red-50 dark:bg-red-900/20';
            borderColor = 'border-red-200 dark:border-red-800';
            icon = '🚨';
          } else if (isLow) {
            bgColor = 'bg-amber-50 dark:bg-amber-900/20';
            borderColor = 'border-amber-200 dark:border-amber-800';
            icon = '⚠️';
          } else if (isRetirementStart) {
            bgColor = 'bg-green-50 dark:bg-green-900/20';
            borderColor = 'border-green-200 dark:border-green-800';
            icon = '🎉';
          } else if (isPeak) {
            bgColor = 'bg-blue-50 dark:bg-blue-900/20';
            borderColor = 'border-blue-200 dark:border-blue-800';
            icon = '📈';
          }

          return (
            <div key={age} className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Age {age}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isRetirementStart && 'Retirement begins'}
                      {isPeak && !isRetirementStart && 'Portfolio peak'}
                      {isDepleted && (hasProperty ? 'Liquid assets depleted' : 'Portfolio depleted')}
                      {isLow && !isDepleted && 'Low liquid balance'}
                      {!isRetirementStart && !isPeak && !isDepleted && !isLow && (proj.isRetired ? 'Retired' : 'Working')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${isDepleted ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatCompact(Math.max(0, proj.portfolioEnd), country.currency)}
                  </div>
                  {hasProperty && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      {formatCompact(proj.liquidEnd, country.currency)} liquid • {formatCompact(proj.illiquidEnd, country.currency)} property
                    </div>
                  )}
                  {proj.isRetired && proj.withdrawal > 0 && !isDepleted && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      -{formatCompact(proj.withdrawal, country.currency)}/yr
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {depleted && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <span className="text-lg">🚨</span>
              <div>
                <div className="font-medium">Portfolio runs out at age {depleted.age}</div>
                <div className="text-xs">Consider increasing savings or reducing spending</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generateLinePath(projections: YearlyProjection[], maxValue: number, minAge: number, maxAge: number): string {
  if (projections.length === 0) return '';
  return projections.map((proj, i) => {
    const x = ((proj.age - minAge) / (maxAge - minAge)) * 100;
    const y = Math.min(100, Math.max(0, (1 - proj.portfolioEnd / maxValue) * 100));
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

function generateAreaPath(projections: YearlyProjection[], maxValue: number, minAge: number, maxAge: number): string {
  if (projections.length === 0) return '';
  const linePath = projections.map((proj, i) => {
    const x = ((proj.age - minAge) / (maxAge - minAge)) * 100;
    const y = Math.min(100, Math.max(0, (1 - proj.portfolioEnd / maxValue) * 100));
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const lastX = ((projections[projections.length - 1].age - minAge) / (maxAge - minAge)) * 100;
  const firstX = ((projections[0].age - minAge) / (maxAge - minAge)) * 100;
  return `${linePath} L ${lastX} 100 L ${firstX} 100 Z`;
}
