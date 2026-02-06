'use client';

import { FIREResult, ComparisonSummary } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { CostOfLivingCard } from './CostOfLivingCard';
import { VisaCard } from './VisaCard';
import { MonteCarloCard } from './MonteCarloCard';
import { ReverseCalculator } from './ReverseCalculator';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import { UserInputs } from '@/lib/calculations';

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
  inputs
}: ResultsPanelProps) {
  const country1 = countries[country1Code];
  const country2 = countries[country2Code];
  const isSameCountry = country1Code === country2Code;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">FIRE Comparison</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{country1?.flag} {country1?.name} vs {country2?.flag} {country2?.name}</p>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <CountryCard 
          result={result1} 
          country={country1} 
          isLowerFIRE={comparison.lowerFIRENumber === country1Code}
          isLowerTax={comparison.lowerEffectiveTaxRate === country1Code}
          isSoonerRetirement={comparison.earlierRetirement === country1Code}
          otherCountryCode={country2Code}
          portfolioValue={inputs?.portfolioValue}
          portfolioCurrency={inputs?.portfolioCurrency}
          targetRetirementAge={inputs?.targetRetirementAge}
          currentAge={inputs?.currentAge}
        />
        {!isSameCountry && (
          <CountryCard 
            result={result2} 
            country={country2}
            isLowerFIRE={comparison.lowerFIRENumber === country2Code}
            isLowerTax={comparison.lowerEffectiveTaxRate === country2Code}
            isSoonerRetirement={comparison.earlierRetirement === country2Code}
            otherCountryCode={country1Code}
            portfolioValue={inputs?.portfolioValue}
            portfolioCurrency={inputs?.portfolioCurrency}
            targetRetirementAge={inputs?.targetRetirementAge}
            currentAge={inputs?.currentAge}
          />
        )}
      </div>

      {/* Reverse Calculator - What Can I Spend? */}
      {inputs && (
        <ReverseCalculator
          portfolioValue={inputs.portfolioValue}
          portfolioCurrency={inputs.portfolioCurrency}
          country1Code={country1Code}
          country2Code={country2Code}
          currentSpending={inputs.annualSpending}
          safeWithdrawalRate={inputs.safeWithdrawalRate}
        />
      )}

      {/* Monte Carlo Analysis */}
      {inputs && (
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
      )}

      {/* Tax Breakdown Details */}
      {inputs && (
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

      {/* Visa Requirements for Target Country */}
      {!isSameCountry && (
        <VisaCard
          countryCode={country2Code}
          userAge={userAge}
        />
      )}

      {/* Summary */}
      {!isSameCountry && (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
          
          {/* Winner explanation - check if either hits target */}
          {result1.canRetire && result2.canRetire && (() => {
            const targetAge = inputs?.targetRetirementAge || 50;
            const country1HitsTarget = result1.fireAge <= targetAge;
            const country2HitsTarget = result2.fireAge <= targetAge;
            const bothMissTarget = !country1HitsTarget && !country2HitsTarget;
            const yearsBehind1 = result1.fireAge - targetAge;
            const yearsBehind2 = result2.fireAge - targetAge;
            
            if (bothMissTarget) {
              const bestOption = result1.fireAge <= result2.fireAge ? country1Code : country2Code;
              const bestYearsBehind = Math.min(yearsBehind1, yearsBehind2);
              return (
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mb-2 font-medium">
                  ⚠️ Neither option hits your target age {targetAge}. {countries[bestOption]?.name} is closest ({bestYearsBehind} yr{bestYearsBehind > 1 ? 's' : ''} behind)
                </p>
              );
            }
            
            return (
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-2 font-medium">
                🏆 {countries[comparison.earlierRetirement]?.name} wins: {
                  result1.yearsUntilFIRE === result2.yearsUntilFIRE 
                    ? 'Same timeline, lower FIRE number'
                    : `FIRE ${Math.abs(result1.yearsUntilFIRE - result2.yearsUntilFIRE)} year${Math.abs(result1.yearsUntilFIRE - result2.yearsUntilFIRE) === 1 ? '' : 's'} sooner`
                }
              </p>
            );
          })()}
          
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <li>• FIRE number is <strong>{formatCurrency(comparison.fireNumberDifferenceUSD, 'USD')}</strong> ({formatPercent(comparison.fireNumberDifferencePercent)}) lower in <strong>{countries[comparison.lowerFIRENumber]?.name}</strong></li>
            <li>• Effective tax rate is <strong>{formatPercent(comparison.taxRateDifference)}</strong> lower in <strong>{countries[comparison.lowerEffectiveTaxRate]?.name}</strong></li>
          </ul>
        </div>
      )}

      {/* Tax Notes */}
      <TaxNotes result1={result1} result2={result2} country1={country1} country2={country2} isSameCountry={isSameCountry} />

      {/* Warnings */}
      <Warnings result1={result1} result2={result2} country1={country1} country2={country2} isSameCountry={isSameCountry} />
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
  currentAge
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
}) {
  const canFIRE = result.canRetire;
  
  // Check if already financially independent (portfolio >= FIRE number)
  const portfolioInFireCurrency = portfolioValue && portfolioCurrency && country?.currency
    ? (portfolioCurrency === country.currency ? portfolioValue : portfolioValue * 0.85) // Approximate conversion
    : portfolioValue || 0;
  const alreadyFI = portfolioInFireCurrency >= result.fireNumber;
  
  // Check if FIRE age is later than target
  const targetAge = targetRetirementAge || 50;
  const yearsLate = result.fireAge > targetAge ? result.fireAge - targetAge : 0;
  const hitsTarget = canFIRE && yearsLate === 0;
  const missesTarget = canFIRE && yearsLate > 0;
  
  // Determine card status based on whether target is achievable
  // Green = hits target AND is best option
  // Amber = can FIRE but misses target, OR can hit target but not best option
  // Red = cannot FIRE at all
  const isWinner = hitsTarget && isSoonerRetirement;
  const isOnTarget = hitsTarget && !isSoonerRetirement;
  const isBehindTarget = missesTarget;
  const cantFIRE = !canFIRE;
  
  // Card styling based on status
  const cardStyles = isWinner
    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-500'
    : isOnTarget
    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-500'
    : isBehindTarget
    ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-500'
    : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500';
  
  const badgeStyles = isWinner
    ? 'bg-green-500 text-white'
    : isOnTarget
    ? 'bg-green-500 text-white'
    : isBehindTarget
    ? 'bg-amber-500 text-white'
    : 'bg-red-500 text-white';
  
  const badgeText = isWinner
    ? '🏆 Best Option'
    : isOnTarget
    ? '✓ On Target'
    : isBehindTarget
    ? `⚠️ ${yearsLate}yr${yearsLate > 1 ? 's' : ''} behind`
    : '✗ Cannot FIRE';
  
  return (
    <div className={`rounded-xl p-3 sm:p-4 shadow-sm ${cardStyles}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
          {country?.flag} {country?.name}
        </h3>
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${badgeStyles}`}>
          {badgeText}
        </span>
      </div>

      <div className="space-y-3">
        {/* FIRE Number */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">FIRE Number</span>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(result.fireNumber, country?.currency || 'USD')}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
            {formatCurrency(result.fireNumber, country?.currency || 'USD')}
          </p>
        </div>

        {/* Years to FIRE */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Years to FIRE</span>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {canFIRE 
              ? (result.yearsUntilFIRE === 0 ? '🎉 Now!' : `${result.yearsUntilFIRE} years`)
              : 'Need more savings'
            }
          </p>
          {canFIRE && result.yearsUntilFIRE > 0 && alreadyFI && (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">✓ Already FI! Working by choice</p>
          )}
          {canFIRE && result.yearsUntilFIRE > 0 && !alreadyFI && yearsLate > 0 && (
            <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
              ⚠️ FIRE at age {result.fireAge} ({yearsLate} yr{yearsLate > 1 ? 's' : ''} after target)
            </p>
          )}
          {canFIRE && result.yearsUntilFIRE > 0 && !alreadyFI && yearsLate === 0 && (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">✓ FIRE at age {result.fireAge} (on target!)</p>
          )}
          {canFIRE && result.yearsUntilFIRE === 0 && (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">You've reached your FIRE number!</p>
          )}
        </div>

        {/* Effective Tax Rate */}
        <div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Effective Tax Rate</span>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {formatPercent(result.effectiveTaxRate)}
          </p>
        </div>

        {/* Withdrawal Info */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-slate-600">
          <div>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Gross withdrawal</span>
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(result.annualWithdrawalGross, country?.currency || 'USD')}
            </p>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">After tax</span>
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(result.annualWithdrawalNet, country?.currency || 'USD')}
            </p>
          </div>
        </div>

        {/* Healthcare */}
        <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Healthcare</span>
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            {country?.healthcare.publicAccessForResidents && country?.healthcare.estimatedAnnualCostPreRetirement === 0
              ? '✓ Free public healthcare'
              : country?.healthcare.publicAccessForResidents && country?.healthcare.estimatedAnnualCostPreRetirement > 0
              ? `✓ Public + ~${formatCurrency(country.healthcare.estimatedAnnualCostPreRetirement, country?.currency || 'USD')}/yr`
              : `~${formatCurrency(country?.healthcare.estimatedAnnualCostPreRetirement || 0, country?.currency || 'USD')}/yr`
            }
          </p>
          {country?.healthcare.notes && (
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {country.healthcare.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TaxNotes({ 
  result1, 
  result2, 
  country1, 
  country2, 
  isSameCountry 
}: { 
  result1: FIREResult; 
  result2: FIREResult; 
  country1: typeof countries[string]; 
  country2: typeof countries[string];
  isSameCountry: boolean;
}) {
  const allNotes = [
    ...result1.countrySpecificNotes,
    ...(isSameCountry ? [] : result2.countrySpecificNotes)
  ];

  if (allNotes.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
        ⚠️ Important Tax Considerations
      </h3>
      <ul className="space-y-1.5 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
        {allNotes.map((note, i) => (
          <li key={i}>• {note}</li>
        ))}
      </ul>
    </div>
  );
}

function Warnings({ 
  result1, 
  result2, 
  country1, 
  country2, 
  isSameCountry 
}: { 
  result1: FIREResult; 
  result2: FIREResult; 
  country1: typeof countries[string]; 
  country2: typeof countries[string];
  isSameCountry: boolean;
}) {
  const allWarnings = [
    ...result1.warnings.map(w => ({ warning: w, country: country1 })),
    ...(isSameCountry ? [] : result2.warnings.map(w => ({ warning: w, country: country2 })))
  ];

  if (allWarnings.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
        🚨 Warnings
      </h3>
      <ul className="space-y-1.5 text-xs sm:text-sm text-red-700 dark:text-red-400">
        {allWarnings.map((w, i) => (
          <li key={i}>• {w.country?.flag} {w.warning}</li>
        ))}
      </ul>
    </div>
  );
}
