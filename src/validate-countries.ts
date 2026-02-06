import { countries } from './data/countries';
import { getStatePension } from './data/statePensions';
import { costOfLivingData } from './data/costOfLiving';

console.log('=== COUNTRY DATA VALIDATION ===\n');

const issues: string[] = [];

for (const [code, country] of Object.entries(countries)) {
  console.log(`\n--- ${country.flag} ${country.name} (${code}) ---`);
  
  // Check required fields
  if (!country.currency) issues.push(`${code}: Missing currency`);
  if (!country.currencySymbol) issues.push(`${code}: Missing currencySymbol`);
  
  // Check tax brackets
  if (!country.incomeTax?.brackets?.length) {
    issues.push(`${code}: Missing income tax brackets`);
  } else {
    const brackets = country.incomeTax.brackets;
    // Check brackets are in order
    for (let i = 1; i < brackets.length; i++) {
      if (brackets[i].min <= brackets[i-1].min) {
        issues.push(`${code}: Income tax brackets not in order`);
      }
    }
    console.log(`  Income tax: ${brackets.length} brackets, top rate ${brackets[brackets.length-1].rate * 100}%`);
  }
  
  if (!country.capitalGains?.brackets?.length) {
    issues.push(`${code}: Missing capital gains brackets`);
  } else {
    const topCG = country.capitalGains.brackets[country.capitalGains.brackets.length - 1];
    console.log(`  Capital gains: top rate ${topCG.rate * 100}%`);
  }
  
  // Check cost of living
  if (!country.costOfLiving?.index) {
    issues.push(`${code}: Missing cost of living index`);
  } else {
    console.log(`  Cost of living index: ${country.costOfLiving.index}`);
  }
  
  // Check healthcare
  if (!country.healthcare) {
    issues.push(`${code}: Missing healthcare info`);
  } else {
    console.log(`  Healthcare: ${country.healthcare.system || 'unknown'}`);
  }
  
  // Check pension data
  const pension = getStatePension(code);
  if (pension) {
    console.log(`  Pension: ${pension.name}, age ${pension.eligibilityAge}, avg ${pension.averageAnnualBenefit} ${pension.currency}`);
  } else {
    console.log(`  Pension: NO DATA`);
  }
  
  // Check exchange rate if not USD/EUR
  if (!['USD', 'EUR', 'GBP'].includes(country.currency)) {
    // Would need to check exchangeRates object
    console.log(`  Currency: ${country.currency} (check exchange rate exists)`);
  }
}

console.log('\n\n=== ISSUES FOUND ===');
if (issues.length === 0) {
  console.log('✅ No issues found!');
} else {
  issues.forEach(i => console.log(`❌ ${i}`));
}
