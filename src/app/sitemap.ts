import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fireabroad.com';
  
  // Generate comparison URLs for popular routes
  const popularFromCountries = ['US', 'UK', 'CA', 'AU', 'DE'];
  const popularToCountries = ['PT', 'ES', 'MX', 'TH', 'CR', 'PA', 'IT'];
  
  const comparisonUrls: MetadataRoute.Sitemap = [];
  
  for (const from of popularFromCountries) {
    for (const to of popularToCountries) {
      if (from !== to) {
        comparisonUrls.push({
          url: `${baseUrl}/?from=${from}%26to=${to}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...comparisonUrls,
  ];
}
