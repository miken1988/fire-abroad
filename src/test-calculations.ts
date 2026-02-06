// Test script for FIRE calculations across country combinations
// Run with: npx ts-node --esm src/test-calculations.ts

import { calculateFIRE, compareFIRE, UserInputs } from './lib/calculations';
import { countries } from './data/countries';
import { costOfLiving } from './data/costOfLiving';

const baseInputs: UserInputs = {
  currentAge: 37,
  targetRetirementAge: 50,
  currentCountry: 'US',
  targetCountry: 'US',
  portfolioValue: 1500000,
  portfolioCurrency: 'USD',
  portfolioAllocation: { stocks: 80, bonds: 10, cash: 5, crypto: 5, property: 0 },
  accounts: { taxDeferred: 0, taxFree: 0, taxable: 0, crypto: 0, cash: 0, property: 0, other: 0, otherLabel: '' },
  traditionalRetirementAccounts: 500000,
  rothAccounts: 300000,
  taxableAccounts: 700000,
  propertyEquity: 0,
  annualSpending: 120000,
  spendingCurrency: 'USD',
  annualSavings: 50000,
  expectStatePension: false,
  statePensionAmount: 0,
  statePensionAge: 67,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  safeWithdrawalRate: 0.04,
};

// Countries to test
const testCountries = ['US', 'UK', 'MX', 'PT', 'ES', 'TH', 'DE', 'FR', 'IE', 'CA', 'AU'];

console.log('='.repeat(80));
console.log('FIRE CALCULATION TESTS');
console.log('='.repeat(80));
console.log(`\nBase scenario: $${baseInputs.portfolioValue.toLocaleString()} portfolio, $${baseInputs.annualSpending.toLocaleString()}/yr spending\n`);

// Test 1: Verify COL adjustment is being applied
console.log('\n--- TEST 1: Cost of Living Adjustment ---\n');
console.log('Country | COL Index | Expected Spending Multiplier | Actual Spending Adj');
console.log('-'.repeat(75));

for (const countryCode of testCountries) {
  const col = costOfLiving[countryCode]?.index || 100;
  const usCOL = costOfLiving['US']?.index || 100;
  const expectedMultiplier = col / usCOL;
  
  const inputs = { ...baseInputs, currentCountry: 'US', targetCountry: countryCode };
  const result = calculateFIRE(inputs, countryCode);
  
  // The FIRE number should be roughly proportional to COL adjustment
  // Base US FIRE number at 4% SWR for $120K spending ≈ $3M
  // Adjusted should be $3M * COL ratio
  const baseFIREUSD = 120000 / 0.04; // ~$3M without taxes
  const expectedFIREUSD = baseFIREUSD * expectedMultiplier;
  
  const actualRatio = result.fireNumberUSD / baseFIREUSD;
  const status = Math.abs(actualRatio - expectedMultiplier) < 0.3 ? '✓' : '✗ MISMATCH';
  
  console.log(`${countryCode.padEnd(7)} | ${col.toString().padEnd(9)} | ${expectedMultiplier.toFixed(2).padEnd(28)} | ${actualRatio.toFixed(2)} ${status}`);
}

// Test 2: Cheaper countries should have lower FIRE numbers (in USD)
console.log('\n\n--- TEST 2: FIRE Numbers by Country (from US perspective) ---\n');
console.log('Country | COL | FIRE Number (local) | FIRE Number (USD) | Years to FIRE | Status');
console.log('-'.repeat(90));

const results: { country: string; col: number; fireUSD: number; years: number }[] = [];

for (const countryCode of testCountries) {
  const inputs = { ...baseInputs, currentCountry: 'US', targetCountry: countryCode };
  const result = calculateFIRE(inputs, countryCode);
  const col = costOfLiving[countryCode]?.index || 100;
  const country = countries[countryCode];
  
  results.push({ country: countryCode, col, fireUSD: result.fireNumberUSD, years: result.yearsUntilFIRE });
  
  const localFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: country?.currency || 'USD',
    maximumFractionDigits: 0 
  }).format(result.fireNumber);
  
  const usdFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(result.fireNumberUSD);
  
  console.log(`${countryCode.padEnd(7)} | ${col.toString().padEnd(3)} | ${localFormatted.padEnd(19)} | ${usdFormatted.padEnd(17)} | ${result.yearsUntilFIRE.toString().padEnd(13)} |`);
}

// Test 3: Verify ordering - cheaper COL should mean lower FIRE number
console.log('\n\n--- TEST 3: Ordering Validation ---\n');
const sortedByCOL = [...results].sort((a, b) => a.col - b.col);
const sortedByFIRE = [...results].sort((a, b) => a.fireUSD - b.fireUSD);

console.log('Sorted by COL (cheapest first):');
sortedByCOL.forEach((r, i) => console.log(`  ${i + 1}. ${r.country} (COL: ${r.col}, FIRE: $${Math.round(r.fireUSD).toLocaleString()})`));

console.log('\nSorted by FIRE number (lowest first):');
sortedByFIRE.forEach((r, i) => console.log(`  ${i + 1}. ${r.country} (COL: ${r.col}, FIRE: $${Math.round(r.fireUSD).toLocaleString()})`));

// Check if order matches
let orderMatches = true;
for (let i = 0; i < sortedByCOL.length; i++) {
  if (sortedByCOL[i].country !== sortedByFIRE[i].country) {
    // Allow some tolerance due to tax differences
    const colRank = sortedByCOL.findIndex(r => r.country === sortedByFIRE[i].country);
    if (Math.abs(colRank - i) > 2) {
      orderMatches = false;
      console.log(`\n⚠️  Potential issue: ${sortedByFIRE[i].country} has FIRE rank ${i + 1} but COL rank ${colRank + 1}`);
    }
  }
}

if (orderMatches) {
  console.log('\n✓ Ordering roughly matches (cheaper COL → lower FIRE number)');
}

// Test 4: Specific sanity checks
console.log('\n\n--- TEST 4: Sanity Checks ---\n');

// Mexico should be much cheaper than US
const usResult = calculateFIRE({ ...baseInputs, targetCountry: 'US' }, 'US');
const mxResult = calculateFIRE({ ...baseInputs, targetCountry: 'MX' }, 'MX');

const mxVsUsRatio = mxResult.fireNumberUSD / usResult.fireNumberUSD;
const mxColRatio = (costOfLiving['MX']?.index || 42) / 100;

console.log(`US FIRE number: $${Math.round(usResult.fireNumberUSD).toLocaleString()}`);
console.log(`Mexico FIRE number: $${Math.round(mxResult.fireNumberUSD).toLocaleString()}`);
console.log(`Ratio (MX/US): ${mxVsUsRatio.toFixed(2)}`);
console.log(`Expected ratio (based on COL): ${mxColRatio.toFixed(2)}`);

if (mxResult.fireNumberUSD < usResult.fireNumberUSD) {
  console.log('✓ Mexico FIRE number is lower than US (correct!)');
} else {
  console.log('✗ ERROR: Mexico FIRE number should be LOWER than US!');
}

if (mxResult.yearsUntilFIRE <= usResult.yearsUntilFIRE) {
  console.log('✓ Mexico years to FIRE is same or less than US (correct!)');
} else {
  console.log('✗ ERROR: Mexico should allow EARLIER retirement than US!');
}

// Test 5: Same country comparison should show identical results
console.log('\n\n--- TEST 5: Same Country Comparison ---\n');
const comparison = compareFIRE({ ...baseInputs, currentCountry: 'US', targetCountry: 'US' }, 'US', 'US');
if (comparison.country1.fireNumber === comparison.country2.fireNumber) {
  console.log('✓ Same country comparison shows identical FIRE numbers');
} else {
  console.log('✗ ERROR: Same country should have identical results!');
}

console.log('\n' + '='.repeat(80));
console.log('TESTS COMPLETE');
console.log('='.repeat(80));
