/**
 * WhereToFIRE Analytics - Custom GA4 Event Tracking
 * 
 * Events appear in GA4 > Reports > Engagement > Events
 * Custom dimensions appear in GA4 > Configure > Custom definitions
 */

// Type-safe gtag wrapper
function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

// ============================================
// CALCULATOR INTERACTIONS
// ============================================

/** User selects a country (from or to) */
export function trackCountrySelect(position: 'from' | 'to', countryCode: string, countryName: string) {
  gtag('event', 'country_select', {
    event_category: 'calculator',
    position,
    country_code: countryCode,
    country_name: countryName,
  });
}

/** User changes a key input value */
export function trackInputChange(field: string, value: number | string) {
  gtag('event', 'input_change', {
    event_category: 'calculator',
    field_name: field,
    field_value: typeof value === 'number' ? Math.round(value) : value,
  });
}

/** User switches between simplified and advanced mode */
export function trackModeSwitch(mode: 'simplified' | 'advanced') {
  gtag('event', 'mode_switch', {
    event_category: 'calculator',
    mode,
  });
}

/** FIRE calculation completed — the core event */
export function trackCalculation(data: {
  fromCountry: string;
  toCountry: string;
  portfolioValue: number;
  annualSpending: number;
  currentAge: number;
  retirementAge: number;
  fireNumber1: number;
  fireNumber2: number;
  canRetire1: boolean;
  canRetire2: boolean;
  winner?: string;
}) {
  gtag('event', 'fire_calculation', {
    event_category: 'calculator',
    from_country: data.fromCountry,
    to_country: data.toCountry,
    portfolio_value_bucket: getBucket(data.portfolioValue),
    spending_bucket: getBucket(data.annualSpending),
    current_age: data.currentAge,
    retirement_age: data.retirementAge,
    can_retire_home: data.canRetire1,
    can_retire_abroad: data.canRetire2,
    winner: data.winner || 'none',
    comparison: `${data.fromCountry}_to_${data.toCountry}`,
  });
}

// ============================================
// SECTION ENGAGEMENT
// ============================================

/** User expands/collapses a section */
export function trackSectionToggle(section: string, action: 'expand' | 'collapse') {
  gtag('event', 'section_toggle', {
    event_category: 'engagement',
    section_name: section,
    action,
  });
}

/** User scrolls to a key section (fire once per session) */
const viewedSections = new Set<string>();
export function trackSectionView(section: string) {
  if (viewedSections.has(section)) return;
  viewedSections.add(section);
  gtag('event', 'section_view', {
    event_category: 'engagement',
    section_name: section,
  });
}

/** User views results tab on mobile */
export function trackResultsView() {
  gtag('event', 'results_view', {
    event_category: 'engagement',
  });
}

// ============================================
// FEATURE USAGE
// ============================================

/** User interacts with Monte Carlo simulation */
export function trackMonteCarloView(successRate: number, countryCode: string) {
  gtag('event', 'monte_carlo_view', {
    event_category: 'features',
    success_rate: Math.round(successRate),
    country_code: countryCode,
  });
}

/** User views tax breakdown */
export function trackTaxBreakdownView(countryCode: string, effectiveRate: number) {
  gtag('event', 'tax_breakdown_view', {
    event_category: 'features',
    country_code: countryCode,
    effective_rate: Math.round(effectiveRate * 100),
  });
}

/** User views cost of living comparison */
export function trackCostOfLivingView(fromCountry: string, toCountry: string) {
  gtag('event', 'cost_of_living_view', {
    event_category: 'features',
    from_country: fromCountry,
    to_country: toCountry,
  });
}

/** User interacts with the chart */
export function trackChartInteraction(chartType: string, action: string) {
  gtag('event', 'chart_interaction', {
    event_category: 'features',
    chart_type: chartType,
    action,
  });
}

/** User opens FIRE explainer */
export function trackExplainerView() {
  gtag('event', 'explainer_view', {
    event_category: 'features',
  });
}

/** User adjusts account sliders */
export function trackAccountAdjust(accountType: string, countryCode: string) {
  gtag('event', 'account_adjust', {
    event_category: 'features',
    account_type: accountType,
    country_code: countryCode,
  });
}

/** User toggles pension */
export function trackPensionToggle(enabled: boolean, countryCode: string) {
  gtag('event', 'pension_toggle', {
    event_category: 'features',
    enabled,
    country_code: countryCode,
  });
}

/** User views "If You Retired Today" card */
export function trackRetiredTodayView(annualIncome: number, fireType: string) {
  gtag('event', 'retired_today_view', {
    event_category: 'features',
    annual_income_bucket: getBucket(annualIncome),
    fire_type: fireType,
  });
}

// ============================================
// CONVERSIONS & CTAs
// ============================================

/** User clicks Share button */
export function trackShare(method: string) {
  gtag('event', 'share', {
    event_category: 'conversion',
    method,
  });
}

/** User clicks an affiliate link */
export function trackAffiliateClick(partner: string, placement: string) {
  gtag('event', 'affiliate_click', {
    event_category: 'conversion',
    partner,
    placement,
  });
}

/** User clicks "Try a different destination" */
export function trackTryDifferentDestination() {
  gtag('event', 'try_different_destination', {
    event_category: 'conversion',
  });
}

/** User exports PDF */
export function trackPDFExport(fromCountry: string, toCountry: string) {
  gtag('event', 'pdf_export', {
    event_category: 'conversion',
    from_country: fromCountry,
    to_country: toCountry,
  });
}

/** User clicks the "Customize account types" CTA */
export function trackCustomizeCTA() {
  gtag('event', 'customize_cta_click', {
    event_category: 'conversion',
  });
}

// ============================================
// SEO LANDING PAGES
// ============================================

/** User lands on a country SEO page */
export function trackSEOPageView(countryCode: string, countryName: string) {
  gtag('event', 'seo_page_view', {
    event_category: 'seo',
    country_code: countryCode,
    country_name: countryName,
  });
}

/** User clicks CTA on SEO page to open calculator */
export function trackSEOtoCTA(countryCode: string) {
  gtag('event', 'seo_to_calculator', {
    event_category: 'seo',
    country_code: countryCode,
  });
}

// ============================================
// SESSION QUALITY
// ============================================

/** Track time spent (fire at intervals) */
let sessionStartTime = Date.now();
let timeTracked = false;

export function trackEngagementTime() {
  if (typeof window === 'undefined') return;
  
  const intervals = [30, 60, 120, 300]; // seconds
  
  intervals.forEach(seconds => {
    setTimeout(() => {
      if (!timeTracked || seconds > 30) {
        gtag('event', 'engaged_time', {
          event_category: 'engagement',
          seconds_on_site: seconds,
          time_label: seconds < 60 ? `${seconds}s` : `${seconds / 60}m`,
        });
      }
    }, seconds * 1000);
  });
  
  timeTracked = true;
}

/** Track scroll depth */
let maxScrollDepth = 0;
export function initScrollTracking() {
  if (typeof window === 'undefined') return;

  const thresholds = [25, 50, 75, 100];
  const tracked = new Set<number>();
  
  const handler = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const depth = Math.round((window.scrollY / scrollHeight) * 100);
    
    if (depth > maxScrollDepth) maxScrollDepth = depth;
    
    thresholds.forEach(t => {
      if (depth >= t && !tracked.has(t)) {
        tracked.add(t);
        gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          depth_percent: t,
        });
      }
    });
  };
  
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}

/** Track number of calculations (engagement depth) */
let calculationCount = 0;
export function trackCalculationDepth() {
  calculationCount++;
  if ([1, 3, 5, 10].includes(calculationCount)) {
    gtag('event', 'calculation_depth', {
      event_category: 'engagement',
      total_calculations: calculationCount,
    });
  }
}

// ============================================
// ERROR TRACKING
// ============================================

/** Track errors users encounter */
export function trackError(errorType: string, details?: string) {
  gtag('event', 'app_error', {
    event_category: 'errors',
    error_type: errorType,
    error_details: details?.substring(0, 100),
  });
}

// ============================================
// HELPERS
// ============================================

/** Bucket large numbers to avoid high-cardinality dimensions */
function getBucket(value: number): string {
  if (value < 50000) return '<50K';
  if (value < 100000) return '50K-100K';
  if (value < 250000) return '100K-250K';
  if (value < 500000) return '250K-500K';
  if (value < 1000000) return '500K-1M';
  if (value < 2000000) return '1M-2M';
  if (value < 5000000) return '2M-5M';
  return '5M+';
}
