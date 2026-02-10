'use client';

import { useState } from 'react';
import { FIREResult, ComparisonSummary } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { CostOfLivingCard } from './CostOfLivingCard';
import { VisaCard } from './VisaCard';
import { MonteCarloCard } from './MonteCarloCard';
import { ReverseCalculator } from './ReverseCalculator';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import { UserInputs } from '@/lib/calculations';
import HealthcareAffiliate from './HealthcareAffiliate';
import BankingAffiliate from './BankingAffiliate';
import NextStepsPanel from './NextStepsPanel';
import { JourneyTimeline } from './JourneyTimeline';
import { AnimatedNumber } from './AnimatedNumber';

interface ResultsPanelProps {
  result1: FIREResult;
  result2: FIREResult;
  comparison: ComparisonSummary;
  country1Code: string;
  country2Code: string;
  annualSpending?: number;
  spendingCurrency?: string;
  userAge?: number;
  inputs?: UserInputs;
  expectedReturn?: number;
  inflationRate?: number;
  simplifiedMode?: boolean;
}

export function ResultsPanel({ 
  result1, 
  result2, 
  comparison, 
  country1Code, 
  country2Code,
  annualSpending = 50000,
  spendingCurrency = 'USD',
  userAge = 35,
  inputs,
  expectedReturn,
  inflationRate,
  simplifiedMode = false
}: ResultsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTaxNotes, setShowTaxNotes] = useState(false);
  const country1 = countries[country1Code];
  const country2 = countries[country2Code];
  const isSameCountry = country1Code === country2Code;

  // Determine winner info for Summary
  const getWinnerInfo = () => {
    if (isSameCountry) return null;
    
    const targetAge = inputs?.targetRetirementAge || 50;
    const country1HitsTarget = result1.fireAge <= targetAge;
    const country2HitsTarget = result2.fireAge <= targetAge;
    const bothMissTarget = !country1HitsTarget && !country2HitsTarget;
    const yearsBehind1 = result1.fireAge - targetAge;
    const yearsBehind2 = result2.fireAge - targetAge;
    
    if (bothMissTarget) {
      const bestOption = result1.fireAge <= result2.fireAge ? country1Code : country2Code;
      const bestYearsBehind = Math.min(yearsBehind1, yearsBehind2);
      return {
        type: 'warning' as const,
        message: `Neither option hits your target age ${targetAge}. ${countries[bestOption]?.name} is closest (${bestYearsBehind} yr${bestYearsBehind > 1 ? 's' : ''} behind)`
      };
    }
    
    const yearsDiff = Math.abs(result1.yearsUntilFIRE - result2.yearsUntilFIRE);
    
    // If same timeline, winner is the one with lower FIRE number (in USD for fair comparison)
    const winner = result1.yearsUntilFIRE === result2.yearsUntilFIRE
      ? comparison.lowerFIRENumber
      : comparison.earlierRetirement;
    
    return {
      type: 'success' as const,
      winner: countries[winner]?.name,
      message: result1.yearsUntilFIRE === result2.yearsUntilFIRE 
        ? 'Same timeline, lower FIRE number'
        : `FIRE ${yearsDiff} year${yearsDiff === 1 ? '' : 's'} sooner`
    };
  };

  const winnerInfo = getWinnerInfo();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">FIRE Comparison</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="text-blue-600 dark:text-blue-400">{country1?.flag} {country1?.name}</span>
          {!isSameCountry && (
            <> vs <span className="text-emerald-600 dark:text-emerald-400">{country2?.flag} {country2?.name}</span></>
          )}
        </p>
      </div>

      {/* 🏆 SUMMARY - Now at the TOP */}
      {!isSameCountry && winnerInfo && (
        <div className={`rounded-xl p-4 animate-scale-in ${
          winnerInfo.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-500' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-400 dark:border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{winnerInfo.type === 'success' ? '🏆' : '⚠️'}</span>
            <div className="flex-1">
              <h3 className={`font-bold text-base sm:text-lg ${
                winnerInfo.type === 'success' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {winnerInfo.type === 'success' ? `${winnerInfo.winner} wins!` : 'Close call'}
              </h3>
              <p className={`text-sm mt-0.5 ${
                winnerInfo.type === 'success' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {winnerInfo.message}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                  <span className="text-gray-600 dark:text-gray-400 break-words">
                    FIRE # {formatCurrency(comparison.fireNumberDifferenceUSD, 'USD')} {comparison.lowerFIRENumber === country1Code ? 'lower in ' + country1?.name : 'lower in ' + country2?.name}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></span>
                  <span className="text-gray-600 dark:text-gray-400 break-words">
                    Tax {formatPercent(comparison.taxRateDifference)} {comparison.lowerEffectiveTaxRate === country1Code ? 'lower in ' + country1?.name : 'lower in ' + country2?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Country Cards - Stack on mobile, side-by-side on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <CountryCard 
          result={result1} 
          country={country1} 
          isLowerFIRE={comparison.lowerFIRENumber === country1Code}
          isLowerTax={comparison.lowerEffectiveTaxRate === country1Code}
          isSoonerRetirement={
            result1.yearsUntilFIRE === result2.yearsUntilFIRE
              ? comparison.lowerFIRENumber === country1Code
              : comparison.earlierRetirement === country1Code
          }
          otherCountryCode={country2Code}
          portfolioValue={inputs?.portfolioValue}
          portfolioCurrency={inputs?.portfolioCurrency}
          targetRetirementAge={inputs?.targetRetirementAge}
          currentAge={inputs?.currentAge}
          colorScheme="blue"
        />
        {!isSameCountry && (
          <CountryCard 
            result={result2} 
            country={country2}
            isLowerFIRE={comparison.lowerFIRENumber === country2Code}
            isLowerTax={comparison.lowerEffectiveTaxRate === country2Code}
            isSoonerRetirement={
              result1.yearsUntilFIRE === result2.yearsUntilFIRE
                ? comparison.lowerFIRENumber === country2Code
                : comparison.earlierRetirement === country2Code
            }
            otherCountryCode={country1Code}
            portfolioValue={inputs?.portfolioValue}
            portfolioCurrency={inputs?.portfolioCurrency}
            targetRetirementAge={inputs?.targetRetirementAge}
            currentAge={inputs?.currentAge}
            colorScheme="green"
            hideAffiliate={simplifiedMode}
          />
        )}
      </div>

      {/* 🔥 FIRE Journey Chart - Moved up for maximum visibility */}
      <JourneyTimeline
        projections1={result1.projections}
        projections2={isSameCountry ? undefined : result2.projections}
        country1Code={country1Code}
        country2Code={isSameCountry ? undefined : country2Code}
        retirementAge={inputs?.targetRetirementAge || 50}
        expectedReturn={expectedReturn}
        inflationRate={inflationRate}
      />

      {/* If You Retired Today */}
      {!simplifiedMode && inputs && (
        <ReverseCalculator
          portfolioValue={inputs.portfolioValue}
          portfolioCurrency={inputs.portfolioCurrency}
          country1Code={country1Code}
          country2Code={country2Code}
          currentSpending={inputs.annualSpending}
          safeWithdrawalRate={inputs.safeWithdrawalRate}
          usState={inputs.usState}
        />
      )}

      {/* Cost of Living Comparison */}
      {!isSameCountry && (
        <CostOfLivingCard
          fromCountry={country1Code}
          toCountry={country2Code}
          annualSpending={annualSpending}
          spendingCurrency={spendingCurrency}
        />
      )}

      {/* Banking/Money Transfer Affiliate */}
      {!simplifiedMode && !isSameCountry && country1?.currency !== country2?.currency && (
        <BankingAffiliate
          fromCurrency={country1?.currency || 'USD'}
          toCurrency={country2?.currency || 'EUR'}
          retireCountryName={country2?.name || 'abroad'}
        />
      )}

      {/* Tax Notes - Hidden in simplified, merged into Advanced in full mode */}
      {!simplifiedMode && <CollapsibleTaxNotes result1={result1} result2={result2} country1={country1} country2={country2} isSameCountry={isSameCountry} showTaxNotes={showTaxNotes} setShowTaxNotes={setShowTaxNotes} />}

      {/* Visa Requirements */}
      {!simplifiedMode && !isSameCountry && (
        <VisaCard
          countryCode={country2Code}
          userAge={userAge}
        />
      )}

      {/* Advanced Details - Collapsed by default, hidden in simplified */}
      {!simplifiedMode && inputs && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 flex items-center justify-between text-left bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Advanced Analysis</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monte Carlo simulations, tax breakdowns, and more</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvanced && (
            <div className="p-4 space-y-4 border-t border-gray-200 dark:border-slate-700">
              {/* Monte Carlo Analysis */}
              <div className="space-y-3">
                <MonteCarloCard
                  inputs={inputs}
                  fireResult={result1}
                  countryCode={country1Code}
                />
                {!isSameCountry && (
                  <MonteCarloCard
                    inputs={inputs}
                    fireResult={result2}
                    countryCode={country2Code}
                  />
                )}
              </div>

              {/* Tax Breakdown Details */}
              <div className="space-y-3">
                <TaxBreakdownCard
                  grossIncome={result1.annualWithdrawalGross}
                  countryCode={country1Code}
                  incomeType="mixed"
                />
                {!isSameCountry && (
                  <TaxBreakdownCard
                    grossIncome={result2.annualWithdrawalGross}
                    countryCode={country2Code}
                    incomeType="mixed"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings - always show, these are important */}
      <Warnings result1={result1} result2={result2} country1={country1} country2={country2} isSameCountry={isSameCountry} />

      {/* Plan Your Move - Affiliate Next Steps */}
      {!simplifiedMode && !isSameCountry && (
        <NextStepsPanel
          retireCountryName={country2?.name || 'abroad'}
          retireCountryCode={country2Code}
          fromCurrency={country1?.currency || 'USD'}
          toCurrency={country2?.currency || 'EUR'}
          showDifferentCurrencies={country1?.currency !== country2?.currency}
        />
      )}

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Want to explore other options?</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              🌍 Compare Another Country
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && navigator.share) {
                  navigator.share({ title: 'My FIRE Plan', url: window.location.href });
                } else if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              📤 Share Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountryCard({ 
  result, 
  country, 
  isLowerFIRE,
  isLowerTax,
  isSoonerRetirement,
  otherCountryCode,
  portfolioValue,
  portfolioCurrency,
  targetRetirementAge,
  currentAge,
  colorScheme = 'blue',
  hideAffiliate = false
}: { 
  result: FIREResult; 
  country: typeof countries[string];
  isLowerFIRE: boolean;
  isLowerTax: boolean;
  isSoonerRetirement: boolean;
  otherCountryCode: string;
  portfolioValue?: number;
  portfolioCurrency?: string;
  targetRetirementAge?: number;
  currentAge?: number;
  colorScheme?: 'blue' | 'green';
  hideAffiliate?: boolean;
}) {
  const canFIRE = result.canRetire;
  
  // Check if already financially independent using LIQUID assets only
  // (Property is illiquid - can't withdraw from it annually)
  const liquidInFireCurrency = result.liquidPortfolioValue || 0;
  const alreadyFI = liquidInFireCurrency >= result.fireNumber;
  
  // Check if FIRE age is later than target
  const targetAge = targetRetirementAge || 50;
  const yearsLate = result.fireAge > targetAge ? result.fireAge - targetAge : 0;
  const hitsTarget = canFIRE && yearsLate === 0;
  const missesTarget = canFIRE && yearsLate > 0;
  
  // Determine card status - alreadyFI means hitsTarget
  const effectivelyOnTarget = hitsTarget || alreadyFI;
  const isWinner = effectivelyOnTarget && isSoonerRetirement;
  const isOnTarget = effectivelyOnTarget && !isSoonerRetirement;
  const isBehindTarget = missesTarget && !alreadyFI;
  
  // Color bar based on scheme
  const colorBar = colorScheme === 'blue' 
    ? 'bg-blue-500' 
    : 'bg-emerald-500';
  
  // Card styling based on status - clean card with left accent border
  const cardStyles = isWinner
    ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-l-4 border-l-green-500'
    : isOnTarget
    ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-l-4 border-l-green-500'
    : isBehindTarget
    ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-l-4 border-l-amber-500'
    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-l-4 border-l-red-500';
  
  const badgeStyles = isWinner
    ? 'bg-green-500 text-white'
    : isOnTarget
    ? 'bg-green-500 text-white'
    : isBehindTarget
    ? 'bg-amber-500 text-white'
    : 'bg-red-500 text-white';
  
  const badgeText = alreadyFI
    ? '🎉 Already FI'
    : isWinner 
    ? '🏆 Best Option' 
    : isOnTarget 
    ? '✓ On Target'
    : isBehindTarget
    ? `⚠️ ${yearsLate}yr${yearsLate > 1 ? 's' : ''} behind`
    : '✗ Cannot FIRE';

  return (
    <div className={`relative rounded-xl p-3 sm:p-4 ${cardStyles}`}>
      {/* Header with Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg">{country?.flag}</span>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{country?.name}</h3>
        </div>
        <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${badgeStyles}`}>
          {badgeText}
        </span>
      </div>

      <div className="space-y-3">
        {/* FIRE Number */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">FIRE Number</span>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber 
              value={result.fireNumber} 
              formatter={(n) => formatCurrency(Math.round(n), country?.currency || 'USD')} 
            />
          </p>
        </div>

        {/* Portfolio Breakdown - show if there's illiquid (property) */}
        {result.illiquidPortfolioValue > 0 && (
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 -mx-1">
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Your Portfolio</span>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(result.liquidPortfolioValue, country?.currency || 'USD')}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Liquid (withdrawable)</p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {formatCurrency(result.illiquidPortfolioValue, country?.currency || 'USD')}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Property (illiquid)</p>
              </div>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Withdrawals only come from liquid assets
            </p>
          </div>
        )}

        {/* Years to FIRE */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Years to FIRE</span>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {alreadyFI ? (
              <span className="text-green-600 dark:text-green-400">0 years</span>
            ) : canFIRE ? (
              <>
                {result.yearsUntilFIRE} years
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400">Cannot retire</span>
            )}
          </p>
          {alreadyFI ? (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-0.5">
              ✓ Liquid assets exceed FIRE number - ready now!
            </p>
          ) : canFIRE && (
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {yearsLate === 0 ? (
                <span className="text-green-600 dark:text-green-400">✓ Age {result.fireAge} (on target)</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Age {result.fireAge} ({yearsLate}yr late)</span>
              )}
            </p>
          )}
        </div>

        {/* Tax Rate */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Effective Tax Rate</span>
          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
            {formatPercent(result.effectiveTaxRate)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 break-words">
            Gross {formatCurrency(result.annualWithdrawalGross, country?.currency || 'USD')} → Net {formatCurrency(result.annualWithdrawalNet, country?.currency || 'USD')}
          </p>
        </div>

        {/* Healthcare */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Healthcare</span>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            {country?.healthcare?.estimatedAnnualCostPreRetirement > 5000 ? (
              <span className="text-amber-600 dark:text-amber-400">~{formatCurrency(country?.healthcare?.estimatedAnnualCostPreRetirement, country?.currency || 'USD')}/yr</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">✓ Public + ~{formatCurrency(country?.healthcare?.estimatedAnnualCostPreRetirement || 500, country?.currency || 'USD')}/yr</span>
            )}
          </p>
          {country?.healthcare?.notes && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
              {country.healthcare.notes}
            </p>
          )}
          {/* Expat Health Insurance Affiliate */}
          {colorScheme === 'green' && !hideAffiliate && (
            <HealthcareAffiliate
              retireCountryName={country?.name || ''}
              retireCountryCode={otherCountryCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CollapsibleTaxNotes({ result1, result2, country1, country2, isSameCountry, showTaxNotes, setShowTaxNotes }: {
  result1: FIREResult;
  result2: FIREResult;
  country1: typeof countries[string];
  country2: typeof countries[string];
  isSameCountry: boolean;
  showTaxNotes: boolean;
  setShowTaxNotes: (v: boolean) => void;
}) {
  const allNotes = [...(result1.countrySpecificNotes || []), ...(!isSameCountry ? (result2.countrySpecificNotes || []) : [])];
  
  if (allNotes.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setShowTaxNotes(!showTaxNotes)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-amber-800/20 transition-colors"
      >
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
          ⚠️ Important Tax Considerations
          <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400">({allNotes.length} note{allNotes.length > 1 ? 's' : ''})</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-amber-500 transition-transform ${showTaxNotes ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showTaxNotes && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <ul className="space-y-1.5">
            {allNotes.map((note, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Warnings({ result1, result2, country1, country2, isSameCountry }: {
  result1: FIREResult;
  result2: FIREResult;
  country1: typeof countries[string];
  country2: typeof countries[string];
  isSameCountry: boolean;
}) {
  const allWarnings = [...(result1.warnings || []), ...(!isSameCountry ? (result2.warnings || []) : [])];
  
  if (allWarnings.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
        🚨 Warnings
      </h3>
      <ul className="space-y-1.5">
        {allWarnings.map((warning, i) => (
          <li key={i} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
