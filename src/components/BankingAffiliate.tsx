'use client';

import { getPartnersForSection, trackAffiliateClick, type AffiliatePartner } from '@/data/affiliates';

interface BankingAffiliateProps {
  fromCurrency: string;
  toCurrency: string;
  retireCountryName: string;
}

export default function BankingAffiliate({ fromCurrency, toCurrency, retireCountryName }: BankingAffiliateProps) {
  const partners = getPartnersForSection('banking');
  const wise = partners.find(p => p.id === 'wise');

  if (!wise) return null;

  const handleClick = () => {
    trackAffiliateClick('wise', 'col_banking');
  };

  // Don't show if same currency
  if (fromCurrency === toCurrency) return null;

  return (
    <a
      href={wise.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group cursor-pointer"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
        <span className="text-base">💱</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white">
          Moving money to {retireCountryName}?
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Wise offers the real {fromCurrency}→{toCurrency} exchange rate — up to 6x cheaper than banks
        </p>
      </div>
      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded flex-shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors whitespace-nowrap">
        Try Wise →
      </span>
    </a>
  );
}
