import { Metadata } from 'next';
import { countries } from '@/data/countries';

const siteConfig = {
  name: 'Where To FIRE',
  description: 'Compare early retirement across countries. Calculate your FIRE number, compare taxes, cost of living, and visa requirements for retiring abroad.',
  url: 'https://wheretofire.com',
  ogImage: '/og-image.png',
  twitter: '@wheretofire',
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Where To FIRE - Compare Early Retirement Across Countries',
    template: '%s | Where To FIRE',
  },
  description: siteConfig.description,
  keywords: [
    'FIRE calculator',
    'fire number calculator',
    'early retirement',
    'retire abroad',
    'FIRE number',
    'financial independence retire early',
    'financial independence calculator',
    'retire early calculator',
    'fire calculator canada',
    'fire calculator uk',
    'how to calculate fire number',
    'what is my fire number',
    'coast fire calculator',
    'retire early',
    'expat retirement',
    'cost of living comparison',
    'retirement visa',
    'international retirement',
    'tax comparison',
    'Portugal retirement',
    'Spain retirement',
    'Mexico retirement',
    'retire overseas',
    'geographic arbitrage',
    'where to retire',
    'early retirement planning',
    'fire movement',
  ],
  authors: [{ name: 'Where To FIRE' }],
  creator: 'Where To FIRE',
  publisher: 'Where To FIRE',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Where To FIRE - Compare Early Retirement Across Countries',
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Where To FIRE - Early Retirement Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Where To FIRE - Compare Early Retirement Across Countries',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter,
  },
  verification: {
    google: 'hsHG-Wq-tLxisRkfr9QNr_SNPRKBWmuxrVEQqQQyiC0',
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

// Generate dynamic metadata for comparison pages
export function generateComparisonMetadata(
  fromCountry: string,
  toCountry: string
): Metadata {
  const from = countries[fromCountry];
  const to = countries[toCountry];
  
  if (!from || !to) return defaultMetadata;

  const title = `Retire in ${to.name} from ${from.name} - FIRE Calculator`;
  const description = `Compare early retirement in ${to.name} vs ${from.name}. Calculate FIRE numbers, taxes, cost of living, and visa requirements for retiring abroad.`;

  return {
    title,
    description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url: `${siteConfig.url}/?from=${fromCountry}&to=${toCountry}`,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    },
    alternates: {
      canonical: `${siteConfig.url}/?from=${fromCountry}&to=${toCountry}`,
    },
  };
}

// JSON-LD structured data for the calculator
export function generateStructuredData(params?: {
  fromCountry?: string;
  toCountry?: string;
}) {
  const from = params?.fromCountry ? countries[params.fromCountry] : null;
  const to = params?.toCountry ? countries[params.toCountry] : null;

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Where To FIRE Calculator',
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'FIRE number calculation',
      'Tax comparison across countries',
      'Cost of living comparison',
      'Visa requirements information',
      'Retirement timeline projection',
      'Monte Carlo simulation',
      'PDF export',
    ],
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a FIRE number?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your FIRE number is the amount of money you need invested to retire early. It\'s typically calculated as your annual spending divided by your safe withdrawal rate (usually 4%), meaning you need 25x your annual expenses.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does retiring abroad affect my FIRE number?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Retiring abroad can significantly reduce your FIRE number through lower cost of living, favorable tax treatment, and reduced healthcare costs. For example, retiring in Portugal instead of the US could reduce your required savings by 20-40%.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is geographic arbitrage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Geographic arbitrage means earning money in a high-income country while spending it in a lower cost-of-living country. This strategy can accelerate your path to financial independence by reducing expenses while maintaining or growing income.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I collect Social Security while living abroad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, US citizens can generally collect Social Security while living abroad in most countries. However, there are some restrictions for certain countries, and tax implications vary based on tax treaties.',
        },
      },
    ],
  };

  // Add comparison-specific structured data if countries are specified
  if (from && to && from.code !== to.code) {
    return [
      baseStructuredData,
      faqStructuredData,
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Retiring in ${to.name} from ${from.name}: Complete FIRE Guide`,
        description: `Compare early retirement options between ${from.name} and ${to.name}. Includes tax comparison, cost of living, and visa requirements.`,
        author: {
          '@type': 'Organization',
          name: 'Where To FIRE',
        },
      },
    ];
  }

  return [baseStructuredData, faqStructuredData];
}
