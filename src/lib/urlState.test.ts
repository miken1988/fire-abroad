import { encodeStateToURL, decodeStateFromURL } from './urlState';
import { UserInputs } from './calculations';

const defaultInputs: UserInputs = {
  currentAge: 35,
  targetRetirementAge: 50,
  currentCountry: 'US',
  targetCountry: 'PT',
  portfolioValue: 500000,
  portfolioCurrency: 'USD',
  portfolioAllocation: { stocks: 80, bonds: 10, cash: 5, crypto: 5, property: 0 },
  accounts: { taxDeferred: 0, taxFree: 0, taxable: 0, crypto: 0, cash: 0, property: 0, other: 0, otherLabel: '' },
  traditionalRetirementAccounts: 200000,
  rothAccounts: 100000,
  taxableAccounts: 200000,
  propertyEquity: 0,
  annualSpending: 40000,
  spendingCurrency: 'USD',
  annualSavings: 20000,
  expectStatePension: false,
  statePensionAmount: 0,
  statePensionAge: 67,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  safeWithdrawalRate: 0.04,
};

describe('encodeStateToURL', () => {
  it('encodes basic inputs', () => {
    const encoded = encodeStateToURL(defaultInputs);
    expect(encoded).toContain('age=35');
    expect(encoded).toContain('ret=50');
    expect(encoded).toContain('from=US');
    expect(encoded).toContain('to=PT');
  });

  it('encodes pension parameters when enabled', () => {
    const inputsWithPension = {
      ...defaultInputs,
      expectStatePension: true,
      statePensionAmount: 24000,
      statePensionAge: 67,
    };
    const encoded = encodeStateToURL(inputsWithPension);
    expect(encoded).toContain('pension=1');
    expect(encoded).toContain('pensionAmt=24000');
    expect(encoded).toContain('pensionAge=67');
  });
});

describe('decodeStateFromURL', () => {
  it('decodes valid URL parameters', () => {
    const params = new URLSearchParams('age=40&ret=55&from=US&to=MX&pv=1000000&spend=50000');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentAge).toBe(40);
    expect(decoded.targetRetirementAge).toBe(55);
    expect(decoded.currentCountry).toBe('US');
    expect(decoded.targetCountry).toBe('MX');
    expect(decoded.portfolioValue).toBe(1000000);
    expect(decoded.annualSpending).toBe(50000);
  });

  it('falls back to defaults for invalid age', () => {
    const params = new URLSearchParams('age=abc&ret=50');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentAge).toBe(35); // default
    expect(decoded.targetRetirementAge).toBe(50); // valid
  });

  it('falls back to defaults for out-of-range age', () => {
    const params = new URLSearchParams('age=-5&ret=200');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentAge).toBe(35); // default (was -5)
    expect(decoded.targetRetirementAge).toBe(50); // default (was 200, which is > 120)
  });

  it('falls back to defaults for invalid country', () => {
    const params = new URLSearchParams('from=INVALID&to=FAKE');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentCountry).toBe('US'); // default
    expect(decoded.targetCountry).toBe('PT'); // default
  });

  it('falls back to defaults for negative portfolio', () => {
    const params = new URLSearchParams('pv=-500000');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.portfolioValue).toBe(500000); // default
  });

  it('handles NaN in financial values', () => {
    const params = new URLSearchParams('pv=notanumber&spend=also_not_a_number');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.portfolioValue).toBe(500000); // default
    expect(decoded.annualSpending).toBe(40000); // default
  });

  it('handles empty URL params', () => {
    const params = new URLSearchParams('');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentAge).toBe(35);
    expect(decoded.targetRetirementAge).toBe(50);
    expect(decoded.currentCountry).toBe('US');
  });

  it('decodes pension parameters', () => {
    const params = new URLSearchParams('pension=1&pensionAmt=30000&pensionAge=65');
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.expectStatePension).toBe(true);
    expect(decoded.statePensionAmount).toBe(30000);
    expect(decoded.statePensionAge).toBe(65);
  });

  it('round-trips correctly', () => {
    const original = {
      ...defaultInputs,
      currentAge: 42,
      targetRetirementAge: 55,
      portfolioValue: 750000,
      annualSpending: 60000,
    };
    
    const encoded = encodeStateToURL(original);
    const params = new URLSearchParams(encoded);
    const decoded = decodeStateFromURL(params, defaultInputs);
    
    expect(decoded.currentAge).toBe(42);
    expect(decoded.targetRetirementAge).toBe(55);
    expect(decoded.portfolioValue).toBe(750000);
    expect(decoded.annualSpending).toBe(60000);
  });
});
