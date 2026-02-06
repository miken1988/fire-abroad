// Currency conversion with live rates
// Falls back to cached rates if API fails

const CACHE_KEY = 'fx_rates';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Fallback rates (updated Feb 2025)
const fallbackRates: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  AED: 3.67,
  SGD: 1.34,
  MXN: 17.15,
  THB: 35.5,
  CRC: 510,
  JPY: 149.5,
  NZD: 1.62,
  COP: 4150,
  MYR: 4.47,
  VND: 24500,
};

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

export async function fetchLiveRates(): Promise<Record<string, number>> {
  // Check cache first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { rates, timestamp }: CachedRates = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Using cached FX rates');
          return rates;
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }
  }

  try {
    // Free API - no key required
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('FX API failed');
    
    const data = await response.json();
    const rates: Record<string, number> = {
      USD: 1,
      GBP: data.rates.GBP || fallbackRates.GBP,
      EUR: data.rates.EUR || fallbackRates.EUR,
      CAD: data.rates.CAD || fallbackRates.CAD,
      AUD: data.rates.AUD || fallbackRates.AUD,
      CHF: data.rates.CHF || fallbackRates.CHF,
      AED: data.rates.AED || fallbackRates.AED,
      SGD: data.rates.SGD || fallbackRates.SGD,
      MXN: data.rates.MXN || fallbackRates.MXN,
      THB: data.rates.THB || fallbackRates.THB,
      CRC: data.rates.CRC || fallbackRates.CRC,
      JPY: data.rates.JPY || fallbackRates.JPY,
      NZD: data.rates.NZD || fallbackRates.NZD,
      COP: data.rates.COP || fallbackRates.COP,
      MYR: data.rates.MYR || fallbackRates.MYR,
      VND: data.rates.VND || fallbackRates.VND,
    };

    // Cache the rates
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates,
        timestamp: Date.now(),
      }));
    }

    console.log('Fetched live FX rates:', rates);
    return rates;
  } catch (error) {
    console.warn('Failed to fetch live rates, using fallback:', error);
    return fallbackRates;
  }
}

let cachedRates: Record<string, number> | null = null;

export function getRates(): Record<string, number> {
  return cachedRates || fallbackRates;
}

export function setRates(rates: Record<string, number>) {
  cachedRates = rates;
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  if (!amount || isNaN(amount)) return 0;
  
  const rates = getRates();
  
  // Handle missing rates
  if (!rates[from] || !rates[to]) {
    console.warn(`Missing rate for ${from} or ${to}, using fallback`);
    const fb = fallbackRates;
    const fromRate = rates[from] || fb[from] || 1;
    const toRate = rates[to] || fb[to] || 1;
    const inUSD = from === 'USD' ? amount : amount / fromRate;
    return to === 'USD' ? inUSD : inUSD * toRate;
  }
  
  // Convert to USD first, then to target
  const inUSD = from === 'USD' ? amount : amount / rates[from];
  const result = to === 'USD' ? inUSD : inUSD * rates[to];
  
  return result;
}

// Get display rate (e.g., "1 USD = 0.79 GBP")
export function getDisplayRate(from: string, to: string): string {
  if (from === to) return '1.00';
  
  const rates = getRates();
  const fromRate = rates[from] || fallbackRates[from] || 1;
  const toRate = rates[to] || fallbackRates[to] || 1;
  
  const inUSD = from === 'USD' ? 1 : 1 / fromRate;
  const result = to === 'USD' ? inUSD : inUSD * toRate;
  
  return result.toFixed(4);
}
