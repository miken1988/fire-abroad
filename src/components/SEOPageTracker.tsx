'use client';

import { useEffect } from 'react';
import { trackSEOPageView } from '@/lib/analytics';

export function SEOPageTracker({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  useEffect(() => {
    trackSEOPageView(countryCode, countryName);
  }, [countryCode, countryName]);

  return null;
}

export function BlogPageTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'blog_page_view', {
        event_category: 'seo',
        blog_slug: slug,
      });
    }
  }, [slug]);

  return null;
}
