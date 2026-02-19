import { MetadataRoute } from 'next';

const slugToCode: Record<string, string> = {
  'portugal': 'PT', 'spain': 'ES', 'mexico': 'MX', 'thailand': 'TH',
  'costa-rica': 'CR', 'italy': 'IT', 'greece': 'GR', 'france': 'FR',
  'germany': 'DE', 'netherlands': 'NL', 'ireland': 'IE', 'uk': 'UK',
  'canada': 'CA', 'australia': 'AU', 'japan': 'JP', 'new-zealand': 'NZ',
  'colombia': 'CO', 'panama': 'PA', 'malaysia': 'MY', 'vietnam': 'VN',
  'switzerland': 'CH', 'uae': 'AE', 'singapore': 'SG', 'united-states': 'US',
  'south-korea': 'KR', 'indonesia': 'ID',
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wheretofire.com';
  
  // Country landing pages
  const countryPages = [
    'portugal', 'spain', 'mexico', 'thailand', 'costa-rica', 'italy', 'greece',
    'france', 'germany', 'netherlands', 'ireland', 'uk', 'canada', 'australia',
    'japan', 'new-zealand', 'colombia', 'panama', 'malaysia', 'vietnam',
    'switzerland', 'uae', 'singapore', 'united-states',
  ];

  const countryUrls: MetadataRoute.Sitemap = countryPages.map(country => ({
    url: `${baseUrl}/retire-in/${country}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Comparison pages
  const fromCountries = ['us', 'uk', 'canada', 'australia', 'ireland', 'germany'];
  const toCountries = [
    'portugal', 'spain', 'mexico', 'thailand', 'costa-rica', 'italy', 'greece',
    'france', 'netherlands', 'japan', 'new-zealand', 'colombia', 'panama',
    'malaysia', 'vietnam', 'switzerland', 'uae', 'singapore', 'south-korea', 'indonesia',
  ];

  const comparisonUrls: MetadataRoute.Sitemap = [];
  for (const from of fromCountries) {
    for (const to of toCountries) {
      const fromCode = slugToCode[from];
      const toCode = slugToCode[to];
      if (fromCode && toCode && fromCode !== toCode) {
        comparisonUrls.push({
          url: `${baseUrl}/compare/${from}-vs-${to}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      }
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/best-countries-to-retire-early-2026`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...countryUrls,
    ...comparisonUrls,
  ];
}
