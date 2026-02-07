import { formatCurrency, formatPercent, formatCompact, formatYears, formatNumber } from './formatters';

describe('formatCurrency', () => {
  it('formats basic numbers correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000');
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0');
  });

  it('handles NaN', () => {
    expect(formatCurrency(NaN, 'USD')).toBe('$0');
  });

  it('handles undefined', () => {
    expect(formatCurrency(undefined as any, 'USD')).toBe('$0');
  });

  it('handles null', () => {
    expect(formatCurrency(null as any, 'USD')).toBe('$0');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-5000, 'USD')).toBe('-$5,000');
  });

  it('handles different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
  });
});

describe('formatPercent', () => {
  it('formats basic percentages', () => {
    expect(formatPercent(0.25)).toBe('25.0%');
    expect(formatPercent(0.125)).toBe('12.5%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('handles NaN', () => {
    expect(formatPercent(NaN)).toBe('0.0%');
  });

  it('handles undefined', () => {
    expect(formatPercent(undefined as any)).toBe('0.0%');
  });

  it('handles 100%', () => {
    expect(formatPercent(1)).toBe('100.0%');
  });
});

describe('formatCompact', () => {
  it('formats millions', () => {
    expect(formatCompact(1500000, 'USD')).toBe('$1.5M');
    expect(formatCompact(2000000, 'USD')).toBe('$2.0M');
  });

  it('formats thousands', () => {
    expect(formatCompact(500000, 'USD')).toBe('$500K');
    expect(formatCompact(50000, 'USD')).toBe('$50K');
  });

  it('formats small numbers', () => {
    expect(formatCompact(500, 'USD')).toBe('$500');
  });

  it('handles zero', () => {
    expect(formatCompact(0, 'USD')).toBe('$0');
  });

  it('handles NaN', () => {
    expect(formatCompact(NaN, 'USD')).toBe('$0');
  });

  it('handles different currencies', () => {
    expect(formatCompact(1000000, 'EUR')).toBe('€1.0M');
    expect(formatCompact(1000000, 'GBP')).toBe('£1.0M');
  });

  it('handles negative numbers', () => {
    expect(formatCompact(-500000, 'USD')).toBe('$-500K');
  });
});

describe('formatYears', () => {
  it('formats plural years', () => {
    expect(formatYears(5)).toBe('5 years');
    expect(formatYears(10)).toBe('10 years');
  });

  it('formats singular year', () => {
    expect(formatYears(1)).toBe('1 year');
  });

  it('formats zero as Now', () => {
    expect(formatYears(0)).toBe('Now');
  });

  it('formats negative as Already FIRE', () => {
    expect(formatYears(-1)).toBe('Already FIRE');
    expect(formatYears(-5)).toBe('Already FIRE');
  });

  it('handles NaN', () => {
    expect(formatYears(NaN)).toBe('0 years');
  });

  it('handles undefined', () => {
    expect(formatYears(undefined as any)).toBe('0 years');
  });
});

describe('formatNumber', () => {
  it('formats with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('handles decimals', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
  });

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('0');
  });

  it('handles undefined', () => {
    expect(formatNumber(undefined as any)).toBe('0');
  });
});
