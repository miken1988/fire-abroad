'use client';

import { useState } from 'react';
import { getVisaInfo, formatVisaAmount, VisaOption } from '@/data/visaRequirements';
import { countries } from '@/data/countries';
import { AFFILIATE_PARTNERS, trackAffiliateClick, getAffiliateUrl, type AffiliatePartner } from '@/data/affiliates';

interface MoveToCountryPanelProps {
  countryCode: string;
  userAge: number;
  fromCurrency: string;
  toCurrency: string;
  showDifferentCurrencies: boolean;
}

// Visa helpers
const getTypeIcon = (type: VisaOption['type']) => {
  switch (type) {
    case 'retirement': return '🏖️';
    case 'investor': return '💰';
    case 'passive_income': return '📈';
    case 'digital_nomad': return '💻';
    case 'golden': return '🌟';
    default: return '📋';
  }
};

const getTypeLabel = (type: VisaOption['type']) => {
  switch (type) {
    case 'retirement': return 'Retirement';
    case 'investor': return 'Investor';
    case 'passive_income': return 'Passive Income';
    case 'digital_nomad': return 'Digital Nomad';
    case 'golden': return 'Golden Visa';
    default: return 'Standard';
  }
};

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  partnerId?: string;
}

export default function MoveToCountryPanel({
  countryCode,
  userAge,
  fromCurrency,
  toCurrency,
  showDifferentCurrencies,
}: MoveToCountryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const country = countries[countryCode];
  const visaInfo = getVisaInfo(countryCode);
  const retireCountryName = country?.name || 'abroad';

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const checkEligibility = (option: VisaOption): { eligible: boolean; reason?: string } => {
    if (option.minAge && userAge < option.minAge) {
      return { eligible: false, reason: `Requires age ${option.minAge}+` };
    }
    return { eligible: true };
  };

  const checklist: ChecklistItem[] = [
    {
      id: 'health',
      label: 'Get expat health insurance quotes',
      description: 'Compare international health plans',
      icon: '🏥',
      partnerId: 'safetywing',
    },
    ...(showDifferentCurrencies ? [{
      id: 'banking',
      label: 'Set up international banking',
      description: `Open a multi-currency account for ${fromCurrency}→${toCurrency} transfers`,
      icon: '💱',
      partnerId: 'wise',
    }] : []),
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
              Visa options, checklist & tools to get started
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
          {/* ── Visa & Residency ── */}
          {visaInfo && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                🛂 Visa & Residency Options
              </h4>

              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{visaInfo.overview}</p>

              {visaInfo.taxNotes && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 mb-3">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    💡 <strong>Tax Tip:</strong> {visaInfo.taxNotes}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {visaInfo.options.map((option, index) => {
                  const isVisaExpanded = expandedVisa === option.name;
                  const eligibility = checkEligibility(option);

                  return (
                    <div
                      key={index}
                      className={`bg-white dark:bg-slate-800 rounded-lg border ${
                        eligibility.eligible
                          ? 'border-gray-200 dark:border-slate-700'
                          : 'border-amber-200 dark:border-amber-700'
                      } overflow-hidden`}
                    >
                      <button
                        onClick={() => setExpandedVisa(isVisaExpanded ? null : option.name)}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(option.type)}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{option.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {getTypeLabel(option.type)} • {option.duration}
                              {option.renewable && ' • Renewable'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!eligibility.eligible && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                              {eligibility.reason}
                            </span>
                          )}
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isVisaExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isVisaExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-100 dark:border-slate-700">
                          <div className="pt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {option.minIncome && (
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-2">
                                  <span className="text-gray-500 dark:text-gray-400">Min. Income</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatVisaAmount(option.minIncome, option.currency)}/yr</p>
                                </div>
                              )}
                              {option.minWealth && (
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-2">
                                  <span className="text-gray-500 dark:text-gray-400">Min. Investment</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatVisaAmount(option.minWealth, option.currency)}</p>
                                </div>
                              )}
                              {option.minAge && (
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-2">
                                  <span className="text-gray-500 dark:text-gray-400">Min. Age</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{option.minAge}+</p>
                                </div>
                              )}
                              {option.pathToCitizenship && (
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-2">
                                  <span className="text-gray-500 dark:text-gray-400">Citizenship Path</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{option.pathToCitizenship}</p>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-300">{option.notes}</p>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] font-medium text-green-700 dark:text-green-400 mb-1">✓ Pros</p>
                                <ul className="text-[10px] text-gray-600 dark:text-gray-300 space-y-0.5">
                                  {option.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
                                </ul>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-red-700 dark:text-red-400 mb-1">✗ Cons</p>
                                <ul className="text-[10px] text-gray-600 dark:text-gray-300 space-y-0.5">
                                  {option.cons.map((con, i) => <li key={i}>• {con}</li>)}
                                </ul>
                              </div>
                            </div>

                            {option.healthInsuranceRequired && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                ⚠️ Health insurance required
                              </p>
                            )}

                            {option.link && (
                              <a
                                href={option.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                Official info →
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                Visa requirements change frequently. Always verify with official sources.
              </p>
            </div>
          )}

          {/* ── Checklist ── */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              ✅ Moving Checklist
            </h4>

            {/* Progress bar (mobile) */}
            {checkedItems.size > 0 && (
              <div className="sm:hidden flex items-center gap-2 mb-3">
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
                          <p className={`text-sm font-medium transition-all ${
                            isChecked
                              ? 'text-green-700 dark:text-green-300 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
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
          </div>

          {/* ── Recommended Tools ── */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Recommended Tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AFFILIATE_PARTNERS.map((partner) => (
                <a
                  key={partner.id}
                  href={getAffiliateUrl(partner, toCurrency)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => trackAffiliateClick(partner.id, 'nextsteps_tools')}
                  className="block p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
                      {partner.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{partner.name}</h4>
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex-shrink-0">
                          {partner.ctaText} →
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{partner.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {partner.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
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
