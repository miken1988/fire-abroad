'use client';

import { useState } from 'react';
import { FIREResult, ComparisonSummary, UserInputs } from '@/lib/calculations';
import { countries } from '@/data/countries';
import { formatCurrency, formatPercent, formatCompact } from '@/lib/formatters';
import { getVisaInfo } from '@/data/visaRequirements';
import { getCostOfLivingComparison } from '@/data/costOfLiving';
import { runMonteCarloSimulation, MonteCarloResult } from '@/lib/monteCarlo';

interface PDFExportProps {
  result1: FIREResult;
  result2: FIREResult;
  comparison: ComparisonSummary;
  country1Code: string;
  country2Code: string;
  inputs: UserInputs;
}

function getSuccessLabel(pct: number): string {
  if (pct >= 95) return 'Excellent';
  if (pct >= 85) return 'Very Good';
  if (pct >= 75) return 'Good';
  if (pct >= 60) return 'Fair';
  if (pct >= 40) return 'Risky';
  return 'High Risk';
}

function getSuccessColor(pct: number): string {
  if (pct >= 90) return '#059669';
  if (pct >= 75) return '#16a34a';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
}

function generatePDFContent(
  result1: FIREResult,
  result2: FIREResult,
  comparison: ComparisonSummary,
  country1Code: string,
  country2Code: string,
  inputs: UserInputs,
  mc1: MonteCarloResult | null,
  mc2: MonteCarloResult | null
): string {
  const country1 = countries[country1Code];
  const country2 = countries[country2Code];
  const visaInfo = getVisaInfo(country2Code);
  const colComparison = getCostOfLivingComparison(country1Code, country2Code);
  
  const mc1Success = mc1 ? Math.round(mc1.successRate * 100) : null;
  const mc2Success = mc2 ? Math.round(mc2.successRate * 100) : null;

  const monteCarloSection = mc1 && mc2 ? `
  <div class="section">
    <div class="monte-carlo-section">
      <h3>🎲 Monte Carlo Analysis (1,000 Simulations)</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
        Tests your plan against randomized market scenarios using historical volatility (~17.5% annual std dev).
      </p>
      <div class="mc-grid">
        <div class="mc-card">
          <h4>${country1?.flag} ${country1?.name}</h4>
          <div class="mc-success" style="color: ${getSuccessColor(mc1Success || 0)}">${mc1Success}%</div>
          <div class="mc-label">${getSuccessLabel(mc1Success || 0)} - Chance money lasts 50 years</div>
          <div class="mc-stats">
            <div class="mc-stat">
              <div class="label">Median at 85</div>
              <div class="value">${formatCompact(mc1.medianPath[Math.min(mc1.ages.indexOf(85), mc1.medianPath.length - 1)] || mc1.medianEndingBalance, country1?.currency || 'USD')}</div>
            </div>
            <div class="mc-stat">
              <div class="label">Worst 10%</div>
              <div class="value">${formatCompact(mc1.p10Path[mc1.p10Path.length - 1], country1?.currency || 'USD')}</div>
            </div>
          </div>
        </div>
        <div class="mc-card">
          <h4>${country2?.flag} ${country2?.name}</h4>
          <div class="mc-success" style="color: ${getSuccessColor(mc2Success || 0)}">${mc2Success}%</div>
          <div class="mc-label">${getSuccessLabel(mc2Success || 0)} - Chance money lasts 50 years</div>
          <div class="mc-stats">
            <div class="mc-stat">
              <div class="label">Median at 85</div>
              <div class="value">${formatCompact(mc2.medianPath[Math.min(mc2.ages.indexOf(85), mc2.medianPath.length - 1)] || mc2.medianEndingBalance, country2?.currency || 'USD')}</div>
            </div>
            <div class="mc-stat">
              <div class="label">Worst 10%</div>
              <div class="value">${formatCompact(mc2.p10Path[mc2.p10Path.length - 1], country2?.currency || 'USD')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  ` : '';

  const colSection = colComparison ? `
  <div class="section">
    <h2>Cost of Living</h2>
    <p style="font-size: 13px; margin-bottom: 12px;">
      Your ${formatCurrency(inputs.annualSpending, country1?.currency || 'USD')}/year in ${country1?.name} ≈ 
      <strong>${formatCurrency(inputs.annualSpending * colComparison.overall, country2?.currency || 'EUR')}/year</strong> in ${country2?.name}.
      ${colComparison.overall < 1 ? `${country2?.name} is ${Math.round((1 - colComparison.overall) * 100)}% cheaper overall.` : `${country2?.name} is ${Math.round((colComparison.overall - 1) * 100)}% more expensive overall.`}
    </p>
    <div class="col-grid">
      <div class="col-item"><div class="category">🏠 Housing</div><div class="diff">${colComparison.housing < 1 ? '-' : '+'}${Math.abs(Math.round((1 - colComparison.housing) * 100))}%</div></div>
      <div class="col-item"><div class="category">🛒 Groceries</div><div class="diff">${colComparison.groceries < 1 ? '-' : '+'}${Math.abs(Math.round((1 - colComparison.groceries) * 100))}%</div></div>
      <div class="col-item"><div class="category">🍽️ Dining</div><div class="diff">${colComparison.restaurants < 1 ? '-' : '+'}${Math.abs(Math.round((1 - colComparison.restaurants) * 100))}%</div></div>
      <div class="col-item"><div class="category">🚗 Transport</div><div class="diff">${colComparison.transportation < 1 ? '-' : '+'}${Math.abs(Math.round((1 - colComparison.transportation) * 100))}%</div></div>
      <div class="col-item"><div class="category">🏥 Healthcare</div><div class="diff">${colComparison.healthcare < 1 ? '-' : '+'}${Math.abs(Math.round((1 - colComparison.healthcare) * 100))}%</div></div>
    </div>
  </div>
  ` : '';

  const visaSection = visaInfo ? `
  <div class="section">
    <h2>Visa & Residency Options</h2>
    <div class="visa-section">
      <h3>🛂 ${country2?.name}</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${visaInfo.overview}</p>
      ${visaInfo.taxNotes ? `<p style="font-size: 11px; color: #166534; background: #dcfce7; padding: 8px; border-radius: 4px; margin-bottom: 10px;">💡 Tax Tip: ${visaInfo.taxNotes}</p>` : ''}
      ${visaInfo.options.slice(0, 2).map(opt => `
        <div class="visa-option">
          <h4>${opt.name}</h4>
          <p>${opt.minIncome ? `Min income: ${formatCurrency(opt.minIncome, opt.currency)}/yr` : ''}${opt.minWealth ? `${opt.minIncome ? ' • ' : ''}Min investment: ${formatCurrency(opt.minWealth, opt.currency)}` : ''}${opt.pathToCitizenship ? ` • Citizenship: ${opt.pathToCitizenship}` : ''}</p>
          <p style="margin-top: 4px;">${opt.notes}</p>
        </div>
      `).join('')}
    </div>
  </div>
  ` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>FIRE Abroad Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;line-height:1.5;padding:40px;max-width:800px;margin:0 auto}
.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #e5e7eb}.header h1{font-size:28px;color:#111;margin-bottom:5px}.header p{color:#666;font-size:14px}
.section{margin-bottom:25px}.section h2{font-size:18px;color:#111;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
.comparison-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.country-card{background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb}.country-card h3{font-size:16px;margin-bottom:12px}
.stat{margin-bottom:10px}.stat-label{font-size:11px;color:#666;text-transform:uppercase}.stat-value{font-size:18px;font-weight:600;color:#111}.stat-value.highlight{color:#059669}
.summary-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px}.summary-box h3{color:#166534;font-size:14px;margin-bottom:8px}.summary-box ul{list-style:none;font-size:13px}.summary-box li{margin-bottom:4px}
.inputs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:#f9fafb;padding:16px;border-radius:8px;font-size:13px}.input-item{text-align:center}.input-item .label{color:#666;font-size:11px}.input-item .value{font-weight:600;color:#111}
.monte-carlo-section{background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:16px}.monte-carlo-section h3{color:#7c3aed;font-size:14px;margin-bottom:12px}
.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mc-card{background:white;border-radius:8px;padding:12px;border:1px solid #e5e7eb}.mc-card h4{font-size:13px;margin-bottom:8px}
.mc-success{font-size:28px;font-weight:700;margin-bottom:4px}.mc-label{font-size:11px;color:#666}
.mc-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb}.mc-stat{text-align:center}.mc-stat .label{font-size:10px;color:#666}.mc-stat .value{font-size:13px;font-weight:600;color:#111}
.col-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.col-item{text-align:center;padding:8px;background:white;border-radius:6px;border:1px solid #e5e7eb}.col-item .category{font-size:10px;color:#666}.col-item .diff{font-size:14px;font-weight:600;color:#059669}
.visa-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px}.visa-section h3{color:#1e40af;font-size:14px;margin-bottom:8px}.visa-option{background:white;border-radius:6px;padding:12px;margin-top:10px;border:1px solid #e5e7eb}.visa-option h4{font-size:13px;margin-bottom:6px}.visa-option p{font-size:11px;color:#666}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#999}
@media print{body{padding:20px}}
</style></head>
<body>
<div class="header"><h1>🔥 FIRE Abroad Report</h1><p>Comparing early retirement in ${country1?.name} vs ${country2?.name}</p><p style="font-size:12px;margin-top:5px">Generated ${new Date().toLocaleDateString()}</p></div>
<div class="section"><h2>Your Inputs</h2><div class="inputs-grid">
<div class="input-item"><div class="label">Current Age</div><div class="value">${inputs.currentAge}</div></div>
<div class="input-item"><div class="label">Target Retirement</div><div class="value">${inputs.targetRetirementAge}</div></div>
<div class="input-item"><div class="label">Portfolio Value</div><div class="value">${formatCurrency(inputs.portfolioValue, country1?.currency || 'USD')}</div></div>
<div class="input-item"><div class="label">Annual Spending</div><div class="value">${formatCurrency(inputs.annualSpending, country1?.currency || 'USD')}</div></div>
<div class="input-item"><div class="label">Annual Savings</div><div class="value">${formatCurrency(inputs.annualSavings, country1?.currency || 'USD')}</div></div>
<div class="input-item"><div class="label">Years to FIRE</div><div class="value">${inputs.targetRetirementAge - inputs.currentAge} years</div></div>
</div></div>
<div class="section"><h2>FIRE Comparison</h2><div class="comparison-grid">
<div class="country-card"><h3>${country1?.flag} ${country1?.name}</h3>
<div class="stat"><div class="stat-label">FIRE Number</div><div class="stat-value ${comparison.lowerFIRENumber === country1Code ? 'highlight' : ''}">${formatCurrency(result1.fireNumber, country1?.currency || 'USD')}</div></div>
<div class="stat"><div class="stat-label">Years to FIRE</div><div class="stat-value ${comparison.earlierRetirement === country1Code ? 'highlight' : ''}">${result1.yearsUntilFIRE} years</div></div>
<div class="stat"><div class="stat-label">Effective Tax Rate</div><div class="stat-value ${comparison.lowerEffectiveTaxRate === country1Code ? 'highlight' : ''}">${formatPercent(result1.effectiveTaxRate)}</div></div>
<div class="stat"><div class="stat-label">After Tax Withdrawal</div><div class="stat-value">${formatCurrency(result1.annualWithdrawalNet, country1?.currency || 'USD')}</div></div>
</div>
<div class="country-card"><h3>${country2?.flag} ${country2?.name}</h3>
<div class="stat"><div class="stat-label">FIRE Number</div><div class="stat-value ${comparison.lowerFIRENumber === country2Code ? 'highlight' : ''}">${formatCurrency(result2.fireNumber, country2?.currency || 'USD')}</div></div>
<div class="stat"><div class="stat-label">Years to FIRE</div><div class="stat-value ${comparison.earlierRetirement === country2Code ? 'highlight' : ''}">${result2.yearsUntilFIRE} years</div></div>
<div class="stat"><div class="stat-label">Effective Tax Rate</div><div class="stat-value ${comparison.lowerEffectiveTaxRate === country2Code ? 'highlight' : ''}">${formatPercent(result2.effectiveTaxRate)}</div></div>
<div class="stat"><div class="stat-label">After Tax Withdrawal</div><div class="stat-value">${formatCurrency(result2.annualWithdrawalNet, country2?.currency || 'USD')}</div></div>
</div></div>
<div class="summary-box"><h3>✓ Summary</h3><ul>
<li>• FIRE number is <strong>${formatCurrency(comparison.fireNumberDifferenceUSD, 'USD')}</strong> (${formatPercent(comparison.fireNumberDifferencePercent)}) lower in <strong>${countries[comparison.lowerFIRENumber]?.name}</strong></li>
<li>• Effective tax rate is <strong>${formatPercent(comparison.taxRateDifference)}</strong> lower in <strong>${countries[comparison.lowerEffectiveTaxRate]?.name}</strong></li>
${comparison.earlierRetirement ? `<li>• You can retire <strong>${Math.abs(result1.yearsUntilFIRE - result2.yearsUntilFIRE)} years</strong> sooner in <strong>${countries[comparison.earlierRetirement]?.name}</strong></li>` : ''}
</ul></div></div>
${monteCarloSection}${colSection}${visaSection}
<div class="footer"><p>Generated by FIRE Abroad • fireabroad.com</p><p>This is an estimate only. Consult with tax and immigration professionals.</p></div>
</body></html>`;
}

export function PDFExportButton({ result1, result2, comparison, country1Code, country2Code, inputs }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    let mc1: MonteCarloResult | null = null;
    let mc2: MonteCarloResult | null = null;
    try {
      mc1 = runMonteCarloSimulation(inputs, result1);
      mc2 = runMonteCarloSimulation(inputs, result2);
    } catch (e) {
      console.error('Monte Carlo error:', e);
    }
    
    const content = generatePDFContent(result1, result2, comparison, country1Code, country2Code, inputs, mc1, mc2);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => { printWindow.print(); setIsGenerating(false); }, 250);
      };
    } else {
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fire-abroad-${country1Code}-vs-${country2Code}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }
  };

  return (
    <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
      {isGenerating ? (
        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Generating...</>
      ) : (
        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export PDF</>
      )}
    </button>
  );
}
