'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { UserInputs, compareFIRE } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { InputPanel } from './InputPanel';
import { ResultsPanel } from './ResultsPanel';
import { JourneyTimeline } from './JourneyTimeline';
import { fetchLiveRates, setRates, getDisplayRate } from '@/lib/currency';
import { decodeStateFromURL, encodeStateToURL, getShareableURL } from '@/lib/urlState';
import { PDFExportButton } from './PDFExport';
import { ThemeToggle } from './ThemeProvider';

const defaultInputs: UserInputs = {
  currentAge: 35,
  targetRetirementAge: 50,
  currentCountry: 'US',
  targetCountry: 'PT',
  portfolioValue: 250000,
  portfolioCurrency: 'USD',
  portfolioAllocation: { stocks: 80, bonds: 15, cash: 5, crypto: 0, property: 0 },
  accounts: { taxDeferred: 100000, taxFree: 50000, taxable: 80000, crypto: 20000, cash: 0, property: 0, other: 0, otherLabel: '' },
  traditionalRetirementAccounts: 100000,
  rothAccounts: 50000,
  taxableAccounts: 80000,
  propertyEquity: 0,
  annualSpending: 50000,
  spendingCurrency: 'USD',
  annualSavings: 30000,
  expectStatePension: false,
  statePensionAmount: 22000,  // US Social Security average
  statePensionAge: 67,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  safeWithdrawalRate: 0.04,
};

export function Calculator() {
  const [inputs, setInputs] = useState<UserInputs>(defaultInputs);
  const [fxLoaded, setFxLoaded] = useState(false);
  const [fxError, setFxError] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.toString()) {
        const loadedInputs = decodeStateFromURL(searchParams, defaultInputs);
        setInputs(loadedInputs);
      }
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const timeoutId = setTimeout(() => {
      const newParams = encodeStateToURL(inputs);
      const newURL = `${window.location.pathname}?${newParams}`;
      window.history.replaceState({}, '', newURL);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [inputs, initialized]);

  useEffect(() => {
    fetchLiveRates()
      .then((rates) => { setRates(rates); setFxLoaded(true); })
      .catch(() => { setFxError(true); setFxLoaded(true); });
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareableURL(inputs);
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch { prompt('Copy this URL to share:', url); }
  }, [inputs]);

  const results = useMemo(() => {
    try { return compareFIRE(inputs, inputs.currentCountry, inputs.targetCountry); }
    catch (error) { console.error('Calculation error:', error); return null; }
  }, [inputs, fxLoaded]);

  const isSameCountry = inputs.currentCountry === inputs.targetCountry;
  const showFxRate = !isSameCountry && inputs.portfolioCurrency !== countries[inputs.targetCountry]?.currency;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {showShareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in text-sm">
          ✓ Link copied!
        </div>
      )}

      <header className="border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate flex items-baseline gap-0.5">
                <span className="font-light">Where</span>
                <span className="font-light text-gray-500 dark:text-gray-400 mx-0.5">to</span>
                <span className="font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">F</span>
                <span className="relative font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  I
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs animate-flame">🔥</span>
                </span>
                <span className="font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">RE</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Compare early retirement across countries</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {results && !isSameCountry && (
                <PDFExportButton
                  result1={results.country1}
                  result2={results.country2}
                  comparison={results.comparison}
                  country1Code={inputs.currentCountry}
                  country2Code={inputs.targetCountry}
                  inputs={inputs}
                />
              )}
              <button onClick={handleShare} className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
              <ThemeToggle />
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-400 dark:text-gray-500">All calculations are estimates.</div>
                {showFxRate && fxLoaded && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    💱 1 {inputs.portfolioCurrency} = {getDisplayRate(inputs.portfolioCurrency, countries[inputs.targetCountry]?.currency || 'USD')} {countries[inputs.targetCountry]?.currency}
                  </div>
                )}
              </div>
            </div>
          </div>
          {showFxRate && fxLoaded && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 md:hidden">
              💱 1 {inputs.portfolioCurrency} = {getDisplayRate(inputs.portfolioCurrency, countries[inputs.targetCountry]?.currency || 'USD')} {countries[inputs.targetCountry]?.currency}
            </div>
          )}
        </div>
      </header>

      <div className="lg:hidden border-b border-gray-200 dark:border-slate-700 sticky top-[57px] bg-white dark:bg-slate-900 z-30 transition-colors">
        <div className="flex">
          <button onClick={() => setActiveTab('inputs')} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'inputs' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            📝 Your Details
          </button>
          <button onClick={() => setActiveTab('results')} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'results' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            📊 Results
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="hidden lg:grid lg:grid-cols-2 gap-8">
          <div className="lg:border-r lg:pr-8 border-gray-200 dark:border-slate-700">
            <InputPanel inputs={inputs} onChange={setInputs} />
          </div>
          <div>
            {results ? (
              <ResultsPanel result1={results.country1} result2={results.country2} comparison={results.comparison} country1Code={inputs.currentCountry} country2Code={inputs.targetCountry} annualSpending={inputs.annualSpending} spendingCurrency={inputs.spendingCurrency} userAge={inputs.currentAge} inputs={inputs} />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12"><p>Unable to calculate results.</p></div>
            )}
          </div>
        </div>

        <div className="lg:hidden">
          {activeTab === 'inputs' && (
            <div>
              <InputPanel inputs={inputs} onChange={setInputs} />
              <button onClick={() => setActiveTab('results')} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                View Results →
              </button>
            </div>
          )}
          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <ResultsPanel result1={results.country1} result2={results.country2} comparison={results.comparison} country1Code={inputs.currentCountry} country2Code={inputs.targetCountry} annualSpending={inputs.annualSpending} spendingCurrency={inputs.spendingCurrency} userAge={inputs.currentAge} inputs={inputs} />
              <JourneyTimeline
                projections1={results.country1.projections}
                projections2={!isSameCountry ? results.country2.projections : undefined}
                country1Code={inputs.currentCountry}
                country2Code={!isSameCountry ? inputs.targetCountry : undefined}
                retirementAge={inputs.targetRetirementAge}
                expectedReturn={inputs.expectedReturn}
                inflationRate={inputs.inflationRate}
              />
            </div>
          )}
        </div>

        {/* Journey Timeline - Desktop */}
        {results && results.country1.projections.length > 0 && (
          <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-slate-700 pt-6 sm:pt-8 hidden lg:block">
            <JourneyTimeline
              projections1={results.country1.projections}
              projections2={!isSameCountry ? results.country2.projections : undefined}
              country1Code={inputs.currentCountry}
              country2Code={!isSameCountry ? inputs.targetCountry : undefined}
              retirementAge={inputs.targetRetirementAge}
              expectedReturn={inputs.expectedReturn}
              inflationRate={inputs.inflationRate}
            />
          </div>
        )}
      </main>

      <div className="border-t border-gray-200 dark:border-slate-700 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center">
            Data last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Exchange rates update hourly
          </p>
        </div>
      </div>
    </div>
  );
}
