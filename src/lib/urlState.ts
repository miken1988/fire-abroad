import { UserInputs } from './calculations';

export function encodeStateToURL(inputs: UserInputs): string {
  const params = new URLSearchParams();
  
  params.set('age', inputs.currentAge.toString());
  params.set('ret', inputs.targetRetirementAge.toString());
  params.set('from', inputs.currentCountry);
  params.set('to', inputs.targetCountry);
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
  
  return params.toString();
}

export function decodeStateFromURL(params: URLSearchParams, defaults: UserInputs): UserInputs {
  const inputs = { ...defaults };
  
  if (params.get('age')) inputs.currentAge = parseInt(params.get('age')!);
  if (params.get('ret')) inputs.targetRetirementAge = parseInt(params.get('ret')!);
  if (params.get('from')) inputs.currentCountry = params.get('from')!;
  if (params.get('to')) inputs.targetCountry = params.get('to')!;
  if (params.get('state')) inputs.usState = params.get('state')!;
  if (params.get('pv')) inputs.portfolioValue = parseFloat(params.get('pv')!);
  if (params.get('pc')) {
    inputs.portfolioCurrency = params.get('pc')!;
    inputs.spendingCurrency = params.get('pc')!;
  }
  if (params.get('spend')) inputs.annualSpending = parseFloat(params.get('spend')!);
  if (params.get('trad')) inputs.traditionalRetirementAccounts = parseFloat(params.get('trad')!);
  if (params.get('roth')) inputs.rothAccounts = parseFloat(params.get('roth')!);
  if (params.get('tax')) inputs.taxableAccounts = parseFloat(params.get('tax')!);
  
  // Accounts (crypto, cash, property)
  if (params.get('crypto') || params.get('cash') || params.get('prop')) {
    inputs.accounts = { 
      ...inputs.accounts, 
      crypto: parseFloat(params.get('crypto') || '0'),
      cash: parseFloat(params.get('cash') || '0'),
      property: parseFloat(params.get('prop') || '0'),
    };
  }
  if (params.get('save')) inputs.annualSavings = parseFloat(params.get('save')!);
  
  // Origin country pension params
  if (params.get('pension') === '1') {
    inputs.expectStatePension = true;
    if (params.get('pensionAmt')) inputs.statePensionAmount = parseFloat(params.get('pensionAmt')!);
    if (params.get('pensionAge')) inputs.statePensionAge = parseInt(params.get('pensionAge')!);
  }
  
  // Destination country pension params
  if (params.get('destPension') === '1') {
    inputs.expectDestinationPension = true;
    if (params.get('destPensionAmt')) inputs.destinationPensionAmount = parseFloat(params.get('destPensionAmt')!);
    if (params.get('destPensionAge')) inputs.destinationPensionAge = parseInt(params.get('destPensionAge')!);
  }
  
  return inputs;
}

export function getShareableURL(inputs: UserInputs): string {
  const params = encodeStateToURL(inputs);
  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://fireabroad.com';
  return `${baseURL}?${params}`;
}
