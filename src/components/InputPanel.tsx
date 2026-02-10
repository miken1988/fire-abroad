'use client';

import { UserInputs } from '@/lib/calculations';
import { countries, countryAccountTypes, crossBorderTreatment } from '@/data/countries';
import { getStatePension } from '@/data/statePensions';
import { usStates, USState } from '@/data/usStateTaxes';
import { formatCurrency } from '@/lib/formatters';
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Format number with commas (e.g., 5000000 -> "5,000,000")
 */
function formatWithCommas(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Parse a string that may contain commas back to a number
 */
function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/,/g, ''));
}

/**
 * Hook for number inputs that shows formatted numbers (with commas) when not editing.
 * Allows free typing without leading zeros.
 */
function useNumericInput(
  value: number,
  onCommit: (val: number) => void,
  opts?: { fallback?: number; integer?: boolean; format?: boolean }
) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const fallback = opts?.fallback ?? 0;
  const isInt = opts?.integer ?? false;
  const shouldFormat = opts?.format ?? true;

  // When not editing, show formatted value with commas
  const displayValue = editing ? draft : (shouldFormat ? formatWithCommas(value) : String(value));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    setEditing(true);
    // Update live if it's a valid number (strip commas for parsing)
    const parsed = isInt ? parseInt(raw.replace(/,/g, '')) : parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      onCommit(parsed);
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw number without commas for easy editing
    setDraft(String(value));
    setEditing(true);
    // Select all text so user can just type to replace
    setTimeout(() => e.target.select(), 0);
  };

  const onBlur = () => {
    setEditing(false);
    const parsed = isInt ? parseInt(draft.replace(/,/g, '')) : parseFloat(draft.replace(/,/g, ''));
    if (isNaN(parsed) || draft === '') {
      onCommit(fallback);
    } else {
      onCommit(parsed);
    }
  };

  return { value: displayValue, onChange, onFocus, onBlur };
}

/**
 * Smart step calculation for sliders - larger steps for larger values
 */
function getSmartStep(maxValue: number): number {
  if (maxValue >= 10000000) return 100000; // $10M+ = $100k steps
  if (maxValue >= 1000000) return 50000;   // $1M+ = $50k steps
  if (maxValue >= 100000) return 10000;    // $100k+ = $10k steps
  if (maxValue >= 10000) return 1000;      // $10k+ = $1k steps
  return 100;                               // Under $10k = $100 steps
}

/**
 * Hybrid slider + text input component for better UX
 * Shows formatted numbers with commas when not editing
 */
function MoneySlider({
  value,
  onChange,
  max,
  label,
  icon,
  currency,
  tooltip,
  warning,
  unallocated = 0,
  returnRate,
  onReturnRateChange,
  defaultReturnRate,
}: {
  value: number;
  onChange: (val: number) => void;
  max: number;
  label: string;
  icon?: string;
  currency: string;
  tooltip?: string;
  warning?: string | null;
  unallocated?: number;
  returnRate?: number;
  onReturnRateChange?: (rate: number) => void;
  defaultReturnRate?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const [showReturnSlider, setShowReturnSlider] = useState(false);
  const step = getSmartStep(max);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);
    // Strip commas for parsing
    const parsed = parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(Math.min(parsed, max));
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    setIsFocused(false);
    const parsed = parseFloat(textValue.replace(/,/g, ''));
    if (isNaN(parsed) || textValue === '') {
      onChange(0);
    } else {
      onChange(Math.min(parsed, max));
    }
  };

  const handleTextFocus = () => {
    setIsEditing(true);
    setIsFocused(true);
    setTextValue(String(value));
  };

  const handleFill = () => {
    onChange(value + unallocated);
  };

  // Display formatted number with commas when not editing
  const displayValue = isEditing ? textValue : formatWithCommas(value);
  
  // Show fill button when focused/hovered and there's unallocated funds
  const showFill = unallocated > 0;

  return (
    <div 
      className="group"
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => !isEditing && setIsFocused(false)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          {icon && <span>{icon}</span>} {label}
          {tooltip && <Tooltip text={tooltip} />}
          {warning && <span className="text-amber-500">⚠️</span>}
        </label>
        {/* Editable value display with Fill button */}
        <div className="flex items-center gap-2">
          {showFill && isFocused && (
            <button
              type="button"
              onClick={handleFill}
              className="px-2 py-1 text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg transition-colors whitespace-nowrap"
            >
              Fill {formatWithCommas(unallocated)}
            </button>
          )}
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleTextChange}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            className="w-24 sm:w-28 px-2 py-1 text-right text-base sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      
      {/* Return rate slider - only show if value > 0 and handler provided */}
      {value > 0 && onReturnRateChange && (
        <div className="mt-2">
          {!showReturnSlider ? (
            <button
              type="button"
              onClick={() => setShowReturnSlider(true)}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              ⚙️ Adjust expected return ({((returnRate ?? defaultReturnRate ?? 0.07) * 100).toFixed(0)}%)
            </button>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Expected Return</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                    {((returnRate ?? defaultReturnRate ?? 0.07) * 100).toFixed(0)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReturnSlider(false)}
                    className="text-gray-400 hover:text-gray-600 text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-0.05"
                max="0.20"
                step="0.01"
                value={returnRate ?? defaultReturnRate ?? 0.07}
                onChange={(e) => onReturnRateChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                <span>-5%</span>
                <span>20%</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {warning && (
        <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-1 bg-amber-50 dark:bg-amber-900/30 p-1.5 sm:p-2 rounded">
          ⚠️ {warning}
        </p>
      )}
    </div>
  );
}

/**
 * Auto-calculating "Other" field that shows unallocated portfolio amount
 * with optional custom label
 */
function OtherAssetField({
  value,
  unallocated,
  onChange,
  label,
  onLabelChange,
  currency,
  currencySymbol,
}: {
  value: number;
  unallocated: number;
  onChange: (val: number) => void;
  label: string;
  onLabelChange: (label: string) => void;
  currency: string;
  currencySymbol: string;
}) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(label);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [valueDraft, setValueDraft] = useState(String(value));
  
  const displayLabel = label || 'Unallocated';
  const hasUnallocated = unallocated > 0;
  
  // Auto-fill unallocated amount
  const handleAutoFill = () => {
    onChange(unallocated);
  };
  
  const handleLabelSave = () => {
    onLabelChange(labelDraft);
    setIsEditingLabel(false);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueDraft(e.target.value);
    const parsed = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  const handleValueBlur = () => {
    setIsEditingValue(false);
    const parsed = parseFloat(valueDraft.replace(/,/g, ''));
    if (isNaN(parsed) || valueDraft === '') {
      onChange(0);
    } else {
      onChange(Math.max(0, parsed));
    }
  };

  const handleValueFocus = () => {
    setIsEditingValue(true);
    setValueDraft(String(value));
  };

  const displayValue = isEditingValue ? valueDraft : formatWithCommas(value);
  
  return (
    <div className={`rounded-lg p-3 ${hasUnallocated ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isEditingLabel ? (
            <div className="flex items-center gap-1">
              <span>📦</span>
              <input
                type="text"
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                placeholder="e.g., RSUs, Stock Options"
                className="w-32 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>
          ) : (
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <span>📦</span> {displayLabel}
              <button
                onClick={() => {
                  setLabelDraft(label);
                  setIsEditingLabel(true);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[10px]"
                title="Rename this field"
              >
                ✏️
              </button>
              <Tooltip text="Unallocated portion of your portfolio. Click ✏️ to rename (e.g., RSUs, Stock Options, Art)" />
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasUnallocated && value !== unallocated && (
            <button
              onClick={handleAutoFill}
              className="px-2 py-1 text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg transition-colors whitespace-nowrap"
            >
              Fill {formatCurrency(unallocated, currency)}
            </button>
          )}
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">{currencySymbol}</span>
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleValueChange}
              onFocus={handleValueFocus}
              onBlur={handleValueBlur}
              className="w-24 sm:w-28 px-2 py-1 text-right text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {hasUnallocated && value === 0 && (
        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
          💡 {formatCurrency(unallocated, currency)} unallocated from your total portfolio
        </p>
      )}
    </div>
  );
}

/**
 * US State Selector with autocomplete
 */
function USStateSelector({ value, onChange }: { value: string; onChange: (state: string) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStates, setFilteredStates] = useState<USState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedState = usStates.find(s => s.code === value);
  
  useEffect(() => {
    if (query.length > 0) {
      const q = query.toLowerCase();
      const filtered = usStates.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.code.toLowerCase().includes(q)
      ).slice(0, 8);
      setFilteredStates(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredStates([]);
      setIsOpen(false);
    }
  }, [query]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (state: USState) => {
    onChange(state.code);
    setQuery('');
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange('');
    setQuery('');
  };
  
  const formatTaxRate = (rate: number) => {
    if (rate === 0) return 'No tax';
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="relative">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        🇺🇸 US State (for state taxes)
      </label>
      
      {selectedState ? (
        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div>
            <span className="font-medium text-sm text-gray-900 dark:text-white">{selectedState.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {selectedState.hasNoIncomeTax ? (
                <span className="text-green-600 dark:text-green-400">✓ No state income tax</span>
              ) : (
                <span>Top rate: {formatTaxRate(selectedState.incomeTaxRate)}</span>
              )}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setIsOpen(true)}
            placeholder="Type state name (e.g., California, TX)"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
          
          {isOpen && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredStates.map(state => (
                <button
                  key={state.code}
                  onClick={() => handleSelect(state)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-900 dark:text-white">
                    {state.name} <span className="text-gray-400">({state.code})</span>
                  </span>
                  <span className={`text-xs ${state.hasNoIncomeTax ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {state.hasNoIncomeTax ? '✓ No tax' : formatTaxRate(state.incomeTaxRate)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {!selectedState && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          State taxes vary from 0% (FL, TX, WA) to 13.3% (CA)
        </p>
      )}
    </div>
  );
}

interface InputPanelProps {
  inputs: UserInputs;
  onChange: (inputs: UserInputs) => void;
}

export function InputPanel({ inputs, onChange }: InputPanelProps) {
  const currentCountry = countries[inputs.currentCountry];
  const targetCountry = countries[inputs.targetCountry];
  const isSameCountry = inputs.currentCountry === inputs.targetCountry;
  const statePension = getStatePension(inputs.currentCountry);
  const destinationPension = getStatePension(inputs.targetCountry);

  const handleChange = (field: keyof UserInputs, value: any) => {
    const newInputs = { ...inputs, [field]: value };
    
    // Keep expectedReturn and assetReturns.stocks in sync
    if (field === 'expectedReturn') {
      newInputs.assetReturns = { 
        stocks: value,
        property: newInputs.assetReturns?.property ?? (newInputs.inflationRate + 0.02),
        crypto: newInputs.assetReturns?.crypto ?? (value + 0.03),
        cash: newInputs.assetReturns?.cash ?? (newInputs.inflationRate * 0.5),
      };
    }
    
    if (field === 'currentCountry') {
      newInputs.portfolioCurrency = countries[value]?.currency || 'USD';
      newInputs.spendingCurrency = countries[value]?.currency || 'USD';
      
      // Update pension defaults when country changes
      const newPension = getStatePension(value);
      if (newPension) {
        newInputs.statePensionAge = newPension.eligibilityAge;
        newInputs.statePensionAmount = newPension.averageAnnualBenefit;
      }
    }
    
    // Update destination pension defaults when target country changes
    if (field === 'targetCountry') {
      const newDestPension = getStatePension(value);
      if (newDestPension) {
        newInputs.destinationPensionAge = newDestPension.eligibilityAge;
        newInputs.destinationPensionAmount = newDestPension.averageAnnualBenefit;
      }
    }
    
    // Auto-zero savings when "retiring now" (current age >= target age)
    if (field === 'currentAge' || field === 'targetRetirementAge') {
      const currentAge = field === 'currentAge' ? value : inputs.currentAge;
      const targetAge = field === 'targetRetirementAge' ? value : inputs.targetRetirementAge;
      if (currentAge >= targetAge) {
        newInputs.annualSavings = 0;
      }
    }
    
    onChange(newInputs);
  };

  const handleAccountChange = (accountKey: string, value: number | string) => {
    onChange({
      ...inputs,
      accounts: { ...inputs.accounts, [accountKey]: value },
    });
  };

  const handleAssetReturnChange = (assetType: 'stocks' | 'property' | 'crypto' | 'cash', rate: number) => {
    const updates: Partial<UserInputs> = {
      assetReturns: { 
        ...inputs.assetReturns,
        stocks: inputs.assetReturns?.stocks ?? inputs.expectedReturn,
        property: inputs.assetReturns?.property ?? (inputs.inflationRate + 0.02),
        crypto: inputs.assetReturns?.crypto ?? (inputs.expectedReturn + 0.03),
        cash: inputs.assetReturns?.cash ?? (inputs.inflationRate * 0.5),
        [assetType]: rate 
      },
    };
    // Keep expectedReturn in sync when stocks return changes
    if (assetType === 'stocks') {
      updates.expectedReturn = rate;
    }
    onChange({ ...inputs, ...updates });
  };

  // Default asset returns (for display)
  const defaultReturns = {
    stocks: inputs.expectedReturn,
    property: inputs.inflationRate + 0.02,
    crypto: inputs.expectedReturn + 0.03,
    cash: inputs.inflationRate * 0.5,
  };

  const countryOptions = Object.values(countries).map(c => ({
    value: c.code,
    label: `${c.flag} ${c.name}`,
  }));

  const currentAccountTypes = countryAccountTypes[inputs.currentCountry] || [];

  // Numeric input hooks for all text-style number inputs
  const currentAgeInput = useNumericInput(inputs.currentAge, (v) => handleChange('currentAge', v), { fallback: 30, integer: true });
  const retirementAgeInput = useNumericInput(inputs.targetRetirementAge, (v) => handleChange('targetRetirementAge', v), { fallback: 50, integer: true });
  const portfolioValueInput = useNumericInput(inputs.portfolioValue, (v) => handleChange('portfolioValue', v), { fallback: 0 });
  const annualSpendingInput = useNumericInput(inputs.annualSpending, (v) => handleChange('annualSpending', v), { fallback: 0 });
  const annualSavingsInput = useNumericInput(inputs.annualSavings, (v) => handleChange('annualSavings', v), { fallback: 0 });
  const pensionAgeInput = useNumericInput(inputs.statePensionAge || (statePension?.eligibilityAge ?? 67), (v) => handleChange('statePensionAge', v), { fallback: 67, integer: true });
  const pensionAmountInput = useNumericInput(inputs.statePensionAmount || (statePension?.averageAnnualBenefit ?? 0), (v) => handleChange('statePensionAmount', v), { fallback: 0 });
  const destPensionAgeInput = useNumericInput(inputs.destinationPensionAge || (destinationPension?.eligibilityAge ?? 66), (v) => handleChange('destinationPensionAge', v), { fallback: 66, integer: true });
  const destPensionAmountInput = useNumericInput(inputs.destinationPensionAmount || (destinationPension?.averageAnnualBenefit ?? 0), (v) => handleChange('destinationPensionAmount', v), { fallback: 0 });

  const getAccountValue = (accountId: string): number => {
    if (accountId.includes('pension') || accountId.includes('traditional') || accountId.includes('401k') || accountId.includes('ira') || accountId.includes('rrsp') || accountId.includes('super') || accountId.includes('per') || accountId.includes('pillar') || accountId.includes('cpf') || accountId.includes('afore')) {
      return inputs.traditionalRetirementAccounts;
    }
    if (accountId.includes('roth') || accountId.includes('isa') || accountId.includes('tfsa') || accountId.includes('srs') || accountId.includes('_av')) {
      return inputs.rothAccounts;
    }
    return inputs.taxableAccounts;
  };

  const setAccountValue = (accountId: string, value: number) => {
    if (accountId.includes('pension') || accountId.includes('traditional') || accountId.includes('401k') || accountId.includes('ira') || accountId.includes('rrsp') || accountId.includes('super') || accountId.includes('per') || accountId.includes('pillar') || accountId.includes('cpf') || accountId.includes('afore')) {
      handleChange('traditionalRetirementAccounts', value);
    } else if (accountId.includes('roth') || accountId.includes('isa') || accountId.includes('tfsa') || accountId.includes('srs') || accountId.includes('_av')) {
      handleChange('rothAccounts', value);
    } else {
      handleChange('taxableAccounts', value);
    }
  };

  const getCrossBorderWarning = (accountId: string): string | null => {
    const accountType = accountId.split('_').slice(0, 2).join('_');
    const treatmentKey = `${accountType}->${inputs.targetCountry}`;
    const treatment = crossBorderTreatment[treatmentKey];
    return treatment?.warning || null;
  };

  const totalAllocated = inputs.traditionalRetirementAccounts + inputs.rothAccounts + inputs.taxableAccounts + 
    (inputs.accounts?.crypto || 0) + (inputs.accounts?.cash || 0) + (inputs.accounts?.property || 0) + (inputs.accounts?.other || 0);
  
  const unallocated = Math.max(0, inputs.portfolioValue - totalAllocated + (inputs.accounts?.other || 0));

  return (
    <div className="space-y-6 sm:space-y-8">
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Adjust the inputs below. Results update instantly.</p>

      {/* Age Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Age</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Age</label>
            <input
              type="text" inputMode="numeric"
              value={currentAgeInput.value}
              onChange={currentAgeInput.onChange}
              onFocus={currentAgeInput.onFocus}
              onBlur={currentAgeInput.onBlur}
              className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Retirement
              <Tooltip text="The age you want to stop working and live off investments" />
            </label>
            <input
              type="text" inputMode="numeric"
              value={retirementAgeInput.value}
              onChange={retirementAgeInput.onChange}
              onFocus={retirementAgeInput.onFocus}
              onBlur={retirementAgeInput.onBlur}
              className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Location</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Country</label>
            <select
              value={inputs.currentCountry}
              onChange={(e) => handleChange('currentCountry', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Retirement Country
              <Tooltip text="Where you plan to live during retirement" />
            </label>
            <select
              value={inputs.targetCountry}
              onChange={(e) => handleChange('targetCountry', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* US State Selector - only show when US is selected */}
        {(inputs.currentCountry === 'US' || inputs.targetCountry === 'US') && (
          <div className="mt-3">
            <USStateSelector 
              value={inputs.usState || ''} 
              onChange={(state) => handleChange('usState', state)}
            />
          </div>
        )}
      </section>

      {/* Portfolio Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Portfolio</h3>
        
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total Portfolio Value
            <Tooltip text="Total value of all investments and retirement accounts" />
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border border-r-0 border-gray-300 dark:border-slate-600 rounded-l-lg">
              {currentCountry?.currencySymbol} {inputs.portfolioCurrency}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={portfolioValueInput.value}
              onChange={portfolioValueInput.onChange}
              onFocus={portfolioValueInput.onFocus}
              onBlur={portfolioValueInput.onBlur}
              className="flex-1 min-w-0 px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          {totalAllocated > inputs.portfolioValue && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Over-allocated by {formatCurrency(totalAllocated - inputs.portfolioValue, inputs.portfolioCurrency)}
            </p>
          )}
        </div>

        {/* Account Types with improved sliders */}
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              {currentCountry?.flag} <span className="uppercase">{currentCountry?.name} Accounts</span>
            </h4>
            <div className="space-y-4">
              {currentAccountTypes.map((account) => {
                const warning = !isSameCountry ? getCrossBorderWarning(account.id) : null;
                const value = getAccountValue(account.id);
                return (
                  <MoneySlider
                    key={account.id}
                    value={value}
                    onChange={(v) => setAccountValue(account.id, v)}
                    max={inputs.portfolioValue}
                    label={account.shortName}
                    icon={account.icon}
                    currency={inputs.portfolioCurrency}
                    tooltip={account.description}
                    warning={warning}
                    unallocated={unallocated}
                    returnRate={inputs.assetReturns?.stocks}
                    defaultReturnRate={defaultReturns.stocks}
                    onReturnRateChange={(r) => handleAssetReturnChange('stocks', r)}
                  />
                );
              })}
            </div>
          </div>

          {/* Other Assets */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">🌐 Other Assets</h4>
            <div className="space-y-4">
              <MoneySlider
                value={inputs.accounts?.crypto || 0}
                onChange={(v) => handleAccountChange('crypto', v)}
                max={inputs.portfolioValue}
                label="Crypto"
                icon="₿"
                currency={inputs.portfolioCurrency}
                tooltip="Cryptocurrency holdings (Bitcoin, Ethereum, etc.)"
                unallocated={unallocated}
                returnRate={inputs.assetReturns?.crypto}
                defaultReturnRate={defaultReturns.crypto}
                onReturnRateChange={(r) => handleAssetReturnChange('crypto', r)}
              />
              <MoneySlider
                value={inputs.accounts?.cash || 0}
                onChange={(v) => handleAccountChange('cash', v)}
                max={inputs.portfolioValue}
                label="Cash"
                icon="💵"
                currency={inputs.portfolioCurrency}
                tooltip="Cash and cash equivalents"
                unallocated={unallocated}
                returnRate={inputs.assetReturns?.cash}
                defaultReturnRate={defaultReturns.cash}
                onReturnRateChange={(r) => handleAssetReturnChange('cash', r)}
              />
              <MoneySlider
                value={inputs.accounts?.property || 0}
                onChange={(v) => handleAccountChange('property', v)}
                max={inputs.portfolioValue}
                label="Property"
                icon="🏠"
                currency={inputs.portfolioCurrency}
                tooltip="Real estate equity (home value minus mortgage)"
                unallocated={unallocated}
                returnRate={inputs.assetReturns?.property}
                defaultReturnRate={defaultReturns.property}
                onReturnRateChange={(r) => handleAssetReturnChange('property', r)}
              />
              
              {/* Auto-calculating Other/Unallocated field */}
              <OtherAssetField
                value={inputs.accounts?.other || 0}
                unallocated={unallocated}
                onChange={(v) => handleAccountChange('other', v)}
                label={inputs.accounts?.otherLabel || ''}
                onLabelChange={(label) => handleAccountChange('otherLabel', label)}
                currency={inputs.portfolioCurrency}
                currencySymbol={currentCountry?.currencySymbol || '$'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Spending & Savings Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Spending & Savings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Annual Spending (after tax)
              <Tooltip text="Your target NET spending in retirement. We'll calculate the gross withdrawal needed to cover taxes." />
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border border-r-0 border-gray-300 dark:border-slate-600 rounded-l-lg">
                {currentCountry?.currencySymbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={annualSpendingInput.value}
                onChange={annualSpendingInput.onChange}
                onFocus={annualSpendingInput.onFocus}
                onBlur={annualSpendingInput.onBlur}
                className="flex-1 min-w-0 px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              💡 This is what you'll actually spend. Gross withdrawal will be higher to cover taxes.
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Annual Savings (while working)
              <Tooltip text="How much you save and invest each year before retirement" />
            </label>
            {inputs.currentAge >= inputs.targetRetirementAge ? (
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  💡 Set to $0 — you're retiring now!
                </p>
              </div>
            ) : (
              <>
                <div className="flex">
                  <span className="inline-flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border border-r-0 border-gray-300 dark:border-slate-600 rounded-l-lg">
                    {currentCountry?.currencySymbol}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={annualSavingsInput.value}
                    onChange={annualSavingsInput.onChange}
                    onFocus={annualSavingsInput.onFocus}
                    onBlur={annualSavingsInput.onBlur}
                    className="flex-1 min-w-0 px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Set target age = current age to check if you can retire today
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Government Pensions Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Government Pensions</h3>
        
        {/* Origin Country Pension (from leaving country) */}
        {statePension ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 sm:p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                🏛️ {statePension.name}
                <span className="text-[10px] text-gray-500 dark:text-gray-400">({currentCountry?.name})</span>
                <Tooltip text={statePension.notes} />
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.expectStatePension || false}
                  onChange={(e) => handleChange('expectStatePension', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {inputs.expectStatePension && (
              <div className="space-y-3 mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Age</label>
                    <input
                      type="text" inputMode="numeric"
                      value={pensionAgeInput.value}
                      onChange={pensionAgeInput.onChange}
                      onFocus={pensionAgeInput.onFocus}
                      onBlur={pensionAgeInput.onBlur}
                      className="w-full px-2 py-1.5 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Annual Amount</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border border-r-0 border-gray-300 dark:border-slate-600 rounded-l-lg">
                        {currentCountry?.currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pensionAmountInput.value}
                        onChange={pensionAmountInput.onChange}
                        onFocus={pensionAmountInput.onFocus}
                        onBlur={pensionAmountInput.onBlur}
                        className="flex-1 min-w-0 px-2 py-1.5 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">
                  💡 Average: {formatCurrency(statePension.averageAnnualBenefit, statePension.currency)}/yr • 
                  Max: {formatCurrency(statePension.maxAnnualBenefit, statePension.currency)}/yr • 
                  Eligible at {statePension.eligibilityAge}
                </p>
                {!statePension.canClaimAbroad && !isSameCountry && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                    ⚠️ {statePension.name} may have restrictions for claiming while living abroad. Verify your eligibility.
                  </p>
                )}
              </div>
            )}
            
            {!inputs.expectStatePension && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You may be eligible for {formatCurrency(statePension.averageAnnualBenefit, statePension.currency)}/yr starting at age {statePension.eligibilityAge}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 mb-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-lg">🏛️</span>
              <div>
                <p className="text-xs sm:text-sm font-medium">No pension data for {currentCountry?.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  Data may not be available or country may not have a public pension system.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Destination Country Pension (only show if different from origin) */}
        {!isSameCountry && destinationPension && (
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                🏛️ {destinationPension.name}
                <span className="text-[10px] text-gray-500 dark:text-gray-400">({targetCountry?.name})</span>
                <Tooltip text={`${destinationPension.notes} You may be eligible if you're a citizen or have worked/contributed in ${targetCountry?.name}.`} />
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.expectDestinationPension || false}
                  onChange={(e) => handleChange('expectDestinationPension', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {inputs.expectDestinationPension && (
              <div className="space-y-3 mt-3 pt-3 border-t border-green-100 dark:border-green-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Age</label>
                    <input
                      type="text" inputMode="numeric"
                      value={destPensionAgeInput.value}
                      onChange={destPensionAgeInput.onChange}
                      onFocus={destPensionAgeInput.onFocus}
                      onBlur={destPensionAgeInput.onBlur}
                      className="w-full px-2 py-1.5 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Annual Amount</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border border-r-0 border-gray-300 dark:border-slate-600 rounded-l-lg">
                        {targetCountry?.currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={destPensionAmountInput.value}
                        onChange={destPensionAmountInput.onChange}
                        onFocus={destPensionAmountInput.onFocus}
                        onBlur={destPensionAmountInput.onBlur}
                        className="flex-1 min-w-0 px-2 py-1.5 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-green-600 dark:text-green-400">
                  💡 Average: {formatCurrency(destinationPension.averageAnnualBenefit, destinationPension.currency)}/yr • 
                  Max: {formatCurrency(destinationPension.maxAnnualBenefit, destinationPension.currency)}/yr • 
                  Eligible at {destinationPension.eligibilityAge}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                  ⚠️ Eligibility depends on citizenship, residency, or contribution history. Verify with official sources.
                </p>
              </div>
            )}
            
            {!inputs.expectDestinationPension && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If you're a {targetCountry?.name} citizen or have contribution history, you may be eligible for {formatCurrency(destinationPension.averageAnnualBenefit, destinationPension.currency)}/yr at age {destinationPension.eligibilityAge}
              </p>
            )}
          </div>
        )}
        
        {!isSameCountry && !destinationPension && (
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-lg">🏛️</span>
              <div>
                <p className="text-xs sm:text-sm font-medium">No pension data for {targetCountry?.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  Data may not be available or country may not have a public pension system.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Advanced Settings */}
      <AdvancedSettings inputs={inputs} onChange={handleChange} />
    </div>
  );
}

function AdvancedSettings({ inputs, onChange }: { inputs: UserInputs; onChange: (field: keyof UserInputs, value: any) => void }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border-t border-gray-200 dark:border-slate-700 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Advanced Settings</h3>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                Expected Return (Stocks)
                <Tooltip text="Expected annual return for stocks/equities. Property grows at ~inflation+2%, crypto at this rate+3%, cash at ~0% real." />
              </label>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{((inputs.assetReturns?.stocks ?? inputs.expectedReturn) * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="-0.05"
              max="0.20"
              step="0.005"
              value={inputs.assetReturns?.stocks ?? inputs.expectedReturn}
              onChange={(e) => onChange('expectedReturn', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Blended return calculated from your asset mix (stocks, property, crypto, cash)
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                Inflation Rate
                <Tooltip text="Expected annual inflation rate" />
              </label>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(inputs.inflationRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.08"
              step="0.005"
              value={inputs.inflationRate}
              onChange={(e) => onChange('inflationRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                Safe Withdrawal Rate
                <Tooltip text="Percentage of portfolio to withdraw annually. 4% is the traditional rule." />
              </label>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(inputs.safeWithdrawalRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.06"
              step="0.0025"
              value={inputs.safeWithdrawalRate}
              onChange={(e) => onChange('safeWithdrawalRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    // Small delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [show]);

  return (
    <span ref={ref} className="relative inline-block ml-0.5">
      <span 
        className="text-gray-400 dark:text-gray-500 cursor-help text-xs select-none"
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
      >ⓘ</span>
      {show && (
        <span className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 px-2.5 py-1.5 text-[10px] sm:text-xs text-white bg-gray-800 dark:bg-slate-700 rounded-lg shadow-lg z-50 w-48 sm:w-64 text-left sm:text-center leading-relaxed max-w-[calc(100vw-3rem)] animate-fade-in">
          {text}
          <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 border-[6px] border-transparent border-t-gray-800 dark:border-t-slate-700" />
        </span>
      )}
    </span>
  );
}
