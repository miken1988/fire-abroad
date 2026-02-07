import { UserInputs, FIREResult } from './calculations';

export interface MonteCarloResult {
  successRate: number;              // 0-1, percentage of simulations where money lasts
  medianPath: number[];             // Median portfolio value at each year
  p10Path: number[];                // 10th percentile (bad case)
  p25Path: number[];                // 25th percentile
  p75Path: number[];                // 75th percentile  
  p90Path: number[];                // 90th percentile (good case)
  ages: number[];                   // Age labels for each index
  medianEndingBalance: number;      // Median final portfolio value
  failureYearDistribution: number[];// Count of failures at each year
  averageFailureAge: number | null; // Mean age of portfolio depletion in failed sims
}

// Asset-specific stats (real returns and volatility)
const ASSET_STATS = {
  stocks: { meanReal: 0.07, stdev: 0.175 },    // ~7% real, ~17.5% volatility
  property: { meanReal: 0.02, stdev: 0.08 },   // ~2% real, ~8% volatility
  crypto: { meanReal: 0.10, stdev: 0.60 },     // ~10% real, ~60% volatility (very high!)
  cash: { meanReal: 0.00, stdev: 0.01 },       // ~0% real, minimal volatility
  bonds: { meanReal: 0.02, stdev: 0.06 },      // ~2% real, ~6% volatility
};

const NUM_SIMULATIONS = 1000;

/**
 * Box-Muller transform to generate normally distributed random numbers
 */
function randomNormal(mean: number, stdev: number): number {
  // Ensure u1 is not 0 to avoid Math.log(0) = -Infinity
  let u1 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdev * z;
}

/**
 * Calculate asset weights from inputs
 */
function getAssetWeights(inputs: UserInputs): { stocks: number; property: number; crypto: number; cash: number } {
  const total = inputs.portfolioValue || 1;
  const stocksAmount = (inputs.traditionalRetirementAccounts || 0) + 
                       (inputs.rothAccounts || 0) + 
                       (inputs.taxableAccounts || 0) +
                       (inputs.accounts?.other || 0);
  const cryptoAmount = inputs.accounts?.crypto || 0;
  const cashAmount = inputs.accounts?.cash || 0;
  const propertyAmount = inputs.accounts?.property || 0;
  
  return {
    stocks: stocksAmount / total,
    property: propertyAmount / total,
    crypto: cryptoAmount / total,
    cash: cashAmount / total,
  };
}

/**
 * Generate a random annual return based on asset allocation
 * Each asset class has its own return distribution
 */
function randomReturnByAsset(
  weights: { stocks: number; property: number; crypto: number; cash: number },
  assetReturns?: UserInputs['assetReturns']
): number {
  // Get user-defined mean returns or use defaults
  const stocksMean = assetReturns?.stocks ?? ASSET_STATS.stocks.meanReal;
  const propertyMean = assetReturns?.property ?? ASSET_STATS.property.meanReal;
  const cryptoMean = assetReturns?.crypto ?? ASSET_STATS.crypto.meanReal;
  const cashMean = assetReturns?.cash ?? ASSET_STATS.cash.meanReal;
  
  // Generate random returns for each asset class
  const stocksReturn = randomNormal(stocksMean, ASSET_STATS.stocks.stdev);
  const propertyReturn = randomNormal(propertyMean, ASSET_STATS.property.stdev);
  const cryptoReturn = randomNormal(cryptoMean, ASSET_STATS.crypto.stdev);
  const cashReturn = randomNormal(cashMean, ASSET_STATS.cash.stdev);
  
  // Weighted portfolio return
  const totalWeight = weights.stocks + weights.property + weights.crypto + weights.cash;
  
  if (totalWeight === 0) {
    // Fallback to stocks if no allocation specified
    return stocksReturn;
  }
  
  return (
    weights.stocks * stocksReturn +
    weights.property * propertyReturn +
    weights.crypto * cryptoReturn +
    weights.cash * cashReturn
  );
}

/**
 * Run a single Monte Carlo simulation
 * Returns array of portfolio values at each year, or null values after depletion
 */
function runSingleSimulation(
  startingPortfolio: number,
  annualWithdrawal: number,
  annualSavings: number,
  pensionIncome: number,
  pensionStartAge: number,
  hasPension: boolean,
  currentAge: number,
  retirementAge: number,
  assetWeights: { stocks: number; property: number; crypto: number; cash: number },
  assetReturns: UserInputs['assetReturns'],
  years: number
): { path: number[]; depletedYear: number | null } {
  const path: number[] = [];
  let portfolio = startingPortfolio;
  let depletedYear: number | null = null;

  for (let year = 0; year <= years; year++) {
    path.push(Math.max(0, portfolio));
    
    if (portfolio <= 0 && depletedYear === null) {
      depletedYear = year;
    }
    
    if (portfolio <= 0) {
      continue;
    }

    const age = currentAge + year;
    const isRetired = age >= retirementAge;
    const realReturn = randomReturnByAsset(assetWeights, assetReturns);
    
    const growth = portfolio * realReturn;
    const savings = isRetired ? 0 : annualSavings;
    
    let withdrawal = 0;
    if (isRetired) {
      const pension = (hasPension && age >= pensionStartAge) ? pensionIncome : 0;
      withdrawal = Math.max(0, annualWithdrawal - pension);
    }
    
    portfolio = portfolio + growth + savings - withdrawal;
  }

  return { path, depletedYear };
}

/**
 * Get percentile value from sorted array
 */
function percentile(sorted: number[], p: number): number {
  const index = Math.floor(p * (sorted.length - 1));
  return sorted[index];
}

/**
 * Run full Monte Carlo simulation
 */
export function runMonteCarloSimulation(
  inputs: UserInputs,
  fireResult: FIREResult
): MonteCarloResult {
  const years = 50; // Simulate 50 years from current age
  const assetWeights = getAssetWeights(inputs);
  
  // Collect all simulation paths
  const allPaths: number[][] = [];
  const depletedYears: number[] = [];
  let successCount = 0;

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    const { path, depletedYear } = runSingleSimulation(
      fireResult.projections[0]?.portfolioStart || inputs.portfolioValue,
      fireResult.annualWithdrawalGross,
      inputs.annualSavings || 0,
      fireResult.pensionInfo?.annualAmount || 0,
      fireResult.pensionInfo?.startAge || 67,
      inputs.expectStatePension,
      inputs.currentAge,
      inputs.targetRetirementAge,
      assetWeights,
      inputs.assetReturns,
      years
    );
    
    allPaths.push(path);
    
    if (depletedYear !== null) {
      depletedYears.push(depletedYear);
    } else {
      successCount++;
    }
  }

  // Calculate percentile paths
  const ages: number[] = [];
  const medianPath: number[] = [];
  const p10Path: number[] = [];
  const p25Path: number[] = [];
  const p75Path: number[] = [];
  const p90Path: number[] = [];
  const failureYearDistribution: number[] = new Array(years + 1).fill(0);

  for (let year = 0; year <= years; year++) {
    ages.push(inputs.currentAge + year);
    
    const valuesAtYear = allPaths
      .map(path => path[year] || 0)
      .sort((a, b) => a - b);
    
    medianPath.push(percentile(valuesAtYear, 0.5));
    p10Path.push(percentile(valuesAtYear, 0.1));
    p25Path.push(percentile(valuesAtYear, 0.25));
    p75Path.push(percentile(valuesAtYear, 0.75));
    p90Path.push(percentile(valuesAtYear, 0.9));
  }

  // Build failure distribution
  depletedYears.forEach(year => {
    if (year >= 0 && year <= years) {
      failureYearDistribution[year]++;
    }
  });

  const averageFailureAge = depletedYears.length > 0
    ? inputs.currentAge + depletedYears.reduce((a, b) => a + b, 0) / depletedYears.length
    : null;

  return {
    successRate: successCount / NUM_SIMULATIONS,
    medianPath,
    p10Path,
    p25Path,
    p75Path,
    p90Path,
    ages,
    medianEndingBalance: medianPath[medianPath.length - 1],
    failureYearDistribution,
    averageFailureAge,
  };
}
