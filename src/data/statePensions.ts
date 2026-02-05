// State/Public Pension data by country
// Includes eligibility age and estimated annual amounts

export interface StatePensionInfo {
  name: string;
  shortName: string;
  eligibilityAge: number;
  maxAnnualBenefit: number;  // In local currency
  averageAnnualBenefit: number;  // In local currency
  currency: string;
  notes: string;
  canClaimAbroad: boolean;
}

export const statePensions: Record<string, StatePensionInfo> = {
  US: {
    name: 'Social Security',
    shortName: 'SS',
    eligibilityAge: 67,  // Full retirement age for those born 1960+
    maxAnnualBenefit: 57288,  // $4,774/month max in 2025
    averageAnnualBenefit: 22000,  // ~$1,833/month average
    currency: 'USD',
    notes: 'Can claim early at 62 with reduced benefits. Delayed credits until 70.',
    canClaimAbroad: true,
  },
  UK: {
    name: 'State Pension',
    shortName: 'State Pension',
    eligibilityAge: 66,  // Rising to 67 by 2028
    maxAnnualBenefit: 11502,  // £221.20/week full new State Pension 2024/25
    averageAnnualBenefit: 9500,
    currency: 'GBP',
    notes: 'Need 35 qualifying years for full pension. Can defer for higher payments.',
    canClaimAbroad: true,
  },
  DE: {
    name: 'Gesetzliche Rentenversicherung',
    shortName: 'State Pension',
    eligibilityAge: 67,
    maxAnnualBenefit: 38000,
    averageAnnualBenefit: 18000,
    currency: 'EUR',
    notes: 'Based on earnings points accumulated during working years.',
    canClaimAbroad: true,
  },
  FR: {
    name: 'Retraite de base',
    shortName: 'State Pension',
    eligibilityAge: 64,  // Reformed in 2023
    maxAnnualBenefit: 42000,
    averageAnnualBenefit: 17000,
    currency: 'EUR',
    notes: 'Complex system with multiple schemes. Age rising gradually.',
    canClaimAbroad: true,
  },
  ES: {
    name: 'Pensión de jubilación',
    shortName: 'State Pension',
    eligibilityAge: 67,
    maxAnnualBenefit: 44450,
    averageAnnualBenefit: 16000,
    currency: 'EUR',
    notes: 'Requires minimum 15 years contributions.',
    canClaimAbroad: true,
  },
  PT: {
    name: 'Pensão de velhice',
    shortName: 'State Pension',
    eligibilityAge: 66,
    maxAnnualBenefit: 30000,
    averageAnnualBenefit: 9000,
    currency: 'EUR',
    notes: 'Based on contributions and career length.',
    canClaimAbroad: true,
  },
  IT: {
    name: 'Pensione di vecchiaia',
    shortName: 'State Pension',
    eligibilityAge: 67,
    maxAnnualBenefit: 40000,
    averageAnnualBenefit: 18000,
    currency: 'EUR',
    notes: 'Requires minimum 20 years contributions.',
    canClaimAbroad: true,
  },
  NL: {
    name: 'AOW (Algemene Ouderdomswet)',
    shortName: 'AOW',
    eligibilityAge: 67,
    maxAnnualBenefit: 18000,
    averageAnnualBenefit: 15000,
    currency: 'EUR',
    notes: 'Flat-rate pension based on years lived/worked in NL.',
    canClaimAbroad: true,
  },
  IE: {
    name: 'State Pension (Contributory)',
    shortName: 'State Pension',
    eligibilityAge: 66,
    maxAnnualBenefit: 14420,  // €277.30/week max
    averageAnnualBenefit: 12000,
    currency: 'EUR',
    notes: 'Based on PRSI contributions. Non-contributory also available.',
    canClaimAbroad: true,
  },
  CH: {
    name: 'AHV/AVS (1st Pillar)',
    shortName: 'AHV',
    eligibilityAge: 65,
    maxAnnualBenefit: 29400,  // CHF 2,450/month max
    averageAnnualBenefit: 22000,
    currency: 'CHF',
    notes: 'Universal coverage. 2nd and 3rd pillars provide additional retirement income.',
    canClaimAbroad: true,
  },
  CA: {
    name: 'CPP/QPP + OAS',
    shortName: 'CPP/OAS',
    eligibilityAge: 65,
    maxAnnualBenefit: 24000,  // Combined CPP + OAS max
    averageAnnualBenefit: 15000,
    currency: 'CAD',
    notes: 'CPP based on contributions, OAS based on residency. GIS for low income.',
    canClaimAbroad: true,
  },
  AU: {
    name: 'Age Pension',
    shortName: 'Age Pension',
    eligibilityAge: 67,
    maxAnnualBenefit: 28000,
    averageAnnualBenefit: 24000,
    currency: 'AUD',
    notes: 'Means-tested. Superannuation is separate.',
    canClaimAbroad: true,
  },
  JP: {
    name: 'Kokumin Nenkin',
    shortName: 'National Pension',
    eligibilityAge: 65,
    maxAnnualBenefit: 800000,  // About ¥66,000/month
    averageAnnualBenefit: 650000,
    currency: 'JPY',
    notes: 'Basic pension plus earnings-related component.',
    canClaimAbroad: true,
  },
  SG: {
    name: 'CPF LIFE',
    shortName: 'CPF',
    eligibilityAge: 65,
    maxAnnualBenefit: 24000,
    averageAnnualBenefit: 15000,
    currency: 'SGD',
    notes: 'Annuity scheme from CPF savings. Payout depends on savings.',
    canClaimAbroad: false,  // Must remain in SG or return periodically
  },
  MX: {
    name: 'IMSS Pension',
    shortName: 'IMSS',
    eligibilityAge: 65,
    maxAnnualBenefit: 120000,
    averageAnnualBenefit: 60000,
    currency: 'MXN',
    notes: 'Based on AFORE savings and contributions.',
    canClaimAbroad: true,
  },
  NZ: {
    name: 'NZ Superannuation',
    shortName: 'NZ Super',
    eligibilityAge: 65,
    maxAnnualBenefit: 26000,
    averageAnnualBenefit: 24000,
    currency: 'NZD',
    notes: 'Universal pension based on residency, not contributions.',
    canClaimAbroad: true,
  },
};

// Get pension info for a country, with fallback
export function getStatePension(countryCode: string): StatePensionInfo | null {
  return statePensions[countryCode] || null;
}
