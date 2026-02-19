// Affiliate partner configuration
// Replace AFFILIATE_ID placeholders with your actual affiliate IDs after signing up

export interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  commission: string; // for internal reference only
  category: 'banking' | 'insurance' | 'vpn' | 'tax' | 'travel';
  url: string;
  ctaText: string;
  icon: string; // emoji
  features: string[];
  relevantCountries?: string[]; // show only for these countries, or all if undefined
  relevantSections: ('healthcare' | 'col' | 'visa' | 'nextsteps' | 'banking')[];
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'wise',
    name: 'Wise',
    description: 'Send and receive money internationally at the real exchange rate. Multi-currency account with local bank details in 10+ countries. Used by 16M+ people worldwide.',
    shortDescription: 'Transfer money abroad at the real exchange rate',
    commission: '£10/personal, £50/business',
    category: 'banking',
    url: 'https://wise.prf.hn/click/camref:1101l5Dpcd', // USD default
    ctaText: 'Open Free Account',
    icon: '💱',
    features: [
      'Real mid-market exchange rate',
      'Up to 6x cheaper than banks',
      'Multi-currency account',
      'Debit card for 150+ countries',
    ],
    relevantSections: ['col', 'nextsteps', 'banking'],
  },
  {
    id: 'safetywing',
    name: 'SafetyWing',
    description: 'Affordable health insurance designed for nomads and expats. Coverage in 180+ countries starting from $45/month. No long-term commitment required.',
    shortDescription: 'Health insurance for expats from $45/month',
    commission: '10% recurring for 1 year',
    category: 'insurance',
    url: 'https://safetywing.com/?referenceID=26474260&utm_source=26474260&utm_medium=Ambassador',
    ctaText: 'Get a Quote',
    icon: '🛡️',
    features: [
      'Coverage in 180+ countries',
      'From $45/month',
      'No long-term commitment',
      'Includes travel insurance',
    ],
    relevantSections: ['healthcare', 'nextsteps'],
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    description: 'Keep access to your home country banking, streaming, and services from anywhere. Essential for expats who need to access geo-restricted content.',
    shortDescription: 'Access home services from anywhere abroad',
    commission: '$3-6 per sale',
    category: 'vpn',
    url: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=140864', // NordVPN affiliate link
    ctaText: 'Get Protected',
    icon: '🔒',
    features: [
      'Access home banking abroad',
      'Stream content from any country',
      '5,500+ servers in 60 countries',
      'Protect public WiFi connections',
    ],
    relevantSections: ['nextsteps'],
  },
];

// Get partners relevant to a specific section
export function getPartnersForSection(section: AffiliatePartner['relevantSections'][number]): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter(p => p.relevantSections.includes(section));
}

// Get partners relevant to a specific country
export function getPartnersForCountry(countryCode: string): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter(
    p => !p.relevantCountries || p.relevantCountries.includes(countryCode)
  );
}

// Analytics helper - call this when an affiliate link is clicked
export function trackAffiliateClick(partnerId: string, section: string): void {
  // Send to Google Analytics / gtag if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      event_category: 'affiliate',
      event_label: partnerId,
      affiliate_section: section,
    });
  }
}

// Currency-specific Wise tracking links
const WISE_CURRENCY_LINKS: Record<string, string> = {
  EUR: 'https://wise.prf.hn/click/camref:1101l5Dpca',
  USD: 'https://wise.prf.hn/click/camref:1101l5Dpcd',
  JPY: 'https://wise.prf.hn/click/camref:1101l5Dpcc',
  AUD: 'https://wise.prf.hn/click/camref:1101l5Dpc9',
  GBP: 'https://wise.prf.hn/click/camref:1101l5Dpcb',
};

/** Get the best Wise affiliate URL based on user's currency */
export function getWiseUrl(currency?: string): string {
  if (currency && WISE_CURRENCY_LINKS[currency]) {
    return WISE_CURRENCY_LINKS[currency];
  }
  return WISE_CURRENCY_LINKS.USD; // default
}

/** Get affiliate URL - handles currency-specific links for partners like Wise */
export function getAffiliateUrl(partner: AffiliatePartner, currency?: string): string {
  if (partner.id === 'wise') {
    return getWiseUrl(currency);
  }
  return partner.url;
}
