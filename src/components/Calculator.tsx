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
import { formatCurrency } from '@/lib/formatters';

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
  statePensionAmount: 22000,
  statePensionAge: 67,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  safeWithdrawalRate: 0.04,
};

// What is FIRE explainer component
function WhatIsFIRE({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-amber-800/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="font-medium text-gray-900 dark:text-white">New to FIRE? Learn how this works</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">💰 FIRE Number</div>
              <p className="text-xs">The total savings you need to retire. Calculated as your annual spending ÷ 4% (the "safe withdrawal rate").</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">📊 4% Rule</div>
              <p className="text-xs">Withdraw 4% of your portfolio yearly and historically it lasts 30+ years. We use this to calculate your FIRE number.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">🌍 Why Compare?</div>
              <p className="text-xs">Different countries have different tax rates and living costs. You might retire years earlier abroad!</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-amber-200 dark:border-amber-800 pt-3">
            <strong>Example:</strong> If you spend $40,000/year, your FIRE number is $1,000,000 ($40K ÷ 4%). But in Portugal with lower costs, you might only need $600,000!
          </p>
        </div>
      )}
    </div>
  );
}

// Simplified Quick Start inputs
function QuickStartInputs({ 
  inputs, 
  onChange,
  onShowAdvanced 
}: { 
  inputs: UserInputs; 
  onChange: (inputs: UserInputs) => void;
  onShowAdvanced: () => void;
}) {
  const countryOptions = Object.values(countries).map(c => ({
    value: c.code,
    label: `${c.flag} ${c.name}`,
  }));

  const handleChange = (field: keyof UserInputs, value: any) => {
    const newInputs = { ...inputs, [field]: value };
    if (field === 'currentCountry') {
      newInputs.portfolioCurrency = countries[value]?.currency || 'USD';
      newInputs.spendingCurrency = countries[value]?.currency || 'USD';
    }
    onChange(newInputs);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Calculator</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">Essential inputs only</span>
      </div>

      {/* Country Selection - Most Important */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">I currently live in</label>
          <select
            value={inputs.currentCountry}
            onChange={(e) => handleChange('currentCountry', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          >
            {countryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">I want to retire in</label>
          <select
            value={inputs.targetCountry}
            onChange={(e) => handleChange('targetCountry', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          >
            {countryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Age */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current age</label>
          <input
            type="number"
            value={inputs.currentAge}
            onChange={(e) => handleChange('currentAge', parseInt(e.target.value) || 30)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target retirement age</label>
          <input
            type="number"
            value={inputs.targetRetirementAge}
            onChange={(e) => handleChange('targetRetirementAge', parseInt(e.target.value) || 50)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Money */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Total savings
            <span className="text-gray-400 font-normal ml-1">({countries[inputs.currentCountry]?.currencySymbol})</span>
          </label>
          <input
            type="text"
            value={inputs.portfolioValue.toLocaleString()}
            onChange={(e) => handleChange('portfolioValue', parseFloat(e.target.value.replace(/,/g, '')) || 0)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Annual spending
            <span className="text-gray-400 font-normal ml-1">({countries[inputs.currentCountry]?.currencySymbol})</span>
          </label>
          <input
            type="text"
            value={inputs.annualSpending.toLocaleString()}
            onChange={(e) => handleChange('annualSpending', parseFloat(e.target.value.replace(/,/g, '')) || 0)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Show Advanced Button */}
      <button
        onClick={onShowAdvanced}
        className="w-full py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Customize account types, pensions, tax details...
      </button>
    </div>
  );
}

// Mobile sticky comparison header
function MobileStickyComparison({ 
  result1, 
  result2, 
  country1Code, 
  country2Code,
  isVisible 
}: { 
  result1: any; 
  result2: any; 
  country1Code: string; 
  country2Code: string;
  isVisible: boolean;
}) {
  const country1 = countries[country1Code];
  const country2 = countries[country2Code];
  const isSame = country1Code === country2Code;

  if (!isVisible || isSame) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg z-50 px-4 py-3 safe-area-bottom">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">{country1?.flag} {country1?.name}</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {formatCurrency(result1?.fireNumber || 0, country1?.currency || 'USD')}
          </div>
          <div className="text-xs text-gray-500">
            {result1?.canRetire ? `Age ${result1?.fireAge}` : 'Cannot FIRE'}
          </div>
        </div>
        <div className="text-gray-300 dark:text-gray-600">vs</div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">{country2?.flag} {country2?.name}</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {formatCurrency(result2?.fireNumber || 0, country2?.currency || 'USD')}
          </div>
          <div className="text-xs text-gray-500">
            {result2?.canRetire ? `Age ${result2?.fireAge}` : 'Cannot FIRE'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Calculator() {
  const [inputs, setInputs] = useState<UserInputs>(defaultInputs);
  const [fxLoaded, setFxLoaded] = useState(false);
  const [fxError, setFxError] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');
  const [showExplainer, setShowExplainer] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showMobileComparison, setShowMobileComparison] = useState(false);

  // Check if URL has params (returning user) - skip explainer and use advanced mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.toString()) {
        const loadedInputs = decodeStateFromURL(searchParams, defaultInputs);
        setInputs(loadedInputs);
        setAdvancedMode(true); // Returning users get advanced mode
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

  // Show mobile comparison bar when scrolled to results
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setShowMobileComparison(window.scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareableURL(inputs);
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch { prompt('Copy this URL to share:', url); }
  }, [inputs]);

  const results = useMemo(() => {
    try { return compareFIRE(inputs, inputs.currentCountry, inputs.targetCountry); }
    catch (error) { console.error('Calculation error:', error); return null; }
  }, [inputs, fxLoaded]);

  const isSameCountry = inputs.currentCountry === inputs.targetCountry;
  const showFxRate = !isSameCountry && inputs.portfolioCurrency !== countries[inputs.targetCountry]?.currency;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors pb-20 lg:pb-0">
      {/* Share Toast - More prominent */}
      {showShareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fade-in flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div className="font-medium">Link copied!</div>
            <div className="text-xs text-green-100">Share this URL to show your exact scenario</div>
          </div>
        </div>
      )}

      <header className="border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-40 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                Where to <span className="fire-gradient">FIRE</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Compare early retirement across countries</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {showFxRate && fxLoaded && (
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-slate-700 pr-3">
                  💱 1 {inputs.portfolioCurrency} = {getDisplayRate(inputs.portfolioCurrency, countries[inputs.targetCountry]?.currency || 'USD')} {countries[inputs.targetCountry]?.currency}
                </div>
              )}
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
              <button 
                onClick={handleShare} 
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
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

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* What is FIRE Explainer - Show for new users */}
        {!advancedMode && (
          <div className="mb-6">
            <WhatIsFIRE isOpen={showExplainer} onToggle={() => setShowExplainer(!showExplainer)} />
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Quick Start or Full Panel */}
            {!advancedMode ? (
              <QuickStartInputs 
                inputs={inputs} 
                onChange={setInputs} 
                onShowAdvanced={() => setAdvancedMode(true)} 
              />
            ) : (
              <div className="lg:border-r lg:pr-8 border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Details</h2>
                  <button 
                    onClick={() => setAdvancedMode(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ← Simplified view
                  </button>
                </div>
                <InputPanel inputs={inputs} onChange={setInputs} />
              </div>
            )}
          </div>
          <div>
            {results ? (
              <div className="space-y-6">
                <ResultsPanel 
                  result1={results.country1} 
                  result2={results.country2} 
                  comparison={results.comparison} 
                  country1Code={inputs.currentCountry} 
                  country2Code={inputs.targetCountry} 
                  annualSpending={inputs.annualSpending} 
                  spendingCurrency={inputs.spendingCurrency} 
                  userAge={inputs.currentAge} 
                  inputs={inputs} 
                />
                <JourneyTimeline
                  projections1={results.country1.projections}
                  projections2={isSameCountry ? undefined : results.country2.projections}
                  country1Code={inputs.currentCountry}
                  country2Code={isSameCountry ? undefined : inputs.targetCountry}
                  retirementAge={inputs.targetRetirementAge}
                  expectedReturn={inputs.expectedReturn}
                  inflationRate={inputs.inflationRate}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <p>Unable to calculate results.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {activeTab === 'inputs' && (
            <div className="space-y-6">
              {!advancedMode ? (
                <QuickStartInputs 
                  inputs={inputs} 
                  onChange={setInputs} 
                  onShowAdvanced={() => setAdvancedMode(true)} 
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Details</h2>
                    <button 
                      onClick={() => setAdvancedMode(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ← Simplified view
                    </button>
                  </div>
                  <InputPanel inputs={inputs} onChange={setInputs} />
                </div>
              )}
              <button 
                onClick={() => setActiveTab('results')} 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                View Results →
              </button>
            </div>
          )}
          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <ResultsPanel 
                result1={results.country1} 
                result2={results.country2} 
                comparison={results.comparison} 
                country1Code={inputs.currentCountry} 
                country2Code={inputs.targetCountry} 
                annualSpending={inputs.annualSpending} 
                spendingCurrency={inputs.spendingCurrency} 
                userAge={inputs.currentAge} 
                inputs={inputs} 
              />
              <JourneyTimeline
                projections1={results.country1.projections}
                projections2={isSameCountry ? undefined : results.country2.projections}
                country1Code={inputs.currentCountry}
                country2Code={isSameCountry ? undefined : inputs.targetCountry}
                retirementAge={inputs.targetRetirementAge}
                expectedReturn={inputs.expectedReturn}
                inflationRate={inputs.inflationRate}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Comparison Bar */}
      {results && (
        <MobileStickyComparison
          result1={results.country1}
          result2={results.country2}
          country1Code={inputs.currentCountry}
          country2Code={inputs.targetCountry}
          isVisible={showMobileComparison && activeTab === 'results'}
        />
      )}
    </div>
  );
}
