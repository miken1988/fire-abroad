'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What is the 4% rule (Safe Withdrawal Rate)?',
    answer: 'The 4% rule suggests you can withdraw 4% of your portfolio in the first year of retirement, then adjust for inflation each year, with a high probability of your money lasting 30+ years. This calculator lets you customize the withdrawal rate based on your risk tolerance and retirement timeline.',
  },
  {
    question: 'How does cost of living affect my FIRE number?',
    answer: 'Your FIRE number is directly tied to annual spending. If you retire in a country where your lifestyle costs 40% less, your required portfolio shrinks proportionally. For example, $50,000/year spending in the US might become $30,000/year in Portugal, reducing your FIRE number from $1.25M to $750K.',
  },
  {
    question: 'Do I need to pay taxes in both countries?',
    answer: 'It depends on your citizenship and the countries involved. US citizens are taxed on worldwide income regardless of where they live, but can use the Foreign Earned Income Exclusion (FEIE) or Foreign Tax Credit to avoid double taxation. Most other countries only tax residents. Tax treaties between countries often prevent double taxation.',
  },
  {
    question: 'What about healthcare costs abroad?',
    answer: 'Healthcare costs vary dramatically by country. Many countries offer public healthcare systems that cover residents at low or no cost. Others require private insurance. This calculator includes estimated healthcare costs for each country. For the first few years abroad, most retirees use international health insurance (like SafetyWing or Cigna Global) until they qualify for local coverage.',
  },
  {
    question: 'How accurate are these calculations?',
    answer: 'These calculations use real tax brackets, cost of living indices, and pension data for each country. However, they are estimates. Tax laws change, exchange rates fluctuate, and personal circumstances vary. Use the Monte Carlo simulation to see how your plan performs across different market scenarios. We recommend consulting a tax professional familiar with expat finances before making major decisions.',
  },
  {
    question: 'Can I work part-time after retiring abroad?',
    answer: 'Many early retirees do freelance or part-time work. Use the Passive Income section in Advanced mode to model income from rental properties, consulting, or other sources. Note that work visas and tax implications vary by country -- some retirement visas restrict employment.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          Frequently Asked Questions
        </h3>
      </div>
      <div className="divide-y divide-amber-200 dark:divide-amber-800/50">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-amber-800/20 transition-colors"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 pr-4">{faq.question}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
