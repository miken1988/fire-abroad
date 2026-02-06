'use client';

import { UserInputs } from '@/lib/calculations';
import { countries, countryAccountTypes, crossBorderTreatment } from '@/data/countries';
import { getStatePension } from '@/data/statePensions';
import { formatCurrency } from '@/lib/formatters';
import { useState, useCallback } from 'react';

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

  const onFocus = () => {
    // Show raw number without commas for easy editing
    setDraft(String(value));
    setEditing(true);
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
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
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
            className="w-24 sm:w-28 px-2 py-1 text-right text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

interface InputPanelProps {
  inputs: UserInputs;
  onChange: (inputs: UserInputs) => void;
}

export function InputPanel({ inputs, onChange }: InputPanelProps) {
  const currentCountry = countries[inputs.currentCountry];
  const targetCountry = countries[inputs.targetCountry];
  const isSameCountry = inputs.currentCountry === inputs.targetCountry;
  const statePension = getStatePension(inputs.currentCountry);

  const handleChange = (field: keyof UserInputs, value: any) => {
    const newInputs = { ...inputs, [field]: value };
    
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

  const getAccountValue = (accountId: string): number => {
    if (accountId.includes('pension') || accountId.includes('traditional') || accountId.includes('401k') || accountId.includes('ira') || accountId.includes('rrsp') || accountId.includes('super') || accountId.includes('per') || accountId.includes('pillar') || accountId.includes('cpf') || accountId.includes('afore')) {
      return inputs.traditionalRetirementAccounts;
    }
    if (accountId.includes('roth') || accountId.includes('isa') || accountId.includes('tfsa') || accountId.includes('srs')) {
      return inputs.rothAccounts;
    }
    return inputs.taxableAccounts;
  };

  const setAccountValue = (accountId: string, value: number) => {
    if (accountId.includes('pension') || accountId.includes('traditional') || accountId.includes('401k') || accountId.includes('ira') || accountId.includes('rrsp') || accountId.includes('super') || accountId.includes('per') || accountId.includes('pillar') || accountId.includes('cpf') || accountId.includes('afore')) {
      handleChange('traditionalRetirementAccounts', value);
    } else if (accountId.includes('roth') || accountId.includes('isa') || accountId.includes('tfsa') || accountId.includes('srs')) {
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
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Details</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Adjust the inputs below. Results update instantly.</p>
      </div>

      {/* Age Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Age</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Age</label>
            <input
              type="number"
              value={currentAgeInput.value}
              onChange={currentAgeInput.onChange}
              onFocus={currentAgeInput.onFocus}
              onBlur={currentAgeInput.onBlur}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Retirement
              <Tooltip text="The age you want to stop working and live off investments" />
            </label>
            <input
              type="number"
              value={retirementAgeInput.value}
              onChange={retirementAgeInput.onChange}
              onFocus={retirementAgeInput.onFocus}
              onBlur={retirementAgeInput.onBlur}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
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
              className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
              Annual Spending in Retirement
              <Tooltip text="How much you plan to spend per year in retirement" />
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
                className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
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
                    className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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

      {/* State Pension Section */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">State Pension</h3>
        {statePension ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                🏛️ {statePension.name}
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
                      type="number"
                      value={pensionAgeInput.value}
                      onChange={pensionAgeInput.onChange}
                      onFocus={pensionAgeInput.onFocus}
                      onBlur={pensionAgeInput.onBlur}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
                        className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-lg">🏛️</span>
              <div>
                <p className="text-xs sm:text-sm font-medium">No state pension data available</p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  {currentCountry?.name} may not have a public pension system, or data is not yet available.
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
                Expected Return
                <Tooltip text="Expected annual investment return before inflation" />
              </label>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(inputs.expectedReturn * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.005"
              value={inputs.expectedReturn}
              onChange={(e) => onChange('expectedReturn', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
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
  return (
    <span className="group relative inline-block ml-0.5">
      <span className="text-gray-400 dark:text-gray-500 cursor-help text-xs">ⓘ</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] sm:text-xs text-white bg-gray-800 dark:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 max-w-[200px] sm:max-w-xs text-center">
        {text}
      </span>
    </span>
  );
}
