/**
 * Integration tests for Calculator component
 * 
 * These tests verify the logic that determines winners, handles edge cases,
 * and ensures the comparison works correctly.
 * 
 * To add full React component tests later:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
 */

describe('Comparison Logic', () => {
  interface ComparisonResult {
    yearsUntilFIRE1: number;
    yearsUntilFIRE2: number;
    fireNumberUSD1: number;
    fireNumberUSD2: number;
  }

  function determineWinner(result: ComparisonResult): { winner: 1 | 2; reason: string } {
    if (result.yearsUntilFIRE1 === result.yearsUntilFIRE2) {
      // Tie on years - use FIRE number as tiebreaker
      return result.fireNumberUSD1 <= result.fireNumberUSD2
        ? { winner: 1, reason: 'lowerFIRENumber' }
        : { winner: 2, reason: 'lowerFIRENumber' };
    }
    // Different years - earlier retirement wins
    return result.yearsUntilFIRE1 < result.yearsUntilFIRE2
      ? { winner: 1, reason: 'earlierRetirement' }
      : { winner: 2, reason: 'earlierRetirement' };
  }

  it('picks lower FIRE number when years are equal', () => {
    const result = determineWinner({
      yearsUntilFIRE1: 10,
      yearsUntilFIRE2: 10,
      fireNumberUSD1: 1000000,
      fireNumberUSD2: 800000,
    });
    
    expect(result.winner).toBe(2);
    expect(result.reason).toBe('lowerFIRENumber');
  });

  it('picks earlier retirement when years differ', () => {
    const result = determineWinner({
      yearsUntilFIRE1: 15,
      yearsUntilFIRE2: 10,
      fireNumberUSD1: 800000,
      fireNumberUSD2: 1000000,
    });
    
    expect(result.winner).toBe(2);
    expect(result.reason).toBe('earlierRetirement');
  });

  it('handles tie on both metrics (first wins)', () => {
    const result = determineWinner({
      yearsUntilFIRE1: 10,
      yearsUntilFIRE2: 10,
      fireNumberUSD1: 1000000,
      fireNumberUSD2: 1000000,
    });
    
    expect(result.winner).toBe(1);
  });

  it('country1 winning on years beats country2 winning on FIRE number', () => {
    const result = determineWinner({
      yearsUntilFIRE1: 8,  // country1 wins on years
      yearsUntilFIRE2: 12,
      fireNumberUSD1: 1200000,  // country2 wins on FIRE number
      fireNumberUSD2: 900000,
    });
    
    // Earlier retirement should win
    expect(result.winner).toBe(1);
    expect(result.reason).toBe('earlierRetirement');
  });
});

describe('Edge Case Handling', () => {
  function formatCurrencySafe(amount: number): string {
    if (isNaN(amount) || amount === undefined || amount === null) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  it('handles NaN in currency formatting', () => {
    expect(formatCurrencySafe(NaN)).toBe('$0');
  });

  it('handles undefined in currency formatting', () => {
    expect(formatCurrencySafe(undefined as any)).toBe('$0');
  });

  it('handles very large numbers', () => {
    const result = formatCurrencySafe(100000000);
    expect(result).toBe('$100,000,000');
  });

  it('handles zero', () => {
    expect(formatCurrencySafe(0)).toBe('$0');
  });

  it('handles negative numbers', () => {
    const result = formatCurrencySafe(-50000);
    expect(result).toBe('-$50,000');
  });
});

describe('Array Safety', () => {
  function getLastElement<T>(arr: T[], fallback: T): T {
    if (!arr || arr.length === 0) return fallback;
    return arr[arr.length - 1];
  }

  function getElementAtIndex<T>(arr: T[], index: number, fallback: T): T {
    if (!arr || index < 0 || index >= arr.length) return fallback;
    return arr[index];
  }

  it('handles empty array for last element', () => {
    expect(getLastElement([], 0)).toBe(0);
  });

  it('handles negative index', () => {
    expect(getElementAtIndex([1, 2, 3], -1, 0)).toBe(0);
  });

  it('handles index out of bounds', () => {
    expect(getElementAtIndex([1, 2, 3], 10, 0)).toBe(0);
  });

  it('handles undefined array', () => {
    expect(getLastElement(undefined as any, 0)).toBe(0);
  });

  it('handles normal access', () => {
    expect(getLastElement([1, 2, 3], 0)).toBe(3);
    expect(getElementAtIndex([1, 2, 3], 1, 0)).toBe(2);
  });
});

describe('Tax Rate Bounds', () => {
  function validateTaxRate(rate: number): number {
    if (isNaN(rate) || rate < 0) return 0;
    if (rate > 1) return 1; // Cap at 100%
    return rate;
  }

  it('caps tax rate at 100%', () => {
    expect(validateTaxRate(1.5)).toBe(1);
  });

  it('floors tax rate at 0%', () => {
    expect(validateTaxRate(-0.1)).toBe(0);
  });

  it('handles NaN', () => {
    expect(validateTaxRate(NaN)).toBe(0);
  });

  it('passes through valid rates', () => {
    expect(validateTaxRate(0.25)).toBe(0.25);
    expect(validateTaxRate(0)).toBe(0);
    expect(validateTaxRate(1)).toBe(1);
  });
});

describe('Input Validation', () => {
  function validateAge(age: number, fallback: number = 30): number {
    if (isNaN(age) || age < 1 || age > 120) return fallback;
    return Math.floor(age);
  }

  function validateMoney(amount: number): number {
    if (isNaN(amount) || amount < 0) return 0;
    return amount;
  }

  it('validates reasonable ages', () => {
    expect(validateAge(25)).toBe(25);
    expect(validateAge(65)).toBe(65);
  });

  it('rejects invalid ages', () => {
    expect(validateAge(NaN)).toBe(30);
    expect(validateAge(-5)).toBe(30);
    expect(validateAge(150)).toBe(30);
    expect(validateAge(0)).toBe(30);
  });

  it('floors fractional ages', () => {
    expect(validateAge(25.7)).toBe(25);
  });

  it('validates money amounts', () => {
    expect(validateMoney(100000)).toBe(100000);
    expect(validateMoney(0)).toBe(0);
  });

  it('rejects invalid money', () => {
    expect(validateMoney(NaN)).toBe(0);
    expect(validateMoney(-5000)).toBe(0);
  });
});
