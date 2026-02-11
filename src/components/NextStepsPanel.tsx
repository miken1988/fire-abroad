'use client';

import { useState } from 'react';
import { AFFILIATE_PARTNERS, trackAffiliateClick, getAffiliateUrl, type AffiliatePartner } from '@/data/affiliates';

interface NextStepsPanelProps {
  retireCountryName: string;
  retireCountryCode: string;
  fromCurrency: string;
  toCurrency: string;
  showDifferentCurrencies: boolean;
}

function PartnerCard({ partner, section, currency }: { partner: AffiliatePartner; section: string; currency?: string }) {
  const handleClick = () => {
    trackAffiliateClick(partner.id, section);
  };

  return (
    <a
      href={getAffiliateUrl(partner, currency)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="block p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
          {partner.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {partner.name}
            </h4>
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex-shrink-0">
              {partner.ctaText} →
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
            {partner.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {partner.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded"
              >
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  partnerId?: string;
}

export default function NextStepsPanel({
  retireCountryName,
  retireCountryCode,
  fromCurrency,
  toCurrency,
  showDifferentCurrencies,
}: NextStepsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const checklist: ChecklistItem[] = [
    {
      id: 'research',
      label: 'Research visa requirements',
      description: `Check ${retireCountryName}'s visa options above`,
      icon: '🛂',
    },
    {
      id: 'health',
      label: 'Get expat health insurance quotes',
      description: 'Compare international health plans',
      icon: '🏥',
      partnerId: 'safetywing',
    },
    ...(showDifferentCurrencies
      ? [
          {
            id: 'banking',
            label: 'Set up international banking',
            description: `Open a multi-currency account for ${fromCurrency}→${toCurrency} transfers`,
            icon: '💱',
            partnerId: 'wise',
          },
        ]
      : []),
    {
      id: 'tax',
      label: 'Consult a cross-border tax advisor',
      description: 'Understand tax obligations in both countries',
      icon: '📋',
    },
    {
      id: 'vpn',
      label: 'Get a VPN for accessing home services',
      description: 'Keep access to banking and streaming abroad',
      icon: '🔒',
      partnerId: 'nordvpn',
    },
    {
      id: 'visit',
      label: 'Plan a scouting trip',
      description: `Visit ${retireCountryName} for 2-4 weeks before committing`,
      icon: '✈️',
    },
    {
      id: 'community',
      label: 'Connect with expat communities',
      description: `Join online groups for expats in ${retireCountryName}`,
      icon: '👥',
    },
  ];

  const progress = Math.round((checkedItems.size / checklist.length) * 100);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-indigo-100/50 dark:hover:bg-indigo-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Plan Your Move to {retireCountryName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Checklist & tools to get started • {checklist.length} steps
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {checkedItems.size > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{progress}%</span>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-5">
          {/* Progress bar (mobile) */}
          {checkedItems.size > 0 && (
            <div className="sm:hidden flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {checkedItems.size}/{checklist.length}
              </span>
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-2">
            {checklist.map((item) => {
              const partner = item.partnerId
                ? AFFILIATE_PARTNERS.find(p => p.id === item.partnerId)
                : undefined;
              const isChecked = checkedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isChecked
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-sm font-medium transition-all ${
                            isChecked
                              ? 'text-green-700 dark:text-green-300 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          <span className="mr-1.5">{item.icon}</span>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {partner && (
                        <a
                          href={getAffiliateUrl(partner, toCurrency)}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackAffiliateClick(partner.id, 'nextsteps_checklist');
                          }}
                          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors flex-shrink-0 whitespace-nowrap"
                        >
                          {partner.name} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Tools */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Recommended Tools for Your Move
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AFFILIATE_PARTNERS.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} section="nextsteps_tools" currency={toCurrency} />
              ))}
            </div>
          </div>

          <p className="text-[9px] text-gray-400 dark:text-gray-500 italic text-center">
            Some links are affiliate links • We may earn a commission at no extra cost to you •{' '}
            <a href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
