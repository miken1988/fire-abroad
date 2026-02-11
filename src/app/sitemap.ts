import { MetadataRoute } from 'next';

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

  // Comparison URLs for popular routes
  const popularFromCountries = ['US', 'UK', 'CA', 'AU', 'DE', 'IE'];
  const popularToCountries = ['PT', 'ES', 'MX', 'TH', 'CR', 'PA', 'IT', 'GR', 'FR', 'VN', 'MY', 'CO'];
  
  const comparisonUrls: MetadataRoute.Sitemap = [];
  
  for (const from of popularFromCountries) {
    for (const to of popularToCountries) {
      if (from !== to) {
        comparisonUrls.push({
          url: `${baseUrl}/?from=${from}&to=${to}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
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
  ];
}
