export interface USState {
  code: string;
  name: string;
  incomeTaxRate: number; // Top marginal rate for simplicity
  hasNoIncomeTax: boolean;
  capitalGainsRate: number; // Most states tax CG as income
  notes?: string;
}

export const usStates: USState[] = [
  { code: 'AL', name: 'Alabama', incomeTaxRate: 0.05, hasNoIncomeTax: false, capitalGainsRate: 0.05 },
  { code: 'AK', name: 'Alaska', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'AZ', name: 'Arizona', incomeTaxRate: 0.025, hasNoIncomeTax: false, capitalGainsRate: 0.025 },
  { code: 'AR', name: 'Arkansas', incomeTaxRate: 0.047, hasNoIncomeTax: false, capitalGainsRate: 0.047 },
  { code: 'CA', name: 'California', incomeTaxRate: 0.133, hasNoIncomeTax: false, capitalGainsRate: 0.133, notes: 'Highest state income tax' },
  { code: 'CO', name: 'Colorado', incomeTaxRate: 0.044, hasNoIncomeTax: false, capitalGainsRate: 0.044 },
  { code: 'CT', name: 'Connecticut', incomeTaxRate: 0.0699, hasNoIncomeTax: false, capitalGainsRate: 0.0699 },
  { code: 'DE', name: 'Delaware', incomeTaxRate: 0.066, hasNoIncomeTax: false, capitalGainsRate: 0.066 },
  { code: 'FL', name: 'Florida', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'GA', name: 'Georgia', incomeTaxRate: 0.0549, hasNoIncomeTax: false, capitalGainsRate: 0.0549 },
  { code: 'HI', name: 'Hawaii', incomeTaxRate: 0.11, hasNoIncomeTax: false, capitalGainsRate: 0.0725 },
  { code: 'ID', name: 'Idaho', incomeTaxRate: 0.058, hasNoIncomeTax: false, capitalGainsRate: 0.058 },
  { code: 'IL', name: 'Illinois', incomeTaxRate: 0.0495, hasNoIncomeTax: false, capitalGainsRate: 0.0495 },
  { code: 'IN', name: 'Indiana', incomeTaxRate: 0.0315, hasNoIncomeTax: false, capitalGainsRate: 0.0315 },
  { code: 'IA', name: 'Iowa', incomeTaxRate: 0.057, hasNoIncomeTax: false, capitalGainsRate: 0.057 },
  { code: 'KS', name: 'Kansas', incomeTaxRate: 0.057, hasNoIncomeTax: false, capitalGainsRate: 0.057 },
  { code: 'KY', name: 'Kentucky', incomeTaxRate: 0.04, hasNoIncomeTax: false, capitalGainsRate: 0.04 },
  { code: 'LA', name: 'Louisiana', incomeTaxRate: 0.0425, hasNoIncomeTax: false, capitalGainsRate: 0.0425 },
  { code: 'ME', name: 'Maine', incomeTaxRate: 0.0715, hasNoIncomeTax: false, capitalGainsRate: 0.0715 },
  { code: 'MD', name: 'Maryland', incomeTaxRate: 0.0575, hasNoIncomeTax: false, capitalGainsRate: 0.0575 },
  { code: 'MA', name: 'Massachusetts', incomeTaxRate: 0.09, hasNoIncomeTax: false, capitalGainsRate: 0.09, notes: 'Includes 4% surtax on income over $1M' },
  { code: 'MI', name: 'Michigan', incomeTaxRate: 0.0425, hasNoIncomeTax: false, capitalGainsRate: 0.0425 },
  { code: 'MN', name: 'Minnesota', incomeTaxRate: 0.0985, hasNoIncomeTax: false, capitalGainsRate: 0.0985 },
  { code: 'MS', name: 'Mississippi', incomeTaxRate: 0.05, hasNoIncomeTax: false, capitalGainsRate: 0.05 },
  { code: 'MO', name: 'Missouri', incomeTaxRate: 0.048, hasNoIncomeTax: false, capitalGainsRate: 0.048 },
  { code: 'MT', name: 'Montana', incomeTaxRate: 0.059, hasNoIncomeTax: false, capitalGainsRate: 0.059 },
  { code: 'NE', name: 'Nebraska', incomeTaxRate: 0.0584, hasNoIncomeTax: false, capitalGainsRate: 0.0584 },
  { code: 'NV', name: 'Nevada', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'NH', name: 'New Hampshire', incomeTaxRate: 0.03, hasNoIncomeTax: false, capitalGainsRate: 0, notes: 'Tax on interest/dividends only (phasing out)' },
  { code: 'NJ', name: 'New Jersey', incomeTaxRate: 0.1075, hasNoIncomeTax: false, capitalGainsRate: 0.1075 },
  { code: 'NM', name: 'New Mexico', incomeTaxRate: 0.059, hasNoIncomeTax: false, capitalGainsRate: 0.059 },
  { code: 'NY', name: 'New York', incomeTaxRate: 0.109, hasNoIncomeTax: false, capitalGainsRate: 0.109, notes: 'NYC adds up to 3.88% more' },
  { code: 'NC', name: 'North Carolina', incomeTaxRate: 0.0475, hasNoIncomeTax: false, capitalGainsRate: 0.0475 },
  { code: 'ND', name: 'North Dakota', incomeTaxRate: 0.029, hasNoIncomeTax: false, capitalGainsRate: 0.029 },
  { code: 'OH', name: 'Ohio', incomeTaxRate: 0.0399, hasNoIncomeTax: false, capitalGainsRate: 0.0399 },
  { code: 'OK', name: 'Oklahoma', incomeTaxRate: 0.0475, hasNoIncomeTax: false, capitalGainsRate: 0.0475 },
  { code: 'OR', name: 'Oregon', incomeTaxRate: 0.099, hasNoIncomeTax: false, capitalGainsRate: 0.099 },
  { code: 'PA', name: 'Pennsylvania', incomeTaxRate: 0.0307, hasNoIncomeTax: false, capitalGainsRate: 0.0307 },
  { code: 'RI', name: 'Rhode Island', incomeTaxRate: 0.0599, hasNoIncomeTax: false, capitalGainsRate: 0.0599 },
  { code: 'SC', name: 'South Carolina', incomeTaxRate: 0.064, hasNoIncomeTax: false, capitalGainsRate: 0.064 },
  { code: 'SD', name: 'South Dakota', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'TN', name: 'Tennessee', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'TX', name: 'Texas', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'UT', name: 'Utah', incomeTaxRate: 0.0465, hasNoIncomeTax: false, capitalGainsRate: 0.0465 },
  { code: 'VT', name: 'Vermont', incomeTaxRate: 0.0875, hasNoIncomeTax: false, capitalGainsRate: 0.0875 },
  { code: 'VA', name: 'Virginia', incomeTaxRate: 0.0575, hasNoIncomeTax: false, capitalGainsRate: 0.0575 },
  { code: 'WA', name: 'Washington', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0.07, notes: 'No income tax, but 7% CG tax on gains over $270K' },
  { code: 'WV', name: 'West Virginia', incomeTaxRate: 0.055, hasNoIncomeTax: false, capitalGainsRate: 0.055 },
  { code: 'WI', name: 'Wisconsin', incomeTaxRate: 0.0765, hasNoIncomeTax: false, capitalGainsRate: 0.0765 },
  { code: 'WY', name: 'Wyoming', incomeTaxRate: 0, hasNoIncomeTax: true, capitalGainsRate: 0, notes: 'No state income tax' },
  { code: 'DC', name: 'Washington D.C.', incomeTaxRate: 0.105, hasNoIncomeTax: false, capitalGainsRate: 0.105 },
];

export function getUSState(code: string): USState | undefined {
  return usStates.find(s => s.code === code);
}

export function searchUSStates(query: string): USState[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  return usStates.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.code.toLowerCase().includes(q)
  ).slice(0, 8); // Limit to 8 results
}

// States with no income tax - useful for highlighting
export const noIncomeTaxStates = usStates.filter(s => s.hasNoIncomeTax);

// Get effective combined federal + state rate estimate
export function getEffectiveStateTaxRate(stateCode: string, incomeType: 'income' | 'capitalGains' = 'income'): number {
  const state = getUSState(stateCode);
  if (!state) return 0;
  return incomeType === 'capitalGains' ? state.capitalGainsRate : state.incomeTaxRate;
}
