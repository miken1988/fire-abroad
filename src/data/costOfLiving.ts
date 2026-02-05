// Cost of Living Index relative to US = 100
// Sources: Numbeo, OECD PPP data, 2024-2025 estimates
// Higher = more expensive, Lower = cheaper

export interface CostOfLivingData {
  index: number;  // US = 100
  rent: number;   // Rent index relative to US
  groceries: number;
  restaurants: number;
  transportation: number;
  healthcare: number;
}

export const costOfLiving: Record<string, CostOfLivingData> = {
  US: {
    index: 100,
    rent: 100,
    groceries: 100,
    restaurants: 100,
    transportation: 100,
    healthcare: 100,
  },
  UK: {
    index: 90,
    rent: 75,
    groceries: 85,
    restaurants: 95,
    transportation: 110,
    healthcare: 0, // NHS
  },
  DE: {
    index: 85,
    rent: 55,
    groceries: 80,
    restaurants: 80,
    transportation: 95,
    healthcare: 10, // Public system with small copays
  },
  FR: {
    index: 88,
    rent: 60,
    groceries: 90,
    restaurants: 85,
    transportation: 90,
    healthcare: 15,
  },
  ES: {
    index: 65,
    rent: 45,
    groceries: 70,
    restaurants: 60,
    transportation: 75,
    healthcare: 10,
  },
  PT: {
    index: 58,
    rent: 40,
    groceries: 65,
    restaurants: 50,
    transportation: 65,
    healthcare: 10,
  },
  IT: {
    index: 78,
    rent: 50,
    groceries: 80,
    restaurants: 75,
    transportation: 85,
    healthcare: 10,
  },
  GR: {
    index: 55,
    rent: 35,
    groceries: 65,
    restaurants: 50,
    transportation: 60,
    healthcare: 10,
  },
  NL: {
    index: 92,
    rent: 70,
    groceries: 85,
    restaurants: 90,
    transportation: 95,
    healthcare: 20, // Mandatory private insurance
  },
  IE: {
    index: 95,
    rent: 85,
    groceries: 90,
    restaurants: 95,
    transportation: 90,
    healthcare: 30,
  },
  CH: {
    index: 140,
    rent: 120,
    groceries: 130,
    restaurants: 150,
    transportation: 130,
    healthcare: 50, // Mandatory private insurance
  },
  CA: {
    index: 88,
    rent: 75,
    groceries: 90,
    restaurants: 85,
    transportation: 90,
    healthcare: 0, // Public system
  },
  AU: {
    index: 95,
    rent: 80,
    groceries: 95,
    restaurants: 90,
    transportation: 100,
    healthcare: 15,
  },
  JP: {
    index: 82,
    rent: 55,
    groceries: 90,
    restaurants: 70,
    transportation: 85,
    healthcare: 20,
  },
  SG: {
    index: 105,
    rent: 110,
    groceries: 85,
    restaurants: 65,
    transportation: 80,
    healthcare: 25,
  },
  MX: {
    index: 42,
    rent: 25,
    groceries: 50,
    restaurants: 35,
    transportation: 40,
    healthcare: 20,
  },
  TH: {
    index: 38,
    rent: 20,
    groceries: 45,
    restaurants: 25,
    transportation: 35,
    healthcare: 15,
  },
  CR: {
    index: 55,
    rent: 35,
    groceries: 60,
    restaurants: 45,
    transportation: 50,
    healthcare: 20,
  },
  PA: {
    index: 60,
    rent: 45,
    groceries: 65,
    restaurants: 50,
    transportation: 55,
    healthcare: 25,
  },
  CO: {
    index: 35,
    rent: 20,
    groceries: 40,
    restaurants: 30,
    transportation: 35,
    healthcare: 15,
  },
  VN: {
    index: 32,
    rent: 15,
    groceries: 40,
    restaurants: 20,
    transportation: 30,
    healthcare: 10,
  },
  MY: {
    index: 40,
    rent: 25,
    groceries: 45,
    restaurants: 30,
    transportation: 35,
    healthcare: 15,
  },
  PH: {
    index: 38,
    rent: 20,
    groceries: 50,
    restaurants: 25,
    transportation: 30,
    healthcare: 15,
  },
  BR: {
    index: 45,
    rent: 25,
    groceries: 50,
    restaurants: 35,
    transportation: 45,
    healthcare: 20,
  },
  AR: {
    index: 35,
    rent: 15,
    groceries: 40,
    restaurants: 25,
    transportation: 30,
    healthcare: 15,
  },
  CL: {
    index: 55,
    rent: 35,
    groceries: 60,
    restaurants: 45,
    transportation: 50,
    healthcare: 20,
  },
  NZ: {
    index: 90,
    rent: 70,
    groceries: 95,
    restaurants: 85,
    transportation: 95,
    healthcare: 10,
  },
};

export function getAdjustedSpending(
  baseSpending: number,
  fromCountry: string,
  toCountry: string
): number {
  const fromCOL = costOfLiving[fromCountry]?.index || 100;
  const toCOL = costOfLiving[toCountry]?.index || 100;
  
  // Adjust spending based on cost of living difference
  return baseSpending * (toCOL / fromCOL);
}

export function getCostOfLivingComparison(
  fromCountry: string,
  toCountry: string
): {
  percentageDiff: number;
  cheaper: boolean;
  fromIndex: number;
  toIndex: number;
} {
  const fromCOL = costOfLiving[fromCountry]?.index || 100;
  const toCOL = costOfLiving[toCountry]?.index || 100;
  
  const percentageDiff = ((toCOL - fromCOL) / fromCOL) * 100;
  
  return {
    percentageDiff,
    cheaper: toCOL < fromCOL,
    fromIndex: fromCOL,
    toIndex: toCOL,
  };
}
