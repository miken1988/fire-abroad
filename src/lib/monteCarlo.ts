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

// Historical US stock market stats (real returns)
const STOCK_MEAN_REAL = 0.07;    // ~7% real return
const STOCK_STDEV = 0.175;       // ~17.5% standard deviation
const BOND_MEAN_REAL = 0.02;     // ~2% real return  
const BOND_STDEV = 0.06;         // ~6% standard deviation

const NUM_SIMULATIONS = 1000;

/**
 * Box-Muller transform to generate normally distributed random numbers
 */
function randomNormal(mean: number, stdev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdev * z;
}

/**
 * Generate a random annual return based on portfolio allocation
 * Uses correlated stock/bond returns
 */
function randomReturn(stockWeight: number, expectedReturn: number, inflationRate: number): number {
  const bondWeight = 1 - stockWeight;
  
  // Generate correlated returns (stocks and bonds have ~0 correlation historically)
  const stockReturn = randomNormal(STOCK_MEAN_REAL, STOCK_STDEV);
  const bondReturn = randomNormal(BOND_MEAN_REAL, BOND_STDEV);
  
  // Weighted portfolio return (already real returns, no need to subtract inflation)
  return stockWeight * stockReturn + bondWeight * bondReturn;
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
  stockWeight: number,
  expectedReturn: number,
  inflationRate: number,
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
    const realReturn = randomReturn(stockWeight, expectedReturn, inflationRate);
    
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
  const stockWeight = (inputs.portfolioAllocation?.stocks || 80) / 100;
  
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
      stockWeight,
      inputs.expectedReturn,
      inputs.inflationRate,
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
