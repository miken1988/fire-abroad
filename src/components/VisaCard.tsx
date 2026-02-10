'use client';

import { useState } from 'react';
import { getVisaInfo, formatVisaAmount, VisaOption } from '@/data/visaRequirements';
import { countries } from '@/data/countries';

interface VisaCardProps {
  countryCode: string;
  userAge: number;
  annualIncome?: number;
  portfolioValue?: number;
}

export function VisaCard({ countryCode, userAge, annualIncome = 0, portfolioValue = 0 }: VisaCardProps) {
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null);
  const visaInfo = getVisaInfo(countryCode);
  const country = countries[countryCode];
  
  if (!visaInfo || !country) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
          🛂 Visa & Residency
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Visa information not yet available for {country?.name || 'this country'}. 
          Check with the local embassy or immigration authority.
        </p>
      </div>
    );
  }

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

  const checkEligibility = (option: VisaOption): { eligible: boolean; reason?: string } => {
    if (option.minAge && userAge < option.minAge) {
      return { eligible: false, reason: `Requires age ${option.minAge}+` };
    }
    return { eligible: true };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        🛂 Visa & Residency for {country.flag} {country.name}
      </h3>
      
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">{visaInfo.overview}</p>
      
      {visaInfo.taxNotes && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 mb-4">
          <p className="text-xs text-green-700 dark:text-green-400">💡 <strong>Tax Tip:</strong> {visaInfo.taxNotes}</p>
        </div>
      )}

      <div className="space-y-3">
        {visaInfo.options.map((option, index) => {
          const isExpanded = expandedVisa === option.name;
          const eligibility = checkEligibility(option);
          
          return (
            <div 
              key={index}
              className={`bg-gray-50 dark:bg-slate-700/50 rounded-lg border ${eligibility.eligible ? 'border-gray-200 dark:border-slate-600' : 'border-amber-200 dark:border-amber-700'} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedVisa(isExpanded ? null : option.name)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100 dark:border-slate-600">
                  <div className="pt-3 space-y-3">
                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {option.minIncome && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <span className="text-gray-500 dark:text-gray-400">Min. Income</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formatVisaAmount(option.minIncome, option.currency)}/yr</p>
                        </div>
                      )}
                      {option.minWealth && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <span className="text-gray-500 dark:text-gray-400">Min. Investment</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formatVisaAmount(option.minWealth, option.currency)}</p>
                        </div>
                      )}
                      {option.minAge && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <span className="text-gray-500 dark:text-gray-400">Min. Age</span>
                          <p className="font-medium text-gray-900 dark:text-white">{option.minAge}+</p>
                        </div>
                      )}
                      {option.pathToCitizenship && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <span className="text-gray-500 dark:text-gray-400">Citizenship Path</span>
                          <p className="font-medium text-gray-900 dark:text-white">{option.pathToCitizenship}</p>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-300">{option.notes}</p>
                    
                    {/* Pros/Cons */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-medium text-green-700 dark:text-green-400 mb-1">✓ Pros</p>
                        <ul className="text-[10px] text-gray-600 dark:text-gray-300 space-y-0.5">
                          {option.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-red-700 dark:text-red-400 mb-1">✗ Cons</p>
                        <ul className="text-[10px] text-gray-600 dark:text-gray-300 space-y-0.5">
                          {option.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
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
      
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
        Visa requirements change frequently. Always verify with official sources before making plans.
      </p>
    </div>
  );
}
