import type { MetadataRoute } from 'next';
import { getConfig } from '@/lib/config';
import { getSiteUrl } from '@/lib/structuredData';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig();
  const siteUrl = getSiteUrl(config);
  if (!siteUrl) {
    return [];
  }

  const lastModified = new Date();
  const paths = [
    '/',
    ...config.navigation
      .filter((nav) => nav.type === 'page' && nav.target !== 'about')
      .map((nav) => `/${nav.target}/`),
  ];

  return paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified }));
}
