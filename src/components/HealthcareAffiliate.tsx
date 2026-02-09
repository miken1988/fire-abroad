'use client';

import { getPartnersForSection, trackAffiliateClick, type AffiliatePartner } from '@/data/affiliates';

interface HealthcareAffiliateProps {
  retireCountryName: string;
  retireCountryCode: string;
}

export default function HealthcareAffiliate({ retireCountryName, retireCountryCode }: HealthcareAffiliateProps) {
  const partners = getPartnersForSection('healthcare');

  if (partners.length === 0) return null;

  const handleClick = (partner: AffiliatePartner) => {
    trackAffiliateClick(partner.id, 'healthcare');
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        🏥 Expat Health Insurance Options
      </p>
      <div className="space-y-2">
        {partners.map((partner) => (
          <a
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleClick(partner)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg flex-shrink-0">{partner.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {partner.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {partner.shortDescription}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
              {partner.ctaText} →
            </span>
          </a>
        ))}
      </div>
      <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 italic">
        Partner links • We may earn a commission at no cost to you
      </p>
    </div>
  );
}
