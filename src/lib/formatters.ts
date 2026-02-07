/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  });
  return formatter.format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(
  amount: number,
  decimals: number = 0
): string {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a percentage
 */
export function formatPercent(
  rate: number,
  decimals: number = 1
): string {
  // Handle edge cases
  if (rate === undefined || rate === null || isNaN(rate)) {
    rate = 0;
  }
  
  return `${(rate * 100).toFixed(decimals)}%`;
}

/**
 * Format years
 */
export function formatYears(years: number): string {
  if (years === undefined || years === null || isNaN(years)) {
    return '0 years';
  }
  if (years === 1) return '1 year';
  if (years === 0) return 'Now';
  if (years < 0) return 'Already FIRE';
  return `${years} years`;
}

/**
 * Compact number format (e.g., $1.2M)
 */
export function formatCompact(
  amount: number,
  currency: string = 'USD'
): string {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CHF: 'CHF ',
    AUD: 'A$',
    CAD: 'C$',
    MXN: 'MX$',
    THB: '฿',
    JPY: '¥',
    SGD: 'S$',
    AED: 'AED ',
    NZD: 'NZ$',
    COP: 'COL$',
    MYR: 'RM',
    VND: '₫',
    CRC: '₡',
  };
  const symbol = symbols[currency] || currency + ' ';
  
  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}K`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

/**
 * Get color class based on comparison
 */
export function getComparisonColor(
  value1: number,
  value2: number,
  lowerIsBetter: boolean = true
): 'text-green-600' | 'text-red-600' | 'text-gray-600' {
  if (value1 === value2) return 'text-gray-600';
  const value1IsBetter = lowerIsBetter ? value1 < value2 : value1 > value2;
  return value1IsBetter ? 'text-green-600' : 'text-red-600';
}
