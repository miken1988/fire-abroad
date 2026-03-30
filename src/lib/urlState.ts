import { UserInputs } from './calculations';
import { countries } from '@/data/countries';

// Safe parsing helpers
function safeParseInt(value: string | null, fallback: number, min?: number, max?: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value);
  if (isNaN(parsed)) return fallback;
  if (min !== undefined && parsed < min) return fallback;
  if (max !== undefined && parsed > max) return fallback;
  return parsed;
}

function safeParseFloat(value: string | null, fallback: number, min?: number): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return fallback;
  if (min !== undefined && parsed < min) return fallback;
  return parsed;
}

function safeParseCountry(value: string | null, fallback: string): string {
  if (!value) return fallback;
  // Validate country exists
  if (countries[value]) return value;
  return fallback;
}

export function encodeStateToURL(inputs: UserInputs): string {
  const params = new URLSearchParams();
  
  params.set('age', inputs.currentAge.toString());
  params.set('ret', inputs.targetRetirementAge.toString());
  params.set('from', inputs.currentCountry);
  // Support multi-country: comma-separated target codes
  if (inputs.targetCountries && inputs.targetCountries.length > 1) {
    params.set('to', inputs.targetCountries.join(','));
  } else {
    params.set('to', inputs.targetCountry);
  }
  if (inputs.usState) params.set('state', inputs.usState);
  params.set('pv', inputs.portfolioValue.toString());
  params.set('pc', inputs.portfolioCurrency);
  params.set('spend', inputs.annualSpending.toString());
  params.set('trad', inputs.traditionalRetirementAccounts.toString());
  params.set('roth', inputs.rothAccounts.toString());
  params.set('tax', inputs.taxableAccounts.toString());
  params.set('crypto', (inputs.accounts?.crypto || 0).toString());
  params.set('cash', (inputs.accounts?.cash || 0).toString());
  params.set('prop', (inputs.accounts?.property || 0).toString());
  if (inputs.annualSavings) params.set('save', inputs.annualSavings.toString());
  
  // Origin country pension params
  if (inputs.expectStatePension) {
    params.set('pension', '1');
    params.set('pensionAmt', inputs.statePensionAmount.toString());
    params.set('pensionAge', inputs.statePensionAge.toString());
  }
  
  // Destination country pension params
  if (inputs.expectDestinationPension) {
    params.set('destPension', '1');
    params.set('destPensionAmt', (inputs.destinationPensionAmount || 0).toString());
    params.set('destPensionAge', (inputs.destinationPensionAge || 66).toString());
  }

  // Passive income params (only encode non-zero values)
  const pi = inputs.passiveIncome;
  if (pi) {
    if (pi.rental > 0) { params.set('piR', pi.rental.toString()); params.set('piRY', pi.rentalYears.toString()); }
    if (pi.freelance > 0) { params.set('piF', pi.freelance.toString()); params.set('piFY', pi.freelanceYears.toString()); }
    if (pi.other > 0) { params.set('piO', pi.other.toString()); params.set('piOY', pi.otherYears.toString()); }
  }

  return params.toString();
}

export function decodeStateFromURL(params: URLSearchParams, defaults: UserInputs): UserInputs {
  const inputs = { ...defaults };
  
  // Parse with validation - invalid values fall back to defaults
  inputs.currentAge = safeParseInt(params.get('age'), defaults.currentAge, 1, 120);
  inputs.targetRetirementAge = safeParseInt(params.get('ret'), defaults.targetRetirementAge, 1, 120);
  inputs.currentCountry = safeParseCountry(params.get('from'), defaults.currentCountry);
  // Support multi-country: comma-separated target codes
  const toParam = params.get('to') || '';
  if (toParam.includes(',')) {
    const codes = toParam.split(',').map(c => c.trim()).filter(c => countries[c]);
    if (codes.length > 0) {
      inputs.targetCountry = codes[0];
      inputs.targetCountries = codes.slice(0, 5);
    } else {
      inputs.targetCountry = safeParseCountry(null, defaults.targetCountry);
    }
  } else {
    inputs.targetCountry = safeParseCountry(toParam || null, defaults.targetCountry);
    inputs.targetCountries = [inputs.targetCountry];
  }
  if (params.get('state')) inputs.usState = params.get('state')!;
  
  inputs.portfolioValue = safeParseFloat(params.get('pv'), defaults.portfolioValue, 0);
  if (params.get('pc')) {
    inputs.portfolioCurrency = params.get('pc')!;
    inputs.spendingCurrency = params.get('pc')!;
  }
  inputs.annualSpending = safeParseFloat(params.get('spend'), defaults.annualSpending, 0);
  inputs.traditionalRetirementAccounts = safeParseFloat(params.get('trad'), defaults.traditionalRetirementAccounts, 0);
  inputs.rothAccounts = safeParseFloat(params.get('roth'), defaults.rothAccounts, 0);
  inputs.taxableAccounts = safeParseFloat(params.get('tax'), defaults.taxableAccounts, 0);
  
  // Accounts (crypto, cash, property)
  if (params.get('crypto') || params.get('cash') || params.get('prop')) {
    inputs.accounts = { 
      ...inputs.accounts, 
      crypto: safeParseFloat(params.get('crypto'), 0, 0),
      cash: safeParseFloat(params.get('cash'), 0, 0),
      property: safeParseFloat(params.get('prop'), 0, 0),
    };
  }
  inputs.annualSavings = safeParseFloat(params.get('save'), defaults.annualSavings, 0);
  
  // Origin country pension params
  if (params.get('pension') === '1') {
    inputs.expectStatePension = true;
    inputs.statePensionAmount = safeParseFloat(params.get('pensionAmt'), defaults.statePensionAmount, 0);
    inputs.statePensionAge = safeParseInt(params.get('pensionAge'), defaults.statePensionAge, 50, 100);
  }
  
  // Destination country pension params
  if (params.get('destPension') === '1') {
    inputs.expectDestinationPension = true;
    inputs.destinationPensionAmount = safeParseFloat(params.get('destPensionAmt'), 0, 0);
    inputs.destinationPensionAge = safeParseInt(params.get('destPensionAge'), 66, 50, 100);
  }

  // Passive income params
  const piR = safeParseFloat(params.get('piR'), 0, 0);
  const piF = safeParseFloat(params.get('piF'), 0, 0);
  const piO = safeParseFloat(params.get('piO'), 0, 0);
  if (piR > 0 || piF > 0 || piO > 0) {
    inputs.passiveIncome = {
      rental: piR,
      rentalYears: safeParseInt(params.get('piRY'), 0, 0, 100),
      freelance: piF,
      freelanceYears: safeParseInt(params.get('piFY'), 0, 0, 100),
      other: piO,
      otherYears: safeParseInt(params.get('piOY'), 0, 0, 100),
    };
  }

  return inputs;
}

export function getShareableURL(inputs: UserInputs): string {
  const params = encodeStateToURL(inputs);
  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://www.wheretofire.com';
  return `${baseURL}?${params}`;
}
