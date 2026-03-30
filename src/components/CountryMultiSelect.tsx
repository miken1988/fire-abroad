'use client';

import { useState, useRef, useEffect } from 'react';
import { countries } from '@/data/countries';

interface CountryMultiSelectProps {
  values: string[];
  onChange: (codes: string[]) => void;
  maxSelections?: number;
  excludeCountry?: string; // exclude current country from options
}

const countryList = Object.values(countries).map(c => ({
  code: c.code,
  name: c.name,
  flag: c.flag,
}));

export function CountryMultiSelect({ values, onChange, maxSelections = 5, excludeCountry }: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const available = countryList.filter(c =>
    c.code !== excludeCountry &&
    !values.includes(c.code) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const items = listRef.current.children;
    if (items[highlightIndex]) {
      (items[highlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, isOpen]);

  const addCountry = (code: string) => {
    if (values.length < maxSelections && !values.includes(code)) {
      onChange([...values, code]);
    }
    setSearch('');
    setHighlightIndex(0);
    if (values.length + 1 >= maxSelections) {
      setIsOpen(false);
    }
  };

  const removeCountry = (code: string) => {
    onChange(values.filter(c => c !== code));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, available.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (available[highlightIndex]) addCountry(available[highlightIndex].code);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Backspace' && search === '' && values.length > 1) {
      removeCountry(values[values.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="min-h-[38px] w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 flex flex-wrap items-center gap-1.5">
        {values.map(code => {
          const c = countries[code];
          if (!c) return null;
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full"
            >
              {c.flag} {c.name}
              {values.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCountry(code)}
                  className="ml-0.5 hover:text-red-500 transition-colors"
                >
                  x
                </button>
              )}
            </span>
          );
        })}
        {values.length < maxSelections && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHighlightIndex(0);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            + Add country
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{values.length}/{maxSelections} countries</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightIndex(0); }}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div ref={listRef} className="max-h-48 overflow-y-auto">
            {available.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {values.length >= maxSelections ? 'Maximum countries selected' : 'No countries found'}
              </div>
            ) : (
              available.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => addCountry(c.code)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    i === highlightIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.flag} {c.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
