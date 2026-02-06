export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface AccountType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  taxTreatmentDomestic: string;
  icon: string;
  isUniversal?: boolean;
}

export const universalAccountTypes: AccountType[] = [
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    shortName: 'Crypto',
    description: 'Bitcoin, Ethereum, and other cryptocurrencies.',
    taxTreatmentDomestic: 'Varies by country',
    icon: '₿',
    isUniversal: true,
  },
  {
    id: 'cash',
    name: 'Cash & Savings',
    shortName: 'Cash',
    description: 'Bank accounts, savings accounts, money market funds.',
    taxTreatmentDomestic: 'Interest taxed as income',
    icon: '💵',
    isUniversal: true,
  },
  {
    id: 'property',
    name: 'Property Equity',
    shortName: 'Property',
    description: 'Equity in investment properties (not primary residence).',
    taxTreatmentDomestic: 'CGT on sale',
    icon: '🏠',
    isUniversal: true,
  },
];

export const countryAccountTypes: Record<string, AccountType[]> = {
  US: [
    { id: 'us_traditional', name: 'Traditional 401(k) / IRA', shortName: '401k/IRA', description: 'Tax-deferred retirement accounts. Withdrawals taxed as income.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
    { id: 'us_roth', name: 'Roth 401(k) / Roth IRA', shortName: 'Roth', description: 'After-tax retirement accounts. Qualified withdrawals are tax-free.', taxTreatmentDomestic: 'Tax-free growth', icon: '✨' },
    { id: 'us_brokerage', name: 'Taxable Brokerage', shortName: 'Brokerage', description: 'Regular investment account. Capital gains taxed when you sell.', taxTreatmentDomestic: 'Taxable', icon: '📈' },
  ],
  UK: [
    { id: 'uk_pension', name: 'Workplace Pension / SIPP', shortName: 'Pension', description: 'Tax-relieved pension. 25% tax-free lump sum, rest taxed as income.', taxTreatmentDomestic: 'Tax-relieved', icon: '🏦' },
    { id: 'uk_isa', name: 'Stocks & Shares ISA', shortName: 'ISA', description: 'Tax-free wrapper. No CGT or dividend tax. £20k/year limit.', taxTreatmentDomestic: 'Tax-free', icon: '✨' },
    { id: 'uk_gia', name: 'General Investment Account', shortName: 'GIA', description: 'Regular investment account. Subject to CGT and dividend tax.', taxTreatmentDomestic: 'Taxable', icon: '📈' },
  ],
};

export function getAccountTypesForCountry(countryCode: string): AccountType[] {
  const countrySpecific = countryAccountTypes[countryCode] || countryAccountTypes['US'];
  return [...countrySpecific, ...universalAccountTypes];
}

export const crossBorderTreatment: Record<string, { treatment: string; warning?: string; effectiveTaxType: string }> = {
  'us_traditional->UK': { treatment: 'Withdrawals taxed as income in both US and UK. Foreign Tax Credit available.', effectiveTaxType: 'income' },
  'us_roth->UK': { treatment: 'US: Tax-free. UK: May tax growth as income.', warning: 'UK treatment of Roth is unclear.', effectiveTaxType: 'special' },
  'us_brokerage->UK': { treatment: 'Subject to UK CGT on gains realized while UK resident.', effectiveTaxType: 'capitalGains' },
  'uk_pension->US': { treatment: 'Recognized under US-UK treaty. Taxed as income when withdrawn.', effectiveTaxType: 'income' },
  'uk_isa->US': { treatment: 'NOT recognized by IRS. Taxed annually on dividends and gains.', warning: 'ISA loses all tax benefits for US taxpayers.', effectiveTaxType: 'capitalGains' },
  'uk_gia->US': { treatment: 'Subject to US CGT. Watch for PFIC rules on UK funds.', warning: 'UK funds may be PFICs - punitive US taxation.', effectiveTaxType: 'capitalGains' },
  'crypto->US': { treatment: 'Taxed as property. Long-term gains at 0/15/20%.', effectiveTaxType: 'capitalGains' },
  'crypto->UK': { treatment: 'Subject to CGT at 18/24%. £3,000 annual exemption.', effectiveTaxType: 'capitalGains' },
  'property->US': { treatment: 'Subject to US CGT. May qualify for 1031 exchange.', effectiveTaxType: 'capitalGains' },
  'property->UK': { treatment: 'Subject to UK CGT at 18/24% for residential.', effectiveTaxType: 'capitalGains' },
};

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  capitalGains: { shortTerm: TaxBracket[]; longTerm: TaxBracket[]; longTermThresholdMonths: number; annualExemption: number; hasDeemDisposal: boolean; deemDisposalYears?: number; deemDisposalRate?: number; additionalTaxes?: { name: string; rate: number; threshold: number; description: string }[] };
  incomeTax: { brackets: TaxBracket[]; personalAllowance: number; personalAllowancePhaseout?: { startIncome: number; reductionRate: number } };
  dividendTax?: { brackets: TaxBracket[]; allowance: number };
  socialTaxes?: { name: string; employeeRate: number; selfEmployedRate: number; threshold: number; cap?: number; appliesToInvestmentIncome: boolean; appliesToPensions: boolean };
  retirementAccounts: { name: string; taxOnContribution: string; taxOnGrowth: string; taxOnWithdrawal: string; accessAge: number; earlyWithdrawalPenalty?: number; notes: string }[];
  healthcare: { system: string; publicAccessForResidents: boolean; estimatedAnnualCostPreRetirement: number; estimatedAnnualCostPostRetirement: number; retirementHealthcareAge?: number; notes: string };
  costOfLiving: { index: number; monthlyRentCity: number; monthlyRentSuburb: number; notes: string };
  expatRules: { taxationBasis: string; citizenshipBasedTaxation: boolean; hasExitTax: boolean; exitTaxDetails?: string; specialRegimes?: { name: string; duration: string; benefits: string; eligibility: string }[]; taxTreatyNotes?: string };
}

export const countries: Record<string, Country> = {
  US: {
    code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸',
    capitalGains: {
      shortTerm: [{ min: 0, max: 11925, rate: 0.10 }, { min: 11925, max: 48475, rate: 0.12 }, { min: 48475, max: 103350, rate: 0.22 }, { min: 103350, max: 197300, rate: 0.24 }, { min: 197300, max: 250525, rate: 0.32 }, { min: 250525, max: 626350, rate: 0.35 }, { min: 626350, max: null, rate: 0.37 }],
      longTerm: [{ min: 0, max: 48350, rate: 0.00 }, { min: 48350, max: 533400, rate: 0.15 }, { min: 533400, max: null, rate: 0.20 }],
      longTermThresholdMonths: 12, annualExemption: 0, hasDeemDisposal: false,
      additionalTaxes: [{ name: 'Net Investment Income Tax (NIIT)', rate: 0.038, threshold: 200000, description: '3.8% surtax on investment income for high earners' }],
    },
    incomeTax: {
      brackets: [{ min: 0, max: 11925, rate: 0.10 }, { min: 11925, max: 48475, rate: 0.12 }, { min: 48475, max: 103350, rate: 0.22 }, { min: 103350, max: 197300, rate: 0.24 }, { min: 197300, max: 250525, rate: 0.32 }, { min: 250525, max: 626350, rate: 0.35 }, { min: 626350, max: null, rate: 0.37 }],
      personalAllowance: 15000,
    },
    dividendTax: { brackets: [{ min: 0, max: 48350, rate: 0.00 }, { min: 48350, max: 533400, rate: 0.15 }, { min: 533400, max: null, rate: 0.20 }], allowance: 0 },
    socialTaxes: { name: 'FICA', employeeRate: 0.0765, selfEmployedRate: 0.153, threshold: 0, cap: 176100, appliesToInvestmentIncome: false, appliesToPensions: false },
    retirementAccounts: [
      { name: '401(k) / Traditional IRA', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 59.5, earlyWithdrawalPenalty: 0.10, notes: 'RMDs start at 73.' },
      { name: 'Roth', taxOnContribution: 'taxed', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 59.5, notes: 'Tax-free if held 5+ years.' },
      { name: 'Brokerage', taxOnContribution: 'taxed', taxOnGrowth: 'taxed', taxOnWithdrawal: 'special', accessAge: 0, notes: 'LTCG rates apply.' },
    ],
    healthcare: { system: 'Private + Medicare (65+)', publicAccessForResidents: false, estimatedAnnualCostPreRetirement: 18000, estimatedAnnualCostPostRetirement: 3000, retirementHealthcareAge: 65, notes: 'ACA plans $1,000-1,800/month pre-65. Medicare + supplemental ~$250/month at 65+.' },
    costOfLiving: { index: 100, monthlyRentCity: 2500, monthlyRentSuburb: 1800, notes: 'Varies by location.' },
    expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: true, hasExitTax: true, exitTaxDetails: 'Covered expatriates face exit tax.', taxTreatyNotes: 'US-UK treaty provides credits.' },
  },
  UK: {
    code: 'UK', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧',
    capitalGains: {
      shortTerm: [{ min: 0, max: 37700, rate: 0.18 }, { min: 37700, max: null, rate: 0.24 }],
      longTerm: [{ min: 0, max: 37700, rate: 0.18 }, { min: 37700, max: null, rate: 0.24 }],
      longTermThresholdMonths: 0, annualExemption: 3000, hasDeemDisposal: false,
    },
    incomeTax: {
      brackets: [{ min: 0, max: 37700, rate: 0.20 }, { min: 37700, max: 125140, rate: 0.40 }, { min: 125140, max: null, rate: 0.45 }],
      personalAllowance: 12570,
      personalAllowancePhaseout: { startIncome: 100000, reductionRate: 0.5 },
    },
    dividendTax: { brackets: [{ min: 0, max: 37700, rate: 0.0875 }, { min: 37700, max: 125140, rate: 0.3375 }, { min: 125140, max: null, rate: 0.3935 }], allowance: 500 },
    socialTaxes: { name: 'National Insurance', employeeRate: 0.08, selfEmployedRate: 0.06, threshold: 12570, cap: 50270, appliesToInvestmentIncome: false, appliesToPensions: false },
    retirementAccounts: [
      { name: 'Pension / SIPP', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'income', accessAge: 55, notes: '25% tax-free lump sum.' },
      { name: 'ISA', taxOnContribution: 'taxed', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 0, notes: '£20k/year limit. NOT recognized by IRS.' },
      { name: 'GIA', taxOnContribution: 'taxed', taxOnGrowth: 'taxed', taxOnWithdrawal: 'special', accessAge: 0, notes: 'CGT on gains.' },
    ],
    healthcare: { system: 'NHS (National Health Service)', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Free for UK residents.' },
    costOfLiving: { index: 85, monthlyRentCity: 1800, monthlyRentSuburb: 1200, notes: 'London expensive.' },
    expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: false, specialRegimes: [{ name: 'Remittance Basis', duration: 'Up to 15 years', benefits: 'Only UK-source and remitted foreign income taxed', eligibility: 'Non-UK domiciled.' }], taxTreatyNotes: 'US-UK treaty allows credits.' },
  },
};

export const exchangeRates: Record<string, number> = { 'USD-GBP': 0.79, 'GBP-USD': 1.27, 'USD-EUR': 0.92, 'EUR-USD': 1.09, 'GBP-EUR': 1.17, 'EUR-GBP': 0.85 };

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rate = exchangeRates[`${from}-${to}`];
  if (rate) return amount * rate;
  const reverseRate = exchangeRates[`${to}-${from}`];
  if (reverseRate) return amount / reverseRate;
  return amount;
}

// Add Ireland to countries
countries['IE'] = {
  code: 'IE', name: 'Ireland', currency: 'EUR', currencySymbol: '€', flag: '🇮🇪',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.33 }],
    longTerm: [{ min: 0, max: null, rate: 0.33 }],
    longTermThresholdMonths: 0, // No distinction
    annualExemption: 1270,
    hasDeemDisposal: true,
    deemDisposalYears: 8,
    deemDisposalRate: 0.41, // Exit tax rate on ETFs (dropping to 0.38 in 2026)
    additionalTaxes: [{ name: 'ETF Exit Tax', rate: 0.41, threshold: 0, description: '41% tax on ETF/fund gains with deemed disposal every 8 years. Dropping to 38% from Jan 2026.' }],
  },
  incomeTax: {
    brackets: [{ min: 0, max: 42000, rate: 0.20 }, { min: 42000, max: null, rate: 0.40 }],
    personalAllowance: 0, // Ireland uses tax credits instead
  },
  dividendTax: { brackets: [{ min: 0, max: null, rate: 0.51 }], allowance: 0 }, // Dividends taxed as income + PRSI + USC
  socialTaxes: { name: 'PRSI + USC', employeeRate: 0.04, selfEmployedRate: 0.04, threshold: 13000, appliesToInvestmentIncome: true, appliesToPensions: false },
  retirementAccounts: [
    { name: 'Occupational Pension / PRSA', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'income', accessAge: 50, notes: '25% tax-free lump sum (max €200k at 0%, next €300k at 20%). Rest taxed as income.' },
    { name: 'Investment Account', taxOnContribution: 'taxed', taxOnGrowth: 'taxed', taxOnWithdrawal: 'special', accessAge: 0, notes: '33% CGT on shares. 41% exit tax on ETFs with 8-year deemed disposal.' },
  ],
  healthcare: { system: 'HSE (Public) + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 1500, estimatedAnnualCostPostRetirement: 1500, notes: 'Public healthcare available but many use private insurance (€1,000-3,000/yr). Medical card for low income.' },
  costOfLiving: { index: 95, monthlyRentCity: 2200, monthlyRentSuburb: 1600, notes: 'Dublin very expensive. Rest of Ireland more affordable.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'US-Ireland treaty exists. UK-Ireland close ties. EU freedom of movement.' },
};

// Add Ireland account types
countryAccountTypes['IE'] = [
  { id: 'ie_pension', name: 'Occupational Pension / PRSA', shortName: 'Pension', description: 'Tax-relieved pension. 25% tax-free lump sum (limits apply), rest taxed as income.', taxTreatmentDomestic: 'Tax-relieved', icon: '🏦' },
  { id: 'ie_shares', name: 'Direct Shares', shortName: 'Shares', description: 'Individual stocks. 33% CGT, NO deemed disposal (unlike ETFs).', taxTreatmentDomestic: '33% CGT', icon: '📈' },
  { id: 'ie_etf', name: 'ETFs / Funds', shortName: 'ETFs', description: 'ETFs and funds. 41% exit tax with deemed disposal every 8 years. Very unfavorable.', taxTreatmentDomestic: '41% Exit Tax', icon: '⚠️' },
];

// Add Ireland cross-border treatments
crossBorderTreatment['ie_pension->US'] = { treatment: 'Recognized under US-Ireland treaty. Withdrawals taxed as income in US.', effectiveTaxType: 'income' };
crossBorderTreatment['ie_pension->UK'] = { treatment: 'Recognized under UK-Ireland arrangements. Withdrawals taxed as income.', effectiveTaxType: 'income' };
crossBorderTreatment['ie_shares->US'] = { treatment: 'Subject to US CGT on gains realized while US resident.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['ie_shares->UK'] = { treatment: 'Subject to UK CGT at 18/24%.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['ie_etf->US'] = { treatment: 'Irish ETFs may be PFICs. Consider selling before moving.', warning: 'Irish-domiciled ETFs are likely PFICs - punitive US taxation.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['ie_etf->UK'] = { treatment: 'UK has reporting fund rules. Check if your ETFs qualify.', warning: 'Non-reporting funds taxed as income, not CGT.', effectiveTaxType: 'capitalGains' };

// Treatments for moving TO Ireland
crossBorderTreatment['us_traditional->IE'] = { treatment: 'US-Ireland treaty applies. Withdrawals taxed as income in Ireland at 20-40%.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->IE'] = { treatment: 'Ireland may not recognize Roth tax-free status. Growth could be taxed.', warning: 'Roth treatment in Ireland is unclear. Seek professional advice.', effectiveTaxType: 'special' };
crossBorderTreatment['us_brokerage->IE'] = { treatment: 'Subject to Irish CGT at 33% on gains realized while Irish resident.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['uk_pension->IE'] = { treatment: 'QROPS transfers possible. Withdrawals taxed as income in Ireland.', effectiveTaxType: 'income' };
crossBorderTreatment['uk_isa->IE'] = { treatment: 'ISA not recognized in Ireland. Gains taxed at 33% CGT or 41% exit tax.', warning: 'ISA loses all tax benefits. Consider unwinding before moving.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['uk_gia->IE'] = { treatment: 'Subject to Irish CGT at 33% on shares, 41% exit tax on funds.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->IE'] = { treatment: 'Taxed as CGT at 33%. Each disposal is a taxable event.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['property->IE'] = { treatment: 'Subject to Irish CGT at 33% on gains.', effectiveTaxType: 'capitalGains' };

// Add EUR exchange rates
exchangeRates['USD-EUR'] = 0.92;
exchangeRates['EUR-USD'] = 1.09;
exchangeRates['GBP-EUR'] = 1.17;
exchangeRates['EUR-GBP'] = 0.85;

// PORTUGAL
countries['PT'] = {
  code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€', flag: '🇵🇹',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.28 }],
    longTerm: [{ min: 0, max: null, rate: 0.28 }], // Can elect to add to income instead
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 7703, rate: 0.1325 },
      { min: 7703, max: 11623, rate: 0.18 },
      { min: 11623, max: 16472, rate: 0.23 },
      { min: 16472, max: 21321, rate: 0.26 },
      { min: 21321, max: 27146, rate: 0.3275 },
      { min: 27146, max: 39791, rate: 0.37 },
      { min: 39791, max: 51997, rate: 0.435 },
      { min: 51997, max: 81199, rate: 0.45 },
      { min: 81199, max: null, rate: 0.48 },
    ],
    personalAllowance: 4104,
  },
  socialTaxes: { name: 'Social Security', employeeRate: 0.11, selfEmployedRate: 0.214, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'PPR (Retirement Savings Plan)', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'special', accessAge: 55, notes: 'Tax benefits on contributions. Early withdrawal penalties.' },
  ],
  healthcare: { system: 'SNS (National Health Service)', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 500, estimatedAnnualCostPostRetirement: 500, notes: 'Public healthcare available. Many expats use private (€50-150/month).' },
  costOfLiving: { index: 65, monthlyRentCity: 1200, monthlyRentSuburb: 800, notes: 'Lisbon expensive, rest of Portugal affordable.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: false,
    specialRegimes: [
      { name: 'NHR 2.0', duration: '10 years', benefits: '20% flat tax on eligible employment income. Foreign pensions may be taxed at source country rates.', eligibility: 'Not resident in PT for prior 5 years. Must work in high-value activity.' },
    ],
    taxTreatyNotes: 'Treaties with US, UK. NHR program reformed in 2024 - old 0% pension rate eliminated.',
  },
};

countryAccountTypes['PT'] = [
  { id: 'pt_ppr', name: 'PPR (Retirement Savings Plan)', shortName: 'PPR', description: 'Portuguese retirement savings with tax benefits on contributions.', taxTreatmentDomestic: 'Tax-advantaged', icon: '🏦' },
  { id: 'pt_investment', name: 'Investment Account', shortName: 'Investment', description: 'Standard investment account. 28% flat CGT or add to income.', taxTreatmentDomestic: '28% CGT', icon: '📈' },
];

crossBorderTreatment['us_traditional->PT'] = { treatment: 'US-Portugal treaty applies. May be taxed in both countries with credits.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->PT'] = { treatment: 'Portugal may not recognize Roth tax-free status.', warning: 'Roth treatment unclear. Growth may be taxed.', effectiveTaxType: 'special' };
crossBorderTreatment['uk_pension->PT'] = { treatment: 'Taxed as income in Portugal. NHR may provide benefits.', effectiveTaxType: 'income' };
crossBorderTreatment['uk_isa->PT'] = { treatment: 'Not recognized. Subject to 28% CGT on gains.', warning: 'ISA loses tax-free status.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->PT'] = { treatment: 'Crypto held >365 days was tax-free until 2023. Now 28% CGT.', effectiveTaxType: 'capitalGains' };

// SPAIN
countries['ES'] = {
  code: 'ES', name: 'Spain', currency: 'EUR', currencySymbol: '€', flag: '🇪🇸',
  capitalGains: {
    shortTerm: [
      { min: 0, max: 6000, rate: 0.19 },
      { min: 6000, max: 50000, rate: 0.21 },
      { min: 50000, max: 200000, rate: 0.23 },
      { min: 200000, max: 300000, rate: 0.27 },
      { min: 300000, max: null, rate: 0.28 },
    ],
    longTerm: [
      { min: 0, max: 6000, rate: 0.19 },
      { min: 6000, max: 50000, rate: 0.21 },
      { min: 50000, max: 200000, rate: 0.23 },
      { min: 200000, max: 300000, rate: 0.27 },
      { min: 300000, max: null, rate: 0.28 },
    ],
    longTermThresholdMonths: 0, // No distinction
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 12450, rate: 0.19 },
      { min: 12450, max: 20200, rate: 0.24 },
      { min: 20200, max: 35200, rate: 0.30 },
      { min: 35200, max: 60000, rate: 0.37 },
      { min: 60000, max: 300000, rate: 0.45 },
      { min: 300000, max: null, rate: 0.47 },
    ],
    personalAllowance: 5550,
  },
  socialTaxes: { name: 'Social Security', employeeRate: 0.0635, selfEmployedRate: 0.30, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'Plan de Pensiones', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 65, notes: 'Contributions reduce taxable income. Limited to €1,500/year.' },
  ],
  healthcare: { system: 'SNS (National Health System)', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Universal healthcare for residents. Private insurance €50-100/month.' },
  costOfLiving: { index: 60, monthlyRentCity: 1100, monthlyRentSuburb: 700, notes: 'Madrid/Barcelona expensive. Southern Spain very affordable.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: true,
    exitTaxDetails: 'Exit tax on unrealized gains if leaving EU and holdings >€4M or >25% stake.',
    specialRegimes: [
      { name: 'Beckham Law', duration: '6 years', benefits: '24% flat tax on Spanish income up to €600k. Foreign income exempt except employment.', eligibility: 'Not resident in Spain for prior 5 years. Must have Spanish employment contract.' },
    ],
    taxTreatyNotes: 'Treaties with US, UK. Wealth tax applies in some regions.',
  },
};

countryAccountTypes['ES'] = [
  { id: 'es_pension', name: 'Plan de Pensiones', shortName: 'Pension', description: 'Spanish pension plan. Tax-deductible contributions, taxed on withdrawal.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'es_investment', name: 'Investment Account', shortName: 'Investment', description: 'Standard investment account. CGT 19-28% depending on gains.', taxTreatmentDomestic: '19-28% CGT', icon: '📈' },
];

crossBorderTreatment['us_traditional->ES'] = { treatment: 'US-Spain treaty applies. Taxed as income in Spain.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->ES'] = { treatment: 'Spain unlikely to recognize Roth benefits.', warning: 'Growth will likely be taxed annually.', effectiveTaxType: 'special' };
crossBorderTreatment['uk_pension->ES'] = { treatment: 'Taxed as income in Spain under treaty.', effectiveTaxType: 'income' };
crossBorderTreatment['uk_isa->ES'] = { treatment: 'Not recognized. Subject to Spanish CGT 19-28%.', warning: 'ISA loses tax-free status.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->ES'] = { treatment: 'Subject to CGT at 19-28%. Must declare on Modelo 720 if >€50k abroad.', effectiveTaxType: 'capitalGains' };

// GERMANY
countries['DE'] = {
  code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', flag: '🇩🇪',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.26375 }], // 25% + 5.5% solidarity surcharge
    longTerm: [{ min: 0, max: null, rate: 0.26375 }],
    longTermThresholdMonths: 0, // No distinction for securities
    annualExemption: 1000, // Sparerpauschbetrag
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 11604, rate: 0 },
      { min: 11604, max: 17005, rate: 0.14 }, // Progressive zone 1
      { min: 17005, max: 66760, rate: 0.24 }, // Simplified - actually progressive
      { min: 66760, max: 277825, rate: 0.42 },
      { min: 277825, max: null, rate: 0.45 },
    ],
    personalAllowance: 0, // Built into brackets
  },
  socialTaxes: { name: 'Social Insurance', employeeRate: 0.20, selfEmployedRate: 0.20, threshold: 0, cap: 90600, appliesToInvestmentIncome: false, appliesToPensions: true },
  retirementAccounts: [
    { name: 'Riester-Rente', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 62, notes: 'Government-subsidized. Must be German tax resident.' },
    { name: 'Betriebliche Altersvorsorge', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 62, notes: 'Company pension. Employer contributions.' },
    { name: 'Depot (Brokerage)', taxOnContribution: 'taxed', taxOnGrowth: 'taxed', taxOnWithdrawal: 'special', accessAge: 0, notes: '26.375% flat tax on gains. €1,000 annual exemption.' },
  ],
  healthcare: { system: 'Statutory + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 4800, estimatedAnnualCostPostRetirement: 4800, notes: 'Mandatory insurance. ~15% of income for statutory, or private from €400/month.' },
  costOfLiving: { index: 75, monthlyRentCity: 1400, monthlyRentSuburb: 900, notes: 'Munich expensive. Berlin/Eastern Germany more affordable.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: true,
    exitTaxDetails: 'Exit tax on unrealized gains if holding >1% of company.',
    taxTreatyNotes: 'Treaties with US, UK. Property held 10+ years is CGT-free.',
  },
};

countryAccountTypes['DE'] = [
  { id: 'de_pension', name: 'Riester/Betriebsrente', shortName: 'Pension', description: 'German retirement accounts. Tax-deferred growth.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'de_depot', name: 'Depot (Brokerage)', shortName: 'Depot', description: 'Standard brokerage. 26.375% flat tax on gains over €1,000.', taxTreatmentDomestic: '26.375%', icon: '📈' },
];

crossBorderTreatment['us_traditional->DE'] = { treatment: 'US-Germany treaty applies. Taxed as income in Germany.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->DE'] = { treatment: 'Germany does not recognize Roth. Growth taxed annually.', warning: 'Roth loses all benefits. Consider spending first.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['uk_pension->DE'] = { treatment: 'Taxed as income in Germany under treaty.', effectiveTaxType: 'income' };
crossBorderTreatment['uk_isa->DE'] = { treatment: 'Not recognized. Subject to 26.375% flat tax.', warning: 'ISA loses tax-free status.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->DE'] = { treatment: 'Tax-FREE if held >1 year! Otherwise income tax rates.', effectiveTaxType: 'capitalGains' };

// NETHERLANDS
countries['NL'] = {
  code: 'NL', name: 'Netherlands', currency: 'EUR', currencySymbol: '€', flag: '🇳🇱',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.36 }], // Box 3 deemed return system
    longTerm: [{ min: 0, max: null, rate: 0.36 }],
    longTermThresholdMonths: 0,
    annualExemption: 57000, // Heffingsvrij vermogen (tax-free threshold)
    hasDeemDisposal: true, // Box 3 is effectively deemed return
    deemDisposalRate: 0.36,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 75518, rate: 0.3697 },
      { min: 75518, max: null, rate: 0.495 },
    ],
    personalAllowance: 0, // Uses tax credits instead
  },
  socialTaxes: { name: 'Social Insurance', employeeRate: 0.2765, selfEmployedRate: 0.2765, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: true },
  retirementAccounts: [
    { name: 'Pensioen (Pension)', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'income', accessAge: 67, notes: 'Mandatory employer pension. AOW state pension from 67.' },
    { name: 'Beleggingsrekening (Box 3)', taxOnContribution: 'taxed', taxOnGrowth: 'taxed', taxOnWithdrawal: 'special', accessAge: 0, notes: 'Box 3: Deemed return taxed at 36%. Very unfavorable for investors.' },
  ],
  healthcare: { system: 'Mandatory Private Insurance', publicAccessForResidents: false, estimatedAnnualCostPreRetirement: 1800, estimatedAnnualCostPostRetirement: 1800, notes: 'Everyone must buy private insurance (~€150/month). Zorgtoeslag subsidy for low income.' },
  costOfLiving: { index: 80, monthlyRentCity: 1800, monthlyRentSuburb: 1200, notes: 'Amsterdam very expensive. Other cities more reasonable.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: false,
    specialRegimes: [
      { name: '30% Ruling', duration: '5 years', benefits: '30% of salary tax-free. Box 3 exemption for foreign assets.', eligibility: 'Recruited from abroad. Specific expertise. Income threshold applies.' },
    ],
    taxTreatyNotes: 'Treaties with US, UK. Box 3 system is notoriously harsh for FIRE.',
  },
};

countryAccountTypes['NL'] = [
  { id: 'nl_pension', name: 'Pensioen', shortName: 'Pension', description: 'Dutch pension. Mandatory employer + AOW state pension.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'nl_box3', name: 'Beleggingsrekening (Box 3)', shortName: 'Box 3', description: 'Investment account. Deemed return taxed at 36% annually - very unfavorable!', taxTreatmentDomestic: '36% deemed', icon: '⚠️' },
];

crossBorderTreatment['us_traditional->NL'] = { treatment: 'US-NL treaty applies. Taxed as income in Netherlands.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->NL'] = { treatment: 'Netherlands may tax Roth under Box 3 deemed return.', warning: 'Roth faces harsh Box 3 treatment. Avoid NL with Roth.', effectiveTaxType: 'special' };
crossBorderTreatment['uk_pension->NL'] = { treatment: 'Taxed as income in Netherlands under treaty.', effectiveTaxType: 'income' };
crossBorderTreatment['uk_isa->NL'] = { treatment: 'Subject to Box 3 deemed return system.', warning: 'ISA faces punitive Box 3 taxation annually.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->NL'] = { treatment: 'Included in Box 3 wealth. Deemed return taxed at 36%.', warning: 'Netherlands is very bad for crypto holders.', effectiveTaxType: 'capitalGains' };

// Add EUR exchange rates (already exist but ensure they're there)
exchangeRates['USD-EUR'] = exchangeRates['USD-EUR'] || 0.92;
exchangeRates['EUR-USD'] = exchangeRates['EUR-USD'] || 1.09;
exchangeRates['GBP-EUR'] = exchangeRates['GBP-EUR'] || 1.17;
exchangeRates['EUR-GBP'] = exchangeRates['EUR-GBP'] || 0.85;

// CANADA
countries['CA'] = {
  code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', flag: '🇨🇦',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.25 }], // 50% inclusion at top marginal ~50%
    longTerm: [{ min: 0, max: null, rate: 0.25 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 55867, rate: 0.15 },
      { min: 55867, max: 111733, rate: 0.205 },
      { min: 111733, max: 173205, rate: 0.26 },
      { min: 173205, max: 246752, rate: 0.29 },
      { min: 246752, max: null, rate: 0.33 },
    ],
    personalAllowance: 15705,
  },
  socialTaxes: { name: 'CPP/EI', employeeRate: 0.0595, selfEmployedRate: 0.119, threshold: 3500, cap: 68500, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'RRSP', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 55, notes: 'Similar to 401k. Must convert to RRIF by 71.' },
    { name: 'TFSA', taxOnContribution: 'taxed', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 0, notes: 'Tax-free savings. ~$7k/year contribution room.' },
  ],
  healthcare: { system: 'Provincial Medicare', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Universal healthcare for residents. 3-month wait in some provinces.' },
  costOfLiving: { index: 75, monthlyRentCity: 2200, monthlyRentSuburb: 1500, notes: 'Toronto/Vancouver expensive. Prairies affordable.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: true, exitTaxDetails: 'Departure tax on deemed disposition of assets.', taxTreatyNotes: 'US-Canada treaty. TFSA not recognized by IRS.' },
};

countryAccountTypes['CA'] = [
  { id: 'ca_rrsp', name: 'RRSP', shortName: 'RRSP', description: 'Registered Retirement Savings Plan. Tax-deferred like 401k.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'ca_tfsa', name: 'TFSA', shortName: 'TFSA', description: 'Tax-Free Savings Account. Like Roth but more flexible.', taxTreatmentDomestic: 'Tax-free', icon: '✨' },
  { id: 'ca_nonreg', name: 'Non-Registered', shortName: 'Non-Reg', description: 'Taxable account. 50% of gains included in income.', taxTreatmentDomestic: '50% inclusion', icon: '📈' },
];

crossBorderTreatment['us_traditional->CA'] = { treatment: 'US-Canada treaty applies. Taxed as income in Canada.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->CA'] = { treatment: 'Canada recognizes Roth under treaty. Growth tax-free.', effectiveTaxType: 'exempt' };
crossBorderTreatment['ca_rrsp->US'] = { treatment: 'Recognized under treaty. Taxed as income on withdrawal.', effectiveTaxType: 'income' };
crossBorderTreatment['ca_tfsa->US'] = { treatment: 'NOT recognized by IRS. Taxed annually on gains.', warning: 'TFSA loses tax-free status for US persons.', effectiveTaxType: 'capitalGains' };
crossBorderTreatment['crypto->CA'] = { treatment: '50% of gains included in income. Taxed at marginal rate.', effectiveTaxType: 'capitalGains' };

// AUSTRALIA
countries['AU'] = {
  code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', flag: '🇦🇺',
  capitalGains: {
    shortTerm: [{ min: 0, max: 18200, rate: 0 }, { min: 18200, max: 45000, rate: 0.19 }, { min: 45000, max: 120000, rate: 0.325 }, { min: 120000, max: 180000, rate: 0.37 }, { min: 180000, max: null, rate: 0.45 }],
    longTerm: [{ min: 0, max: 18200, rate: 0 }, { min: 18200, max: 45000, rate: 0.095 }, { min: 45000, max: 120000, rate: 0.1625 }, { min: 120000, max: 180000, rate: 0.185 }, { min: 180000, max: null, rate: 0.225 }], // 50% discount
    longTermThresholdMonths: 12,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 18200, rate: 0 },
      { min: 18200, max: 45000, rate: 0.19 },
      { min: 45000, max: 120000, rate: 0.325 },
      { min: 120000, max: 180000, rate: 0.37 },
      { min: 180000, max: null, rate: 0.45 },
    ],
    personalAllowance: 0, // Built into brackets
  },
  socialTaxes: { name: 'Medicare Levy', employeeRate: 0.02, selfEmployedRate: 0.02, threshold: 24276, appliesToInvestmentIncome: true, appliesToPensions: true },
  retirementAccounts: [
    { name: 'Superannuation', taxOnContribution: 'special', taxOnGrowth: 'special', taxOnWithdrawal: 'exempt', accessAge: 60, notes: '15% tax on contributions. Tax-free after 60.' },
  ],
  healthcare: { system: 'Medicare', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Universal Medicare. Private insurance common for extras.' },
  costOfLiving: { index: 80, monthlyRentCity: 2400, monthlyRentSuburb: 1600, notes: 'Sydney/Melbourne expensive. Other cities more affordable.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'US-Australia treaty. Super recognized.' },
};

countryAccountTypes['AU'] = [
  { id: 'au_super', name: 'Superannuation', shortName: 'Super', description: 'Australian retirement. 15% contribution tax, tax-free after 60.', taxTreatmentDomestic: '15% in, 0% out', icon: '🏦' },
  { id: 'au_taxable', name: 'Share Trading Account', shortName: 'Shares', description: 'Regular investment. 50% CGT discount if held 12+ months.', taxTreatmentDomestic: '50% discount', icon: '📈' },
];

crossBorderTreatment['us_traditional->AU'] = { treatment: 'US-Australia treaty applies. Taxed as income in Australia.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->AU'] = { treatment: 'Australia likely taxes Roth growth. Treaty unclear.', warning: 'Roth treatment uncertain. Seek advice.', effectiveTaxType: 'special' };
crossBorderTreatment['au_super->US'] = { treatment: 'May be taxable in US. Complex rules apply.', warning: 'Super is a foreign trust for US tax purposes.', effectiveTaxType: 'income' };
crossBorderTreatment['crypto->AU'] = { treatment: '50% CGT discount if held 12+ months. Otherwise marginal rate.', effectiveTaxType: 'capitalGains' };

// FRANCE
countries['FR'] = {
  code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', flag: '🇫🇷',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.30 }], // PFU flat tax
    longTerm: [{ min: 0, max: null, rate: 0.30 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 11294, rate: 0 },
      { min: 11294, max: 28797, rate: 0.11 },
      { min: 28797, max: 82341, rate: 0.30 },
      { min: 82341, max: 177106, rate: 0.41 },
      { min: 177106, max: null, rate: 0.45 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'Social Charges', employeeRate: 0.172, selfEmployedRate: 0.172, threshold: 0, appliesToInvestmentIncome: true, appliesToPensions: true },
  retirementAccounts: [
    { name: 'PER (Plan Épargne Retraite)', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 62, notes: 'Tax-deductible contributions. Taxed on withdrawal.' },
    { name: 'Assurance Vie', taxOnContribution: 'taxed', taxOnGrowth: 'special', taxOnWithdrawal: 'special', accessAge: 0, notes: 'After 8 years: €4,600 exemption, 7.5% on gains.' },
  ],
  healthcare: { system: 'Sécurité Sociale', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Excellent universal healthcare. ~70% reimbursed, top-up insurance common.' },
  costOfLiving: { index: 75, monthlyRentCity: 1500, monthlyRentSuburb: 1000, notes: 'Paris expensive. Provinces very affordable.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: true, exitTaxDetails: 'Exit tax on >€800k gains or >50% company stake.', taxTreatyNotes: 'US-France treaty. Social charges apply to investment income.' },
};

countryAccountTypes['FR'] = [
  { id: 'fr_per', name: 'PER', shortName: 'PER', description: 'French retirement plan. Tax-deductible contributions.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'fr_av', name: 'Assurance Vie', shortName: 'Assurance Vie', description: 'Life insurance wrapper. Great tax benefits after 8 years.', taxTreatmentDomestic: '7.5% after 8yr', icon: '✨' },
  { id: 'fr_cto', name: 'CTO (Compte-Titres)', shortName: 'CTO', description: 'Regular brokerage. 30% flat tax (PFU) on gains.', taxTreatmentDomestic: '30% PFU', icon: '📈' },
];

crossBorderTreatment['us_traditional->FR'] = { treatment: 'US-France treaty applies. Taxed as income plus social charges.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->FR'] = { treatment: 'France may not recognize Roth benefits.', warning: '17.2% social charges may apply to Roth gains.', effectiveTaxType: 'special' };
crossBorderTreatment['crypto->FR'] = { treatment: '30% flat tax (PFU) on gains when converting to fiat.', effectiveTaxType: 'capitalGains' };

// ITALY
countries['IT'] = {
  code: 'IT', name: 'Italy', currency: 'EUR', currencySymbol: '€', flag: '🇮🇹',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.26 }],
    longTerm: [{ min: 0, max: null, rate: 0.26 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 28000, rate: 0.23 },
      { min: 28000, max: 50000, rate: 0.35 },
      { min: 50000, max: null, rate: 0.43 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'INPS', employeeRate: 0.0919, selfEmployedRate: 0.26, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'Fondo Pensione', taxOnContribution: 'exempt', taxOnGrowth: 'special', taxOnWithdrawal: 'special', accessAge: 57, notes: 'Tax-deductible up to €5,164/year. 15% on withdrawal (down to 9% after 35 years).' },
  ],
  healthcare: { system: 'SSN (Servizio Sanitario Nazionale)', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 0, estimatedAnnualCostPostRetirement: 0, notes: 'Universal healthcare for residents. Quality varies by region.' },
  costOfLiving: { index: 65, monthlyRentCity: 1200, monthlyRentSuburb: 700, notes: 'Milan expensive. South very affordable.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: false,
    specialRegimes: [
      { name: 'Flat Tax for Retirees', duration: '10 years', benefits: '7% flat tax on ALL foreign income for retirees in Southern Italy/small towns.', eligibility: 'Pensioners moving to municipalities <20k population in Southern regions.' },
      { name: 'Impatriate Regime', duration: '5-10 years', benefits: '70-90% income exemption for workers.', eligibility: 'Not resident in Italy for 2+ years. Must work in Italy.' },
    ],
    taxTreatyNotes: 'US-Italy treaty. 7% retiree regime is exceptional.',
  },
};

countryAccountTypes['IT'] = [
  { id: 'it_pension', name: 'Fondo Pensione', shortName: 'Pension', description: 'Italian pension fund. Tax benefits on contributions.', taxTreatmentDomestic: 'Tax-advantaged', icon: '🏦' },
  { id: 'it_investment', name: 'Conto Titoli', shortName: 'Investment', description: 'Investment account. 26% flat tax on gains.', taxTreatmentDomestic: '26% flat', icon: '📈' },
];

crossBorderTreatment['us_traditional->IT'] = { treatment: 'US-Italy treaty applies. Taxed as income or 7% if eligible.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->IT'] = { treatment: 'May qualify for 7% flat tax if retiree regime applies.', effectiveTaxType: 'special' };
crossBorderTreatment['crypto->IT'] = { treatment: '26% flat tax on gains over €2,000.', effectiveTaxType: 'capitalGains' };

// SWITZERLAND
countries['CH'] = {
  code: 'CH', name: 'Switzerland', currency: 'CHF', currencySymbol: 'CHF', flag: '🇨🇭',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0 }], // No CGT on private assets!
    longTerm: [{ min: 0, max: null, rate: 0 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 31600, rate: 0 },
      { min: 31600, max: 41400, rate: 0.0077 },
      { min: 41400, max: 55200, rate: 0.0088 },
      { min: 55200, max: 72500, rate: 0.0264 },
      { min: 72500, max: 78100, rate: 0.0297 },
      { min: 78100, max: 103600, rate: 0.0561 },
      { min: 103600, max: 134600, rate: 0.0666 },
      { min: 134600, max: 176000, rate: 0.0888 },
      { min: 176000, max: null, rate: 0.115 },
    ], // Federal only - cantonal varies!
    personalAllowance: 0,
  },
  socialTaxes: { name: 'AHV/IV/EO', employeeRate: 0.05125, selfEmployedRate: 0.10, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: true },
  retirementAccounts: [
    { name: 'Pillar 2 (BVG)', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'special', accessAge: 58, notes: 'Occupational pension. Lump sum taxed at reduced rate.' },
    { name: 'Pillar 3a', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'special', accessAge: 59, notes: 'Private pension. Tax-deductible contributions.' },
  ],
  healthcare: { system: 'Mandatory Private', publicAccessForResidents: false, estimatedAnnualCostPreRetirement: 6000, estimatedAnnualCostPostRetirement: 8000, notes: 'Mandatory private insurance. CHF 300-600/month.' },
  costOfLiving: { index: 130, monthlyRentCity: 2500, monthlyRentSuburb: 1800, notes: 'Very expensive. Zurich/Geneva highest.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: false, specialRegimes: [{ name: 'Lump-sum Taxation', duration: 'Ongoing', benefits: 'Tax based on living expenses, not income/assets.', eligibility: 'Non-Swiss, no gainful employment in CH. Min CHF 400k/year base.' }], taxTreatyNotes: 'US-CH treaty. No CGT is major advantage.' },
};

countryAccountTypes['CH'] = [
  { id: 'ch_pillar2', name: 'Pillar 2 (BVG)', shortName: 'Pillar 2', description: 'Swiss occupational pension. Tax-free growth.', taxTreatmentDomestic: 'Tax-advantaged', icon: '🏦' },
  { id: 'ch_pillar3a', name: 'Pillar 3a', shortName: 'Pillar 3a', description: 'Private pension. Tax-deductible contributions.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'ch_investment', name: 'Investment Account', shortName: 'Investment', description: 'No capital gains tax on private investments!', taxTreatmentDomestic: '0% CGT', icon: '✨' },
];

crossBorderTreatment['us_traditional->CH'] = { treatment: 'US-CH treaty applies. Taxed as income in Switzerland.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->CH'] = { treatment: 'Switzerland may not recognize Roth. Dividends taxed as income.', effectiveTaxType: 'special' };
crossBorderTreatment['crypto->CH'] = { treatment: 'No CGT on crypto! Only wealth tax applies.', effectiveTaxType: 'capitalGains' };

// UAE (Dubai)
countries['AE'] = {
  code: 'AE', name: 'UAE (Dubai)', currency: 'AED', currencySymbol: 'AED', flag: '🇦🇪',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0 }],
    longTerm: [{ min: 0, max: null, rate: 0 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [{ min: 0, max: null, rate: 0 }],
    personalAllowance: 0,
  },
  retirementAccounts: [
    { name: 'DEWS/End of Service', taxOnContribution: 'taxed', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 0, notes: 'Employer gratuity scheme. No formal pension system.' },
  ],
  healthcare: { system: 'Mandatory Private (Dubai)', publicAccessForResidents: false, estimatedAnnualCostPreRetirement: 3000, estimatedAnnualCostPostRetirement: 5000, notes: 'Mandatory employer insurance. Retirees need private coverage.' },
  costOfLiving: { index: 70, monthlyRentCity: 2000, monthlyRentSuburb: 1400, notes: 'Dubai expensive. Other emirates cheaper.' },
  expatRules: { taxationBasis: 'territorial', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'Limited treaties. No income tax but US citizens still owe US tax.' },
};

countryAccountTypes['AE'] = [
  { id: 'ae_investment', name: 'Investment Account', shortName: 'Investment', description: 'No income tax, no CGT. Tax haven.', taxTreatmentDomestic: '0% tax', icon: '✨' },
];

crossBorderTreatment['us_traditional->AE'] = { treatment: 'No UAE tax, but US citizens still owe US tax.', warning: 'US citizens cannot escape US tax by moving to UAE.', effectiveTaxType: 'income' };
crossBorderTreatment['crypto->AE'] = { treatment: 'No tax on crypto gains in UAE.', effectiveTaxType: 'capitalGains' };

// SINGAPORE
countries['SG'] = {
  code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', flag: '🇸🇬',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0 }], // No CGT
    longTerm: [{ min: 0, max: null, rate: 0 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 20000, rate: 0 },
      { min: 20000, max: 30000, rate: 0.02 },
      { min: 30000, max: 40000, rate: 0.035 },
      { min: 40000, max: 80000, rate: 0.07 },
      { min: 80000, max: 120000, rate: 0.115 },
      { min: 120000, max: 160000, rate: 0.15 },
      { min: 160000, max: 200000, rate: 0.18 },
      { min: 200000, max: 240000, rate: 0.19 },
      { min: 240000, max: 280000, rate: 0.195 },
      { min: 280000, max: 320000, rate: 0.20 },
      { min: 320000, max: 500000, rate: 0.22 },
      { min: 500000, max: 1000000, rate: 0.23 },
      { min: 1000000, max: null, rate: 0.24 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'CPF', employeeRate: 0.20, selfEmployedRate: 0.105, threshold: 0, cap: 102000, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'CPF', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 55, notes: 'Central Provident Fund. Mandatory for employees. Tax-free.' },
    { name: 'SRS', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'special', accessAge: 62, notes: 'Supplementary Retirement. 50% of withdrawals taxed.' },
  ],
  healthcare: { system: 'Medisave + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 1500, estimatedAnnualCostPostRetirement: 2000, notes: 'Excellent healthcare. Subsidized for residents.' },
  costOfLiving: { index: 90, monthlyRentCity: 3000, monthlyRentSuburb: 2200, notes: 'Expensive but efficient. No car needed.' },
  expatRules: { taxationBasis: 'territorial', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'Limited US treaty. Foreign-sourced income not taxed if not remitted.' },
};

countryAccountTypes['SG'] = [
  { id: 'sg_cpf', name: 'CPF', shortName: 'CPF', description: 'Central Provident Fund. Mandatory, tax-free.', taxTreatmentDomestic: 'Tax-free', icon: '🏦' },
  { id: 'sg_srs', name: 'SRS', shortName: 'SRS', description: 'Supplementary Retirement. Tax-advantaged.', taxTreatmentDomestic: '50% taxed', icon: '🏦' },
  { id: 'sg_investment', name: 'Investment Account', shortName: 'Investment', description: 'No CGT in Singapore!', taxTreatmentDomestic: '0% CGT', icon: '✨' },
];

crossBorderTreatment['us_traditional->SG'] = { treatment: 'No Singapore tax on pensions. US citizens still owe US tax.', effectiveTaxType: 'income' };
crossBorderTreatment['crypto->SG'] = { treatment: 'No tax on crypto gains if not trading professionally.', effectiveTaxType: 'capitalGains' };

// MEXICO
countries['MX'] = {
  code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: 'MX$', flag: '🇲🇽',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.10 }], // 10% on securities
    longTerm: [{ min: 0, max: null, rate: 0.10 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 8952, rate: 0.0192 },
      { min: 8952, max: 75984, rate: 0.064 },
      { min: 75984, max: 133536, rate: 0.1088 },
      { min: 133536, max: 155229, rate: 0.16 },
      { min: 155229, max: 185852, rate: 0.1792 },
      { min: 185852, max: 374837, rate: 0.2136 },
      { min: 374837, max: 590796, rate: 0.2352 },
      { min: 590796, max: 1127926, rate: 0.30 },
      { min: 1127926, max: 1503902, rate: 0.32 },
      { min: 1503902, max: 4511707, rate: 0.34 },
      { min: 4511707, max: null, rate: 0.35 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'IMSS', employeeRate: 0.02, selfEmployedRate: 0.05, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'AFORE', taxOnContribution: 'exempt', taxOnGrowth: 'deferred', taxOnWithdrawal: 'income', accessAge: 60, notes: 'Mandatory pension. Tax-deductible contributions.' },
  ],
  healthcare: { system: 'IMSS/INSABI + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 500, estimatedAnnualCostPostRetirement: 1000, notes: 'Public available. Most expats use private ($50-200/month).' },
  costOfLiving: { index: 35, monthlyRentCity: 800, monthlyRentSuburb: 500, notes: 'Very affordable. CDMX pricier, beach towns moderate.' },
  expatRules: { taxationBasis: 'worldwide', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'US-Mexico treaty. Popular with US retirees for low cost.' },
};

countryAccountTypes['MX'] = [
  { id: 'mx_afore', name: 'AFORE', shortName: 'AFORE', description: 'Mexican pension system.', taxTreatmentDomestic: 'Tax-deferred', icon: '🏦' },
  { id: 'mx_investment', name: 'Casa de Bolsa', shortName: 'Investment', description: 'Brokerage account. 10% flat tax on securities gains.', taxTreatmentDomestic: '10% flat', icon: '📈' },
];

crossBorderTreatment['us_traditional->MX'] = { treatment: 'US-Mexico treaty applies. Taxed as income in Mexico.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->MX'] = { treatment: 'Mexico may not recognize Roth tax-free status.', warning: 'Unclear treatment. Growth may be taxed.', effectiveTaxType: 'special' };
crossBorderTreatment['crypto->MX'] = { treatment: '10% tax on crypto gains.', effectiveTaxType: 'capitalGains' };

// THAILAND - Popular FIRE destination
countries['TH'] = {
  code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', flag: '🇹🇭',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0 }], // No CGT for individuals on securities
    longTerm: [{ min: 0, max: null, rate: 0 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 150000, rate: 0 },
      { min: 150000, max: 300000, rate: 0.05 },
      { min: 300000, max: 500000, rate: 0.10 },
      { min: 500000, max: 750000, rate: 0.15 },
      { min: 750000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: 2000000, rate: 0.25 },
      { min: 2000000, max: 5000000, rate: 0.30 },
      { min: 5000000, max: null, rate: 0.35 },
    ],
    personalAllowance: 60000,
  },
  socialTaxes: { name: 'Social Security', employeeRate: 0.05, selfEmployedRate: 0, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [
    { name: 'RMF/SSF', taxOnContribution: 'exempt', taxOnGrowth: 'exempt', taxOnWithdrawal: 'exempt', accessAge: 55, notes: 'Tax-advantaged retirement funds.' },
  ],
  healthcare: { system: 'Private', publicAccessForResidents: false, estimatedAnnualCostPreRetirement: 1500, estimatedAnnualCostPostRetirement: 3000, notes: 'Excellent private healthcare. $100-300/month for insurance. Increases with age.' },
  costOfLiving: { index: 30, monthlyRentCity: 600, monthlyRentSuburb: 350, notes: 'Very low cost. Bangkok pricier, Chiang Mai popular with expats.' },
  expatRules: { taxationBasis: 'remittance', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'Only taxed on income remitted to Thailand in same year earned. Foreign income not remitted = tax-free.' },
};

countryAccountTypes['TH'] = [
  { id: 'th_rmf', name: 'RMF/SSF', shortName: 'RMF', description: 'Thai retirement mutual funds with tax benefits.', taxTreatmentDomestic: 'Tax-exempt', icon: '🏦' },
  { id: 'th_investment', name: 'Brokerage', shortName: 'Investment', description: 'Investment account. No CGT on securities.', taxTreatmentDomestic: 'No CGT', icon: '📈' },
];

crossBorderTreatment['us_traditional->TH'] = { treatment: 'Taxed as income if remitted. US-Thai treaty provides some relief.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->TH'] = { treatment: 'Not remitted = not taxed. Remitted = uncertain treatment.', effectiveTaxType: 'special' };

// COSTA RICA - Popular FIRE destination
countries['CR'] = {
  code: 'CR', name: 'Costa Rica', currency: 'CRC', currencySymbol: '₡', flag: '🇨🇷',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.15 }],
    longTerm: [{ min: 0, max: null, rate: 0.15 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 4200000, rate: 0 },
      { min: 4200000, max: 6300000, rate: 0.10 },
      { min: 6300000, max: 10500000, rate: 0.15 },
      { min: 10500000, max: 21000000, rate: 0.20 },
      { min: 21000000, max: null, rate: 0.25 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'CCSS', employeeRate: 0.1067, selfEmployedRate: 0.1067, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [],
  healthcare: { system: 'CCSS + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 1200, estimatedAnnualCostPostRetirement: 1800, notes: 'CCSS public system for residents (~$100/month). Private $100-200/month.' },
  costOfLiving: { index: 45, monthlyRentCity: 900, monthlyRentSuburb: 600, notes: 'Moderate cost. Beach towns popular. Central Valley affordable.' },
  expatRules: { taxationBasis: 'territorial', citizenshipBasedTaxation: false, hasExitTax: false, taxTreatyNotes: 'TERRITORIAL taxation - foreign income NOT taxed! Only Costa Rica-sourced income taxed.' },
};

countryAccountTypes['CR'] = [
  { id: 'cr_investment', name: 'Investment Account', shortName: 'Investment', description: 'Local brokerage. 15% CGT.', taxTreatmentDomestic: '15% CGT', icon: '📈' },
];

crossBorderTreatment['us_traditional->CR'] = { treatment: 'TERRITORIAL: US-sourced 401k withdrawals NOT taxed in Costa Rica!', effectiveTaxType: 'none' };
crossBorderTreatment['us_roth->CR'] = { treatment: 'TERRITORIAL: Not taxed in Costa Rica as foreign-sourced.', effectiveTaxType: 'none' };

// GREECE - Popular FIRE destination with special tax regime
countries['GR'] = {
  code: 'GR', name: 'Greece', currency: 'EUR', currencySymbol: '€', flag: '🇬🇷',
  capitalGains: {
    shortTerm: [{ min: 0, max: null, rate: 0.15 }],
    longTerm: [{ min: 0, max: null, rate: 0.15 }],
    longTermThresholdMonths: 0,
    annualExemption: 0,
    hasDeemDisposal: false,
  },
  incomeTax: {
    brackets: [
      { min: 0, max: 10000, rate: 0.09 },
      { min: 10000, max: 20000, rate: 0.22 },
      { min: 20000, max: 30000, rate: 0.28 },
      { min: 30000, max: 40000, rate: 0.36 },
      { min: 40000, max: null, rate: 0.44 },
    ],
    personalAllowance: 0,
  },
  socialTaxes: { name: 'EFKA', employeeRate: 0.1387, selfEmployedRate: 0.20, threshold: 0, appliesToInvestmentIncome: false, appliesToPensions: false },
  retirementAccounts: [],
  healthcare: { system: 'ESY + Private', publicAccessForResidents: true, estimatedAnnualCostPreRetirement: 600, estimatedAnnualCostPostRetirement: 1200, notes: 'Public ESY available. Private €50-150/month recommended.' },
  costOfLiving: { index: 55, monthlyRentCity: 800, monthlyRentSuburb: 500, notes: 'Affordable. Islands more expensive. Athens moderate.' },
  expatRules: {
    taxationBasis: 'worldwide',
    citizenshipBasedTaxation: false,
    hasExitTax: false,
    specialRegimes: [
      { name: 'Non-Dom Regime', duration: '15 years', benefits: '7% flat tax on foreign income. No reporting of foreign assets.', eligibility: 'Not Greek tax resident for 5 of 6 prior years. Min €100k/year foreign income.' },
    ],
    taxTreatyNotes: 'US-Greece treaty. Non-Dom regime very attractive for retirees with foreign pensions.',
  },
};

countryAccountTypes['GR'] = [
  { id: 'gr_investment', name: 'Investment Account', shortName: 'Investment', description: 'Brokerage. 15% CGT.', taxTreatmentDomestic: '15% CGT', icon: '📈' },
];

crossBorderTreatment['us_traditional->GR'] = { treatment: 'Taxed as income. Non-Dom: 7% flat on foreign income.', effectiveTaxType: 'income' };
crossBorderTreatment['us_roth->GR'] = { treatment: 'May be taxed as income. Non-Dom: 7% flat.', warning: 'Greece may not recognize Roth tax-free status.', effectiveTaxType: 'special' };

// Add new currency exchange rates
exchangeRates['USD-CAD'] = 1.36;
exchangeRates['CAD-USD'] = 0.74;
exchangeRates['USD-AUD'] = 1.53;
exchangeRates['AUD-USD'] = 0.65;
exchangeRates['USD-CHF'] = 0.88;
exchangeRates['CHF-USD'] = 1.14;
exchangeRates['USD-AED'] = 3.67;
exchangeRates['AED-USD'] = 0.27;
exchangeRates['USD-SGD'] = 1.34;
exchangeRates['SGD-USD'] = 0.75;
exchangeRates['USD-MXN'] = 17.15;
exchangeRates['MXN-USD'] = 0.058;
exchangeRates['EUR-CHF'] = 0.96;
exchangeRates['CHF-EUR'] = 1.04;
exchangeRates['GBP-CHF'] = 1.12;
exchangeRates['CHF-GBP'] = 0.89;
// New currencies
exchangeRates['USD-THB'] = 35.5;
exchangeRates['THB-USD'] = 0.028;
exchangeRates['USD-CRC'] = 510;
exchangeRates['CRC-USD'] = 0.00196;
exchangeRates['EUR-THB'] = 38.5;
exchangeRates['THB-EUR'] = 0.026;
exchangeRates['EUR-CRC'] = 555;
exchangeRates['CRC-EUR'] = 0.0018;
