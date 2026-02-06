import { countries, TaxBracket } from '@/data/countries';
import { convertCurrency } from './currency';
import { getStatePension } from '@/data/statePensions';

export interface UserInputs {
  currentAge: number;
  targetRetirementAge: number;
  currentCountry: string;
  targetCountry: string;
  usState?: string; // US state code for state tax calculations
  
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
    otherLabel: string;
  };
  
  // Asset-specific expected returns (nominal, before inflation)
  assetReturns?: {
    stocks: number;    // Default: expectedReturn (e.g., 0.07)
    property: number;  // Default: inflation + 0.02
    crypto: number;    // Default: expectedReturn + 0.03
    cash: number;      // Default: inflation * 0.5
  };
  
  traditionalRetirementAccounts: number;
  rothAccounts: number;
  taxableAccounts: number;
  propertyEquity: number;
  
  annualSpending: number;  // NET spending (after taxes)
  spendingCurrency: string;
  
  annualSavings: number;
  
  // Origin country pension (from current/leaving country - e.g., US Social Security)
  expectStatePension: boolean;
  statePensionAmount: number;  // Annual amount in current country currency
  statePensionAge: number;     // Age when pension starts
  
  // Destination country pension (from retirement country - e.g., Irish State Pension)
  expectDestinationPension?: boolean;
  destinationPensionAmount?: number;  // Annual amount in target country currency
  destinationPensionAge?: number;     // Age when pension starts
  
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
  
  // Check if country has favorable capital gains treatment
  if (country.capitalGains.longTerm.length > 0 && country.capitalGains.longTerm[0].rate === 0) {
    notes.push(`${country.name} has 0% capital gains tax on the first bracket!`);
  }
  
  // Check for special expat regimes (only for target country, not current)
  if (countryCode === inputs.targetCountry && country.expatRules?.specialRegimes && country.expatRules.specialRegimes.length > 0) {
    country.expatRules.specialRegimes.forEach((regime: { name: string; benefits: string }) => {
      notes.push(`${regime.name}: ${regime.benefits}`);
    });
  }
  
  // Check for tax treaty notes - only show if relevant to the country pair
  if (countryCode === inputs.targetCountry && country.expatRules?.taxTreatyNotes) {
    const treatyNotes = country.expatRules.taxTreatyNotes;
    // Only show treaty notes if they mention the current country
    const currentCountryName = countries[inputs.currentCountry]?.name || '';
    if (treatyNotes.toLowerCase().includes(inputs.currentCountry.toLowerCase()) || 
        treatyNotes.toLowerCase().includes(currentCountryName.toLowerCase())) {
      notes.push(treatyNotes);
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
  
  // Get cost of living adjustment
  // If moving from US ($120K) to Mexico (COL 42%), you only need ~$50K for same lifestyle
  const currentCountry = countries[inputs.currentCountry];
  const currentCOL = currentCountry?.costOfLiving?.index || 100;
  const targetCOL = country.costOfLiving?.index || 100;
  const colAdjustment = targetCOL / currentCOL;
  
  // Convert spending to target currency AND adjust for cost of living
  const annualSpendingConverted = convertCurrency(
    inputs.annualSpending,
    inputs.spendingCurrency,
    country.currency
  );
  // Apply COL adjustment - if target is cheaper, you need less money
  const annualSpendingLocal = annualSpendingConverted * colAdjustment;
  
  const annualSavingsLocal = convertCurrency(
    inputs.annualSavings || 0,
    inputs.portfolioCurrency,
    country.currency
  );
  
  // Convert origin pension (from current/leaving country) to local currency
  const originPensionAmountLocal = inputs.expectStatePension 
    ? convertCurrency(
        inputs.statePensionAmount || 0,
        countries[inputs.currentCountry]?.currency || inputs.portfolioCurrency,
        country.currency
      )
    : 0;
  const originPensionStartAge = inputs.statePensionAge || 67;
  
  // Destination pension (from retirement country) - already in target currency
  const destinationPensionAmountLocal = inputs.expectDestinationPension
    ? (inputs.destinationPensionAmount || 0)
    : 0;
  const destinationPensionStartAge = inputs.destinationPensionAge || 66;
  
  // Combined pension info for display (we'll track both separately in projections)
  const pensionStartAge = Math.min(
    inputs.expectStatePension ? originPensionStartAge : 999,
    inputs.expectDestinationPension ? destinationPensionStartAge : 999
  );
  const pensionAmountLocal = originPensionAmountLocal + destinationPensionAmountLocal;
  
  // Pass US state for state tax calculation if applicable
  const usState = targetCountryCode === 'US' ? inputs.usState : undefined;
  const grossWithdrawalNeeded = annualSpendingLocal / (1 - estimateEffectiveTaxRate(annualSpendingLocal, country, usState));
  
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
  
  // Asset-specific nominal returns
  // Use user-defined values if provided, otherwise use defaults
  const defaultStocksReturn = inputs.expectedReturn;
  const defaultPropertyReturn = inputs.inflationRate + 0.02;
  const defaultCryptoReturn = inputs.expectedReturn + 0.03;
  const defaultCashReturn = inputs.inflationRate * 0.5;
  
  const assetReturns = {
    stocks: inputs.assetReturns?.stocks ?? defaultStocksReturn,
    property: inputs.assetReturns?.property ?? defaultPropertyReturn,
    crypto: inputs.assetReturns?.crypto ?? defaultCryptoReturn,
    cash: inputs.assetReturns?.cash ?? defaultCashReturn,
  };
  
  // Calculate asset allocation percentages from accounts
  const totalPortfolio = inputs.portfolioValue || 1;
  const stocksAmount = (inputs.traditionalRetirementAccounts || 0) + 
                       (inputs.rothAccounts || 0) + 
                       (inputs.taxableAccounts || 0);
  const cryptoAmount = inputs.accounts?.crypto || 0;
  const cashAmount = inputs.accounts?.cash || 0;
  const propertyAmount = inputs.accounts?.property || 0;
  const otherAmount = inputs.accounts?.other || 0; // Treat as stocks
  
  const stocksWeight = (stocksAmount + otherAmount) / totalPortfolio;
  const cryptoWeight = cryptoAmount / totalPortfolio;
  const cashWeight = cashAmount / totalPortfolio;
  const propertyWeight = propertyAmount / totalPortfolio;
  
  // Weighted average nominal return
  const weightedNominalReturn = 
    stocksWeight * assetReturns.stocks +
    cryptoWeight * assetReturns.crypto +
    cashWeight * assetReturns.cash +
    propertyWeight * assetReturns.property;
  
  // Fall back to user's expected return if no allocation specified
  const nominalReturn = (stocksWeight + cryptoWeight + cashWeight + propertyWeight) > 0 
    ? weightedNominalReturn 
    : inputs.expectedReturn;
  
  const inflationRate = inputs.inflationRate;
  
  // If user sets current age >= target retirement age, they're saying "I want to retire now"
  // So no more savings will be added
  const retiringNow = inputs.currentAge >= inputs.targetRetirementAge;
  
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
    // No savings if retired OR if user indicated they want to retire now
    const savingsThisYear = (isRetired || retiringNow) ? 0 : annualSavingsLocal;
    
    // Origin pension (from leaving country) kicks in at its age
    const hasOriginPension = inputs.expectStatePension && age >= originPensionStartAge;
    const yearsSinceOriginPension = hasOriginPension ? age - originPensionStartAge : 0;
    const originPensionIncome = hasOriginPension 
      ? originPensionAmountLocal * Math.pow(1 + inflationRate, yearsSinceOriginPension) 
      : 0;
    
    // Destination pension (from retirement country) kicks in at its age
    const hasDestinationPension = inputs.expectDestinationPension && age >= destinationPensionStartAge;
    const yearsSinceDestPension = hasDestinationPension ? age - destinationPensionStartAge : 0;
    const destinationPensionIncome = hasDestinationPension
      ? destinationPensionAmountLocal * Math.pow(1 + inflationRate, yearsSinceDestPension)
      : 0;
    
    // Total pension income
    const pensionIncome = originPensionIncome + destinationPensionIncome;
    
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
      hasPension: !!(hasOriginPension || hasDestinationPension)
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
  
  const effectiveTaxRate = estimateEffectiveTaxRate(grossWithdrawalNeeded, country, usState);
  
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

function estimateEffectiveTaxRate(income: number, country: typeof countries[string], usStateCode?: string): number {
  if (income <= 0) return 0;
  let tax = calculateTax(income, country.incomeTax.brackets, country);
  
  // Add US state tax if applicable
  if (country.code === 'US' && usStateCode) {
    // Dynamic import would be better but for simplicity, we'll use a lookup
    const stateTaxRates: Record<string, number> = {
      'AL': 0.05, 'AK': 0, 'AZ': 0.025, 'AR': 0.047, 'CA': 0.133, 'CO': 0.044,
      'CT': 0.0699, 'DE': 0.066, 'FL': 0, 'GA': 0.0549, 'HI': 0.11, 'ID': 0.058,
      'IL': 0.0495, 'IN': 0.0315, 'IA': 0.057, 'KS': 0.057, 'KY': 0.04, 'LA': 0.0425,
      'ME': 0.0715, 'MD': 0.0575, 'MA': 0.09, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05,
      'MO': 0.048, 'MT': 0.059, 'NE': 0.0584, 'NV': 0, 'NH': 0.03, 'NJ': 0.1075,
      'NM': 0.059, 'NY': 0.109, 'NC': 0.0475, 'ND': 0.029, 'OH': 0.0399, 'OK': 0.0475,
      'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.064, 'SD': 0, 'TN': 0,
      'TX': 0, 'UT': 0.0465, 'VT': 0.0875, 'VA': 0.0575, 'WA': 0, 'WV': 0.055,
      'WI': 0.0765, 'WY': 0, 'DC': 0.105
    };
    const stateRate = stateTaxRates[usStateCode] || 0;
    tax += income * stateRate;
  }
  
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
  currentSpending?: number,
  usState?: string
): ReverseCalculationResult {
  const country = countries[targetCountryCode];
  if (!country) {
    throw new Error(`Country ${targetCountryCode} not found`);
  }
  
  // Convert portfolio to local currency
  const portfolioLocal = convertCurrency(portfolioValue, portfolioCurrency, country.currency);
  
  // Calculate gross withdrawal using SWR
  const sustainableSpendingGross = portfolioLocal * safeWithdrawalRate;
  
  // Estimate tax (include state tax for US)
  const stateCode = targetCountryCode === 'US' ? usState : undefined;
  const effectiveTaxRate = estimateEffectiveTaxRate(sustainableSpendingGross, country, stateCode);
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
