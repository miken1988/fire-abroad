import { countries, TaxBracket } from '@/data/countries';
import { convertCurrency } from './currency';
import { getStatePension } from '@/data/statePensions';

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
    other: number;
  };
  
  traditionalRetirementAccounts: number;
  rothAccounts: number;
  taxableAccounts: number;
  propertyEquity: number;
  
  annualSpending: number;
  spendingCurrency: string;
  
  annualSavings: number;
  
  // State pension inputs
  expectStatePension: boolean;
  statePensionAmount: number;  // Annual amount in current country currency
  statePensionAge: number;     // Age when pension starts
  
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
  pensionIncome: number;
  taxPaid: number;
  portfolioEnd: number;
  isRetired: boolean;
  hasPension: boolean;
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
  pensionInfo?: {
    startAge: number;
    annualAmount: number;
    currency: string;
  };
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
  
  // Convert pension to local currency if applicable
  const pensionAmountLocal = inputs.expectStatePension 
    ? convertCurrency(
        inputs.statePensionAmount || 0,
        inputs.portfolioCurrency,
        country.currency
      )
    : 0;
  
  const pensionStartAge = inputs.statePensionAge || 67;
  
  const grossWithdrawalNeeded = annualSpendingLocal / (1 - estimateEffectiveTaxRate(annualSpendingLocal, country));
  
  // FIRE number is reduced by the present value of expected pension
  // For simplicity, we'll calculate FIRE number without pension, 
  // but show how pension reduces withdrawal needs later
  const fireNumber = grossWithdrawalNeeded / inputs.safeWithdrawalRate;
  
  const fireNumberUSD = convertCurrency(fireNumber, country.currency, 'USD');
  
  const projections: YearlyProjection[] = [];
  let currentPortfolio = portfolioInLocalCurrency;
  let hasRetired = false;
  let fireAge = 0;
  let yearsUntilFIRE = -1;
  let yearsSinceRetirement = 0;
  
  // Use nominal return for growth, and inflate withdrawals each year
  // This gives a more realistic picture of portfolio trajectory
  const nominalReturn = inputs.expectedReturn;
  const inflationRate = inputs.inflationRate;
  
  for (let year = 0; year <= 50; year++) {
    const age = inputs.currentAge + year;
    const portfolioStart = currentPortfolio;
    
    const isRetired = hasRetired || (age >= inputs.targetRetirementAge && currentPortfolio >= fireNumber);
    
    if (isRetired && !hasRetired) {
      hasRetired = true;
      fireAge = age;
      yearsUntilFIRE = year;
      yearsSinceRetirement = 0;
    }
    
    const growth = portfolioStart * nominalReturn;
    const savingsThisYear = isRetired ? 0 : annualSavingsLocal;
    
    // Pension income kicks in at pension age (also inflates over time)
    const hasPension = inputs.expectStatePension && age >= pensionStartAge;
    const yearsSincePension = hasPension ? age - pensionStartAge : 0;
    const pensionIncome = hasPension 
      ? pensionAmountLocal * Math.pow(1 + inflationRate, yearsSincePension) 
      : 0;
    
    let withdrawal = 0;
    let taxPaid = 0;
    
    if (isRetired) {
      // Inflate withdrawal needs each year to maintain purchasing power
      const inflatedWithdrawalNeeded = grossWithdrawalNeeded * Math.pow(1 + inflationRate, yearsSinceRetirement);
      // Reduce withdrawal by pension income
      const netWithdrawalNeeded = Math.max(0, inflatedWithdrawalNeeded - pensionIncome);
      withdrawal = netWithdrawalNeeded;
      taxPaid = calculateTax(withdrawal + pensionIncome, country.incomeTax.brackets, country);
      yearsSinceRetirement++;
    }
    
    const portfolioEnd = Math.max(0, portfolioStart + growth + savingsThisYear - withdrawal);
    
    projections.push({
      year,
      age,
      portfolioStart,
      growth,
      savings: savingsThisYear,
      withdrawal,
      pensionIncome,
      taxPaid,
      portfolioEnd,
      isRetired,
      hasPension
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
      tempPortfolio = tempPortfolio * (1 + nominalReturn) + annualSavingsLocal;
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
  
  // Add pension note if applicable
  if (inputs.expectStatePension && pensionAmountLocal > 0) {
    const pension = getStatePension(inputs.currentCountry);
    if (pension && !pension.canClaimAbroad && inputs.currentCountry !== targetCountryCode) {
      warnings.push(`${pension.name} may not be payable while living in ${country.name}. Verify eligibility.`);
    }
  }
  
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
    countrySpecificNotes,
    pensionInfo: inputs.expectStatePension ? {
      startAge: pensionStartAge,
      annualAmount: pensionAmountLocal,
      currency: country.currency
    } : undefined
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

/**
 * Reverse calculator: Given a portfolio, calculate sustainable annual spending
 */
export interface ReverseCalculationResult {
  sustainableSpendingGross: number;
  sustainableSpendingNet: number;
  effectiveTaxRate: number;
  currency: string;
  safeWithdrawalRate: number;
  monthlyNet: number;
  luxuryLevel: 'lean' | 'moderate' | 'comfortable' | 'fat';
  comparison?: {
    vsCurrentSpending: number; // percentage difference
    canAffordMore: boolean;
  };
}

export function calculateSustainableSpending(
  portfolioValue: number,
  portfolioCurrency: string,
  targetCountryCode: string,
  safeWithdrawalRate: number = 0.04,
  currentSpending?: number
): ReverseCalculationResult {
  const country = countries[targetCountryCode];
  if (!country) {
    throw new Error(`Country ${targetCountryCode} not found`);
  }
  
  // Convert portfolio to local currency
  const portfolioLocal = convertCurrency(portfolioValue, portfolioCurrency, country.currency);
  
  // Calculate gross withdrawal using SWR
  const sustainableSpendingGross = portfolioLocal * safeWithdrawalRate;
  
  // Estimate tax
  const effectiveTaxRate = estimateEffectiveTaxRate(sustainableSpendingGross, country);
  const sustainableSpendingNet = sustainableSpendingGross * (1 - effectiveTaxRate);
  
  // Monthly net
  const monthlyNet = sustainableSpendingNet / 12;
  
  // Determine luxury level based on cost of living index
  // US at $50K/year is baseline "moderate"
  const usEquivalent = convertCurrency(sustainableSpendingNet, country.currency, 'USD');
  const adjustedForCOL = usEquivalent / (country.costOfLiving?.index || 100) * 100;
  
  let luxuryLevel: 'lean' | 'moderate' | 'comfortable' | 'fat';
  if (adjustedForCOL < 30000) luxuryLevel = 'lean';
  else if (adjustedForCOL < 60000) luxuryLevel = 'moderate';
  else if (adjustedForCOL < 100000) luxuryLevel = 'comfortable';
  else luxuryLevel = 'fat';
  
  // Comparison to current spending if provided
  let comparison: ReverseCalculationResult['comparison'];
  if (currentSpending !== undefined && currentSpending > 0) {
    const currentInLocal = convertCurrency(currentSpending, portfolioCurrency, country.currency);
    const vsCurrentSpending = ((sustainableSpendingNet - currentInLocal) / currentInLocal) * 100;
    comparison = {
      vsCurrentSpending,
      canAffordMore: sustainableSpendingNet >= currentInLocal
    };
  }
  
  return {
    sustainableSpendingGross,
    sustainableSpendingNet,
    effectiveTaxRate,
    currency: country.currency,
    safeWithdrawalRate,
    monthlyNet,
    luxuryLevel,
    comparison
  };
}

/**
 * Detailed tax breakdown for transparency
 */
export interface TaxBreakdown {
  grossIncome: number;
  currency: string;
  incomeTax: number;
  incomeTaxRate: number;
  capitalGainsTax: number;
  capitalGainsRate: number;
  socialTaxes: number;
  socialTaxRate: number;
  totalTax: number;
  effectiveRate: number;
  netIncome: number;
  brackets: Array<{
    bracket: string;
    rate: number;
    taxableAmount: number;
    taxPaid: number;
  }>;
}

export function calculateTaxBreakdown(
  grossIncome: number,
  countryCode: string,
  incomeType: 'withdrawal' | 'capitalGains' | 'mixed' = 'mixed'
): TaxBreakdown {
  const country = countries[countryCode];
  if (!country) {
    throw new Error(`Country ${countryCode} not found`);
  }
  
  // Calculate income tax with bracket breakdown
  const brackets: TaxBreakdown['brackets'] = [];
  let remainingIncome = grossIncome;
  let totalIncomeTax = 0;
  
  for (const bracket of country.incomeTax.brackets) {
    const bracketSize = (bracket.max || Infinity) - bracket.min;
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    
    if (taxableInBracket > 0) {
      const taxPaid = taxableInBracket * bracket.rate;
      totalIncomeTax += taxPaid;
      
      const bracketLabel = bracket.max 
        ? `${formatBracketAmount(bracket.min, country.currency)} - ${formatBracketAmount(bracket.max, country.currency)}`
        : `${formatBracketAmount(bracket.min, country.currency)}+`;
      
      brackets.push({
        bracket: bracketLabel,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        taxPaid
      });
      
      remainingIncome -= taxableInBracket;
    }
    
    if (remainingIncome <= 0) break;
  }
  
  // Capital gains (simplified - assume long-term)
  let capitalGainsTax = 0;
  let capitalGainsRate = 0;
  if (incomeType === 'capitalGains' || incomeType === 'mixed') {
    const cgBrackets = country.capitalGains.longTerm;
    if (cgBrackets.length > 0) {
      // Use average rate for simplicity
      capitalGainsRate = cgBrackets[Math.min(1, cgBrackets.length - 1)].rate;
      // For mixed, assume 50% is capital gains
      const cgPortion = incomeType === 'mixed' ? grossIncome * 0.5 : grossIncome;
      capitalGainsTax = cgPortion * capitalGainsRate;
    }
  }
  
  // Social taxes (usually don't apply to investment income in retirement)
  let socialTaxes = 0;
  const socialTaxRate = 0;
  if (country.socialTaxes?.appliesToInvestmentIncome) {
    socialTaxes = grossIncome * (country.socialTaxes.selfEmployedRate || 0);
  }
  
  // For withdrawal income type, use income tax; for capital gains, use CG tax
  const incomeTax = incomeType === 'capitalGains' ? 0 : totalIncomeTax;
  const finalCapitalGainsTax = incomeType === 'withdrawal' ? 0 : capitalGainsTax;
  
  const totalTax = incomeTax + finalCapitalGainsTax + socialTaxes;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  
  return {
    grossIncome,
    currency: country.currency,
    incomeTax,
    incomeTaxRate: grossIncome > 0 ? incomeTax / grossIncome : 0,
    capitalGainsTax: finalCapitalGainsTax,
    capitalGainsRate,
    socialTaxes,
    socialTaxRate,
    totalTax,
    effectiveRate,
    netIncome: grossIncome - totalTax,
    brackets
  };
}

function formatBracketAmount(amount: number, currency: string): string {
  if (amount === 0) return '0';
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
}
