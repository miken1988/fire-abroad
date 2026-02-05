// Visa and residency requirements for retirement/long-term stay
// Focus on options most relevant to FIRE/retirees

export interface VisaOption {
  name: string;
  type: 'retirement' | 'investor' | 'passive_income' | 'digital_nomad' | 'golden' | 'standard';
  minAge?: number;
  minIncome?: number;  // Annual passive income in local currency
  minWealth?: number;  // Minimum assets/investment required
  currency: string;
  duration: string;  // e.g., "1 year", "5 years", "permanent"
  renewable: boolean;
  pathToCitizenship?: string;  // e.g., "5 years" or null
  healthInsuranceRequired: boolean;
  notes: string;
  pros: string[];
  cons: string[];
  link?: string;
}

export interface CountryVisaInfo {
  overview: string;
  taxNotes?: string;
  options: VisaOption[];
}

export const visaRequirements: Record<string, CountryVisaInfo> = {
  PT: {
    overview: 'Portugal is one of the most popular destinations for American and European retirees, offering multiple visa pathways.',
    taxNotes: 'NHR 2.0 offers 20% flat tax on foreign income for 10 years. Standard tax rates apply after.',
    options: [
      {
        name: 'D7 Passive Income Visa',
        type: 'passive_income',
        minIncome: 9120,  // ~€760/month (Portuguese minimum wage)
        currency: 'EUR',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: true,
        notes: 'Most popular option for retirees. Requires proof of stable passive income (pensions, investments, rental income).',
        pros: ['Low income requirement', 'Path to EU citizenship', 'Can work remotely', 'Family can join'],
        cons: ['Must spend 183+ days/year in Portugal', 'Requires Portuguese bank account', '~3-6 month processing'],
        link: 'https://www.sef.pt/en/pages/conteudo-detalhe.aspx?nID=62',
      },
      {
        name: 'Golden Visa',
        type: 'golden',
        minWealth: 500000,  // Fund investment option
        currency: 'EUR',
        duration: '5 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: true,
        notes: 'Investment-based residency. Real estate option removed in 2023. Now requires fund investments or job creation.',
        pros: ['Minimal stay required (7 days/year)', 'Path to EU citizenship', 'Family included'],
        cons: ['High investment required', 'Program may change', 'Complex application'],
        link: 'https://www.sef.pt/en/pages/conteudo-detalhe.aspx?nID=88',
      },
    ],
  },
  ES: {
    overview: 'Spain offers several residency options but has become stricter. Popular with European retirees.',
    taxNotes: 'Beckham Law allows 24% flat tax for 6 years for new residents (limited eligibility).',
    options: [
      {
        name: 'Non-Lucrative Visa',
        type: 'passive_income',
        minIncome: 28800,  // ~€2,400/month (400% of IPREM)
        currency: 'EUR',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '10 years',
        healthInsuranceRequired: true,
        notes: 'Cannot work in Spain. Must prove sufficient passive income to support yourself.',
        pros: ['No investment required', 'Access to Schengen', 'Good healthcare'],
        cons: ['Cannot work at all', 'High income requirement', '10 years to citizenship', '183+ days residency'],
        link: 'https://www.exteriores.gob.es/',
      },
      {
        name: 'Golden Visa',
        type: 'golden',
        minWealth: 500000,
        currency: 'EUR',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '10 years',
        healthInsuranceRequired: true,
        notes: 'Real estate investment of €500K+. Program under review and may be modified.',
        pros: ['Can work', 'Minimal stay required', 'Family included'],
        cons: ['High investment', 'Program uncertain', '10 years to citizenship'],
      },
    ],
  },
  IT: {
    overview: 'Italy has an attractive flat tax regime for new residents and rich cultural offerings.',
    taxNotes: '7% flat tax on foreign pension income for 10 years if moving to Southern Italy (under 20K population).',
    options: [
      {
        name: 'Elective Residence Visa',
        type: 'passive_income',
        minIncome: 31000,
        currency: 'EUR',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '10 years',
        healthInsuranceRequired: true,
        notes: 'For retirees with stable passive income. Cannot work.',
        pros: ['7% tax on foreign pensions (South)', 'Rich culture', 'Lower cost in south'],
        cons: ['Cannot work', 'Bureaucracy', '10 years to citizenship'],
      },
    ],
  },
  FR: {
    overview: 'France offers long-stay visas but has high taxes. Popular for lifestyle and healthcare.',
    options: [
      {
        name: 'Long-Stay Visitor Visa',
        type: 'passive_income',
        minIncome: 18500,  // ~SMIC annual
        currency: 'EUR',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: true,
        notes: 'Must prove sufficient resources. Cannot work.',
        pros: ['Excellent healthcare', 'Path to EU citizenship', 'Central Europe location'],
        cons: ['High taxes', 'Cannot work', 'French bureaucracy', 'Language barrier'],
      },
    ],
  },
  MX: {
    overview: 'Mexico is extremely accessible for Americans with low cost of living and easy residency.',
    options: [
      {
        name: 'Temporary Resident Visa',
        type: 'passive_income',
        minIncome: 2700,  // ~$225/month or $43K savings shown
        currency: 'USD',
        duration: '1-4 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Very accessible. Can show either monthly income or savings in bank account.',
        pros: ['Low requirements', 'No health insurance required', 'Close to US', 'Low cost of living'],
        cons: ['Safety concerns in some areas', 'Healthcare varies', 'Limited banking'],
      },
      {
        name: 'Permanent Resident Visa',
        type: 'passive_income',
        minIncome: 4050,  // ~$337/month or higher savings
        currency: 'USD',
        duration: 'Permanent',
        renewable: false,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Higher income requirement but permanent from start.',
        pros: ['Permanent from start', 'No renewals needed', 'Can work'],
        cons: ['Higher income threshold', 'Must maintain ties to Mexico'],
      },
    ],
  },
  CR: {
    overview: 'Costa Rica has a well-established retiree program (Pensionado) and stable democracy.',
    options: [
      {
        name: 'Pensionado (Retiree) Visa',
        type: 'retirement',
        minIncome: 1000,
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'Must have $1,000/month guaranteed pension income.',
        pros: ['Low pension requirement', 'Stable country', 'Good healthcare', 'No minimum age'],
        cons: ['Cannot work', 'Must join CAJA (health system)', '7 years to citizenship'],
      },
      {
        name: 'Rentista Visa',
        type: 'passive_income',
        minIncome: 2500,
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'For those with investment income (not pension). Must deposit $60K for 2 years or show $2.5K/month.',
        pros: ['Investment income qualifies', 'No pension needed', 'Stable country'],
        cons: ['Higher than Pensionado', 'Cannot work', 'Deposit requirement option'],
      },
    ],
  },
  PA: {
    overview: 'Panama has one of the best retiree visa programs in the world with significant discounts.',
    options: [
      {
        name: 'Pensionado Visa',
        type: 'retirement',
        minIncome: 1000,
        currency: 'USD',
        duration: 'Permanent',
        renewable: false,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Best retiree visa in the Americas. Includes massive discounts (50% off entertainment, 25% off restaurants, etc.).',
        pros: ['Permanent from start', 'Amazing discounts', 'US dollar economy', 'No minimum age', 'Fast processing'],
        cons: ['Must have lifetime pension', 'Discounts require asking', 'Panama City expensive'],
      },
      {
        name: 'Friendly Nations Visa',
        type: 'standard',
        minWealth: 5000,  // Bank deposit
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Available to citizens of 50 friendly nations including US, UK, EU. Need economic/professional tie to Panama.',
        pros: ['Low barrier', 'Can work', 'Quick processing'],
        cons: ['Need professional or economic tie', 'Not automatic', '2 year initial'],
      },
    ],
  },
  TH: {
    overview: 'Thailand offers affordable living and specific retirement visas for those 50+.',
    options: [
      {
        name: 'Non-Immigrant O-A (Retirement)',
        type: 'retirement',
        minAge: 50,
        minWealth: 800000,  // THB in Thai bank or 65K/month income
        currency: 'THB',
        duration: '1 year',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'Must be 50+. Need 800K THB (~$22K) in Thai bank OR 65K THB/month income (~$1,800).',
        pros: ['Low cost of living', 'Great weather', 'Good healthcare', 'Large expat community'],
        cons: ['Age 50 minimum', 'Cannot work', 'Annual renewals', '90-day reporting', 'No path to citizenship'],
      },
      {
        name: 'Thailand Elite Visa',
        type: 'investor',
        minWealth: 600000,  // THB (~$17K for 5 years)
        currency: 'THB',
        duration: '5-20 years',
        renewable: true,
        healthInsuranceRequired: false,
        notes: 'Pay-to-stay program. Various tiers from 5 to 20 years.',
        pros: ['No age requirement', 'Long validity', 'VIP services', 'No income proof'],
        cons: ['Expensive upfront', 'Cannot work', 'No citizenship path', 'Program could change'],
      },
    ],
  },
  MY: {
    overview: 'Malaysia\'s MM2H program was popular but requirements increased significantly in 2021.',
    options: [
      {
        name: 'MM2H (Malaysia My Second Home)',
        type: 'passive_income',
        minAge: 35,
        minIncome: 40000,  // MYR/month offshore income
        minWealth: 1500000,  // MYR liquid assets
        currency: 'MYR',
        duration: '5 years',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'Requirements increased significantly in 2021. Now requires high income and fixed deposit.',
        pros: ['Can own property', '10 year option', 'Good infrastructure', 'English widely spoken'],
        cons: ['High requirements now', 'Fixed deposit locked', '90 days/year minimum stay', 'No citizenship path'],
      },
    ],
  },
  SG: {
    overview: 'Singapore is expensive and has no retirement visa, but offers investor options.',
    options: [
      {
        name: 'Global Investor Programme',
        type: 'investor',
        minWealth: 10000000,  // SGD
        currency: 'SGD',
        duration: 'Permanent',
        renewable: false,
        pathToCitizenship: '2 years',
        healthInsuranceRequired: false,
        notes: 'For high net worth individuals. Requires significant business investment.',
        pros: ['Permanent residency', 'Fast citizenship path', 'Low taxes', 'World-class infrastructure'],
        cons: ['Very high barrier', 'Business investment required', 'High cost of living'],
      },
    ],
  },
  AE: {
    overview: 'UAE/Dubai has no retirement visa but offers investor and remote work options. No income tax.',
    taxNotes: 'No personal income tax. 9% corporate tax introduced 2023.',
    options: [
      {
        name: 'Golden Visa',
        type: 'golden',
        minWealth: 2000000,  // AED (~$545K)
        currency: 'AED',
        duration: '10 years',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'Property investment of AED 2M+ or other qualifying investments.',
        pros: ['10 year validity', 'No income tax', 'Modern infrastructure', 'Can sponsor family'],
        cons: ['High investment', 'Expensive living', 'Hot climate', 'No citizenship path'],
      },
      {
        name: 'Remote Work Visa',
        type: 'digital_nomad',
        minIncome: 3500,  // USD/month
        currency: 'USD',
        duration: '1 year',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'For remote workers employed outside UAE.',
        pros: ['No income tax', 'Modern amenities', 'Easy entry'],
        cons: ['Must have employment', 'High cost of living', '1 year only', 'Health insurance required'],
      },
    ],
  },
  UK: {
    overview: 'UK has no retirement visa. Options limited to ancestry, investment, or standard work visas.',
    options: [
      {
        name: 'Innovator Founder Visa',
        type: 'investor',
        minWealth: 50000,  // GBP investment funds
        currency: 'GBP',
        duration: '3 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Must have innovative, viable, scalable business idea endorsed by approved body.',
        pros: ['Path to settlement', 'NHS access', 'Can work'],
        cons: ['Business plan required', 'Endorsement needed', 'Complex process'],
      },
    ],
  },
  IE: {
    overview: 'Ireland has a retiree option but with high financial requirements.',
    options: [
      {
        name: 'Stamp 0 (Retiree)',
        type: 'retirement',
        minIncome: 50000,  // EUR/year
        minWealth: 100000,  // EUR lump sum
        currency: 'EUR',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: true,
        notes: 'For financially independent retirees. Cannot work or access public funds.',
        pros: ['English speaking', 'EU access', 'Path to citizenship'],
        cons: ['High income requirement', 'Cannot work', 'Cannot access public benefits'],
      },
    ],
  },
  DE: {
    overview: 'Germany has no specific retirement visa but allows freelance/self-employment visas.',
    options: [
      {
        name: 'Freiberufler (Freelance) Visa',
        type: 'standard',
        currency: 'EUR',
        duration: '1-3 years',
        renewable: true,
        pathToCitizenship: '8 years',
        healthInsuranceRequired: true,
        notes: 'For self-employed professionals. Need proof of clients/income and health insurance.',
        pros: ['Can work', 'Strong economy', 'EU access', 'Good healthcare'],
        cons: ['Must show business need', 'High taxes', 'Language helpful', 'Long path to citizenship'],
      },
    ],
  },
  NL: {
    overview: 'Netherlands offers DAFT for US citizens and has a high quality of life.',
    options: [
      {
        name: 'DAFT (Dutch American Friendship Treaty)',
        type: 'standard',
        minWealth: 4500,  // EUR minimum investment
        currency: 'EUR',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: true,
        notes: 'US citizens only. Must run a business that benefits Dutch economy.',
        pros: ['Low investment', 'US citizens only advantage', 'English widely spoken', 'EU access'],
        cons: ['Business required', 'High cost of living', 'High taxes', 'US citizens only'],
      },
    ],
  },
  CA: {
    overview: 'Canada has no retirement visa. Immigration is primarily points-based or family-sponsored.',
    options: [
      {
        name: 'Start-up Visa',
        type: 'investor',
        currency: 'CAD',
        duration: 'Permanent',
        renewable: false,
        pathToCitizenship: '3 years',
        healthInsuranceRequired: false,
        notes: 'Need commitment from designated Canadian investor/accelerator for innovative business.',
        pros: ['Immediate PR', 'Fast citizenship', 'High quality of life'],
        cons: ['Business required', 'Investor commitment needed', 'Cold climate', 'High taxes'],
      },
    ],
  },
  AU: {
    overview: 'Australia has investor retirement visas but they are expensive and limited.',
    options: [
      {
        name: 'Investor Retirement Visa (405)',
        type: 'retirement',
        minAge: 55,
        minWealth: 750000,  // AUD designated investment
        currency: 'AUD',
        duration: '4 years',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'Closed to new applications. Only renewals for existing holders.',
        pros: ['High quality of life', 'Good healthcare'],
        cons: ['Closed to new applicants', 'No path to PR', 'Expensive'],
      },
    ],
  },
  NZ: {
    overview: 'New Zealand closed investor retirement category. Limited options available.',
    options: [
      {
        name: 'Investor 2 Visa',
        type: 'investor',
        minWealth: 3000000,  // NZD
        currency: 'NZD',
        duration: '4 years',
        renewable: true,
        pathToCitizenship: '5 years',
        healthInsuranceRequired: false,
        notes: 'Requires NZ$3M investment for 4 years and business experience.',
        pros: ['Beautiful country', 'Path to citizenship', 'English speaking'],
        cons: ['Very high investment', 'Business experience required', 'Remote location'],
      },
    ],
  },
  CH: {
    overview: 'Switzerland offers lump-sum taxation for wealthy retirees in some cantons.',
    options: [
      {
        name: 'Lump Sum Taxation Permit',
        type: 'passive_income',
        minWealth: 1000000,  // CHF approximate minimum
        currency: 'CHF',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '10-12 years',
        healthInsuranceRequired: true,
        notes: 'Tax based on living expenses, not income. Minimum varies by canton. Cannot work in Switzerland.',
        pros: ['Favorable tax treatment', 'High quality of life', 'Political stability'],
        cons: ['Very expensive', 'Complex application', 'Long path to citizenship', 'Cannot work'],
      },
    ],
  },
  TH: {
    overview: 'Thailand is one of the most popular retirement destinations in Southeast Asia, known for low costs and high quality of life.',
    taxNotes: 'Territorial taxation - only income remitted to Thailand in the same year it\'s earned is taxed. Foreign income kept offshore = tax-free.',
    options: [
      {
        name: 'Retirement Visa (Non-O-A)',
        type: 'retirement',
        minAge: 50,
        minWealth: 800000,  // THB in Thai bank OR
        minIncome: 65000,   // THB/month pension
        currency: 'THB',
        duration: '1 year',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'Must be 50+ with either 800,000 THB (~$22,500) in Thai bank OR 65,000 THB/month income (~$1,800). Health insurance required.',
        pros: ['Low cost of living', 'Great weather', 'Excellent healthcare', 'Large expat community'],
        cons: ['No path to citizenship', 'Must exit/re-enter or extend annually', '90-day reporting', 'Cannot work'],
      },
      {
        name: 'Thailand Elite Visa',
        type: 'investor',
        minWealth: 600000,  // THB for 5-year membership
        currency: 'THB',
        duration: '5-20 years',
        renewable: true,
        healthInsuranceRequired: false,
        notes: 'Premium long-stay visa. 5-year (~$17K), 10-year (~$28K), or 20-year (~$57K) options. VIP services included.',
        pros: ['Long duration', 'No age requirement', 'Multiple entry', 'VIP airport services', 'No 90-day reporting'],
        cons: ['Expensive upfront cost', 'No path to citizenship', 'Cannot work'],
      },
      {
        name: 'LTR (Long-Term Resident) Visa',
        type: 'passive_income',
        minIncome: 80000,  // USD annual income
        minWealth: 250000,  // USD in assets
        currency: 'USD',
        duration: '10 years',
        renewable: true,
        healthInsuranceRequired: true,
        notes: 'New visa for wealthy foreigners. $80K/year income OR $250K invested in Thailand. 17% flat tax rate on Thai income.',
        pros: ['10-year visa', 'Work permit included', 'Digital work allowed', 'Tax benefits'],
        cons: ['High income/wealth requirement', 'Complex application'],
      },
    ],
  },
  CR: {
    overview: 'Costa Rica offers excellent retirement visas and territorial taxation, making it attractive for FIRE retirees.',
    taxNotes: 'TERRITORIAL taxation - foreign-sourced income is NOT taxed in Costa Rica! Only Costa Rica-sourced income is taxed.',
    options: [
      {
        name: 'Pensionado (Retiree) Visa',
        type: 'retirement',
        minIncome: 1000,  // USD/month pension income
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'Requires $1,000/month guaranteed pension income. Must join CCSS healthcare (~$100/month).',
        pros: ['Territorial taxation', 'Low cost requirement', 'Path to citizenship', 'Stable democracy', 'No military'],
        cons: ['Must convert $1,000/month to colones', 'Healthcare quality varies', 'Must spend majority of year in CR'],
      },
      {
        name: 'Rentista (Income) Visa',
        type: 'passive_income',
        minIncome: 2500,  // USD/month passive income
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'Requires $2,500/month passive income (investments, rental, etc.) OR $60,000 deposit in Costa Rican bank.',
        pros: ['Territorial taxation', 'For non-pension passive income', 'Path to citizenship'],
        cons: ['Higher requirement than Pensionado', 'Must prove income stability'],
      },
      {
        name: 'Inversionista (Investor) Visa',
        type: 'investor',
        minWealth: 150000,  // USD investment
        currency: 'USD',
        duration: '2 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'Requires $150,000+ investment in Costa Rican business or real estate.',
        pros: ['Can actively work/manage investment', 'Path to citizenship', 'Territorial taxation'],
        cons: ['Tied to specific investment', 'Higher capital requirement'],
      },
    ],
  },
  GR: {
    overview: 'Greece offers attractive visa options and a special tax regime for foreign retirees, plus EU membership.',
    taxNotes: 'Non-Dom Regime: 7% flat tax on all foreign income for 15 years (€100K minimum foreign income required).',
    options: [
      {
        name: 'Financially Independent Person Visa',
        type: 'passive_income',
        minIncome: 24000,  // EUR/year approximately
        currency: 'EUR',
        duration: '1 year',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: 'Requires proof of sufficient passive income to support yourself. No minimum investment required.',
        pros: ['EU residency', 'Path to EU citizenship', 'Non-Dom 7% flat tax available', 'Mediterranean lifestyle'],
        cons: ['Standard income tax if not Non-Dom', 'Bureaucracy', 'Healthcare quality varies by region'],
      },
      {
        name: 'Golden Visa',
        type: 'golden',
        minWealth: 250000,  // EUR real estate (500K in Athens/islands)
        currency: 'EUR',
        duration: '5 years',
        renewable: true,
        pathToCitizenship: '7 years',
        healthInsuranceRequired: true,
        notes: '€250K real estate outside Athens/islands, or €500K in Athens/islands. Family included.',
        pros: ['EU residency', 'No minimum stay requirement', 'Family included', 'Real estate investment'],
        cons: ['Higher thresholds in prime areas', 'Tied to real estate', 'Market risk'],
      },
      {
        name: 'Non-Dom Tax Regime',
        type: 'passive_income',
        minIncome: 100000,  // EUR/year foreign income
        currency: 'EUR',
        duration: '15 years',
        renewable: false,
        healthInsuranceRequired: true,
        notes: 'Not a visa, but a tax regime. 7% flat tax on ALL foreign income. Must not have been Greek tax resident for 5 of 6 prior years.',
        pros: ['7% flat tax on foreign income', 'No reporting of foreign assets', '15-year duration'],
        cons: ['€100K minimum foreign income', 'Must qualify for another visa/residency'],
      },
    ],
  },
};

export function getVisaInfo(countryCode: string): CountryVisaInfo | null {
  return visaRequirements[countryCode] || null;
}

export function formatVisaAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
