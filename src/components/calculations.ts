import { countries, TaxBracket } from '@/data/countries';
import { convertCurrency } from './currency';

export interface UserInputs {
  currentAge: number;
  targetRetirementAge: number;
  currentCountry: string;
  targetCountry: string;
  
  portfolioValue: number;
  portfolioCurrency: string;
  portfolioAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
    crypto: number;
    property: number;
  };
  
  accounts: {
    taxDeferred: number;
    taxFree: number;
    taxable: number;
    crypto: number;
    cash: number;
    property: number;
  };
  
  traditionalRetirementAccounts: number;
  rothAccounts: number;
  taxableAccounts: number;
  propertyEquity: number;
  
  annualSpending: number;
  spendingCurrency: string;
  
  annualSavings: number;
  
  expectedReturn: number;
  inflationRate: number;
  safeWithdrawalRate: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  portfolioStart: number;
  growth: number;
  savings: number;
  withdrawal: number;
  taxPaid: number;
  portfolioEnd: number;
  isRetired: boolean;
}

export interface FIREResult {
  fireNumber: number;
  fireNumberUSD: number;
  yearsUntilFIRE: number;
  fireAge: number;
  canRetire: boolean;
  effectiveTaxRate: number;
  annualWithdrawalGross: number;
  annualWithdrawalNet: number;
  projections: YearlyProjection[];
  warnings: string[];
  countrySpecificNotes: string[];
}

export interface ComparisonSummary {
  fireNumberDifferenceUSD: number;
  fireNumberDifferencePercent: number;
  taxRateDifference: number;
  lowerFIRENumber: string;
  lowerEffectiveTaxRate: string;
  earlierRetirement: string;
}

function calculateTax(income: number, brackets: TaxBracket[], country: typeof countries[string]): number {
  if (income <= 0) return 0;
  
  let tax = 0;
  let remainingIncome = income;
  
  for (const bracket of brackets) {
    const taxableInBracket = Math.min(
      remainingIncome,
      (bracket.max || Infinity) - bracket.min
    );
    
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    
    if (remainingIncome <= 0) break;
  }
  
  return tax;
}

function getCountrySpecificNotes(countryCode: string, inputs: UserInputs): string[] {
  const notes: string[] = [];
  const country = countries[countryCode];
  
  if (!country) return notes;
  
  if (country.capitalGains.crypto !== undefined && inputs.accounts?.crypto > 0) {
    if (country.capitalGains.crypto === 0) {
      notes.push(`${country.name} has NO capital gains tax on crypto!`);
    } else {
      const rate = country.capitalGains.crypto * 100;
      notes.push(`Crypto is subject to ${rate}% capital gains tax in ${country.name}.`);
    }
  }
  
  if (country.capitalGains.longTerm === 0) {
    notes.push(`${country.name} has NO capital gains tax on private investments!`);
  }
  
  if (country.specialRegimes && country.specialRegimes.length > 0) {
    country.specialRegimes.forEach(regime => {
      notes.push(`${regime.name}: ${regime.description}`);
    });
  }
  
  if (country.taxTreaties) {
    if (inputs.currentCountry === 'US' && country.taxTreaties.us) {
      notes.push(`US-${country.name} tax treaty may reduce withholding on dividends/interest.`);
    }
  }
  
  return notes;
}

export function calculateFIRE(inputs: UserInputs, targetCountryCode: string): FIREResult {
  const country = countries[targetCountryCode];
  if (!country) {
    throw new Error(`Country ${targetCountryCode} not found`);
  }
  
  const portfolioInLocalCurrency = convertCurrency(
    inputs.portfolioValue,
    inputs.portfolioCurrency,
    country.currency
  );
  
  const annualSpendingLocal = convertCurrency(
    inputs.annualSpending,
    inputs.spendingCurrency,
    country.currency
  );
  
  const annualSavingsLocal = convertCurrency(
    inputs.annualSavings || 0,
    inputs.portfolioCurrency,
    country.currency
  );
  
  const grossWithdrawalNeeded = annualSpendingLocal / (1 - estimateEffectiveTaxRate(annualSpendingLocal, country));
  const fireNumber = grossWithdrawalNeeded / inputs.safeWithdrawalRate;
  
  const fireNumberUSD = convertCurrency(fireNumber, country.currency, 'USD');
  
  const projections: YearlyProjection[] = [];
  let currentPortfolio = portfolioInLocalCurrency;
  let hasRetired = false;
  let fireAge = 0;
  let yearsUntilFIRE = -1;
  
  const realReturn = inputs.expectedReturn - inputs.inflationRate;
  
  for (let year = 0; year <= 50; year++) {
    const age = inputs.currentAge + year;
    const portfolioStart = currentPortfolio;
    
    const isRetired = hasRetired || (age >= inputs.targetRetirementAge && currentPortfolio >= fireNumber);
    
    if (isRetired && !hasRetired) {
      hasRetired = true;
      fireAge = age;
      yearsUntilFIRE = year;
    }
    
    const growth = portfolioStart * realReturn;
    
    const savingsThisYear = isRetired ? 0 : annualSavingsLocal;
    
    let withdrawal = 0;
    let taxPaid = 0;
    
    if (isRetired) {
      withdrawal = grossWithdrawalNeeded;
      taxPaid = calculateTax(withdrawal, country.incomeTax.brackets, country);
    }
    
    const portfolioEnd = Math.max(0, portfolioStart + growth + savingsThisYear - withdrawal);
    
    projections.push({
      year,
      age,
      portfolioStart,
      growth,
      savings: savingsThisYear,
      withdrawal,
      taxPaid,
      portfolioEnd,
      isRetired
    });
    
    currentPortfolio = portfolioEnd;
    
    if (portfolioEnd <= 0 && isRetired) {
      break;
    }
  }
  
  const canRetire = yearsUntilFIRE >= 0 || currentPortfolio >= fireNumber;
  
  if (!canRetire && annualSavingsLocal > 0) {
    let tempPortfolio = portfolioInLocalCurrency;
    for (let y = 0; y <= 50; y++) {
      tempPortfolio = tempPortfolio * (1 + realReturn) + annualSavingsLocal;
      if (tempPortfolio >= fireNumber) {
        yearsUntilFIRE = y + 1;
        fireAge = inputs.currentAge + yearsUntilFIRE;
        break;
      }
    }
  }
  
  const effectiveTaxRate = estimateEffectiveTaxRate(grossWithdrawalNeeded, country);
  
  const warnings: string[] = [];
  const depletionYear = projections.find(p => p.portfolioEnd <= 0 && p.isRetired);
  if (depletionYear) {
    warnings.push(`Portfolio depleted at age ${depletionYear.age}`);
  }
  
  const countrySpecificNotes = getCountrySpecificNotes(targetCountryCode, inputs);
  
  return {
    fireNumber,
    fireNumberUSD,
    yearsUntilFIRE: Math.max(0, yearsUntilFIRE),
    fireAge,
    canRetire: yearsUntilFIRE >= 0,
    effectiveTaxRate,
    annualWithdrawalGross: grossWithdrawalNeeded,
    annualWithdrawalNet: annualSpendingLocal,
    projections,
    warnings,
    countrySpecificNotes
  };
}

function estimateEffectiveTaxRate(income: number, country: typeof countries[string]): number {
  if (income <= 0) return 0;
  const tax = calculateTax(income, country.incomeTax.brackets, country);
  return tax / income;
}

export function compareFIRE(inputs: UserInputs, country1Code: string, country2Code: string): {
  country1: FIREResult;
  country2: FIREResult;
  comparison: ComparisonSummary;
} {
  const country1 = calculateFIRE(inputs, country1Code);
  const country2 = calculateFIRE(inputs, country2Code);
  
  const fireNumberDifferenceUSD = Math.abs(country1.fireNumberUSD - country2.fireNumberUSD);
  const avgFireNumber = (country1.fireNumberUSD + country2.fireNumberUSD) / 2;
  const fireNumberDifferencePercent = avgFireNumber > 0 ? fireNumberDifferenceUSD / avgFireNumber : 0;
  
  const comparison: ComparisonSummary = {
    fireNumberDifferenceUSD,
    fireNumberDifferencePercent,
    taxRateDifference: Math.abs(country1.effectiveTaxRate - country2.effectiveTaxRate),
    lowerFIRENumber: country1.fireNumberUSD <= country2.fireNumberUSD ? country1Code : country2Code,
    lowerEffectiveTaxRate: country1.effectiveTaxRate <= country2.effectiveTaxRate ? country1Code : country2Code,
    earlierRetirement: country1.yearsUntilFIRE <= country2.yearsUntilFIRE ? country1Code : country2Code
  };
  
  return { country1, country2, comparison };
}
