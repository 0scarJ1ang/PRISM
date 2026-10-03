import type { MetadataRoute } from 'next';
import { getConfig } from '@/lib/config';
import { getSiteUrl } from '@/lib/structuredData';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl(getConfig());

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
