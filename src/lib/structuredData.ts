import type { SiteConfig } from '@/lib/config';
import type { Publication } from '@/types/publication';

type JsonLdNode = Record<string, unknown>;

export function getSiteUrl(config: SiteConfig): string | undefined {
  return config.site.url?.replace(/\/+$/, '') || undefined;
}

function absoluteUrl(siteUrl: string, path: string): string {
  return new URL(path, `${siteUrl}/`).href;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}]/gu, '');
}

// Drop empty fields so the output only states what the site actually knows.
function compact(node: JsonLdNode): JsonLdNode {
  return Object.fromEntries(
    Object.entries(node).filter(
      ([, value]) => value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
    )
  );
}

// Only links to a specific profile identify the person; bare placeholder domains are skipped.
export function getProfileLinks(social: SiteConfig['social']): string[] {
  return Object.entries(social).flatMap(([key, value]) => {
    if (key === 'location_url' || typeof value !== 'string' || !/^https?:\/\//.test(value)) {
      return [];
    }
    const url = new URL(value);
    return url.pathname.replace(/\/+$/, '') || url.search ? [value] : [];
  });
}

function buildPerson(config: SiteConfig, siteUrl: string): JsonLdNode {
  const { author, seo } = config;

  return compact({
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: author.name,
    alternateName: seo?.alternate_names,
    url: `${siteUrl}/`,
    image: author.avatar ? absoluteUrl(siteUrl, author.avatar) : undefined,
    jobTitle: author.title,
    description: config.site.description,
    affiliation: author.institution ? { '@type': 'CollegeOrUniversity', name: author.institution } : undefined,
    alumniOf: seo?.alumni_of?.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    knowsAbout: seo?.knows_about,
    sameAs: getProfileLinks(config.social),
  });
}

function buildArticle(pub: Publication, config: SiteConfig, siteUrl: string): JsonLdNode {
  const ownerNames = new Set([config.author.name, ...(config.seo?.alternate_names ?? [])].map(normalizeName));
  const arxivUrl = pub.arxivId ? `https://arxiv.org/abs/${pub.arxivId}` : undefined;
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : undefined;
  const url = pub.url || arxivUrl || doiUrl;
  const month = Number.parseInt(pub.month ?? '', 10);
  const venue = pub.conference || pub.journal;

  return compact({
    '@type': 'ScholarlyArticle',
    '@id': `${siteUrl}/publications/#${pub.id}`,
    headline: pub.title,
    name: pub.title,
    author: pub.authors.map((author) =>
      author.isHighlighted || ownerNames.has(normalizeName(author.name))
        ? { '@id': `${siteUrl}/#person` }
        : { '@type': 'Person', name: author.name }
    ),
    datePublished: month >= 1 && month <= 12 ? `${pub.year}-${String(month).padStart(2, '0')}` : String(pub.year),
    isPartOf: venue && !/^arxiv/i.test(venue) ? { '@type': 'CreativeWork', name: venue } : undefined,
    abstract: pub.abstract,
    description: pub.description,
    keywords: pub.keywords?.join(', '),
    image: pub.preview ? absoluteUrl(siteUrl, `/papers/${pub.preview}`) : undefined,
    url,
    sameAs: [arxivUrl, doiUrl].filter((link) => link && link !== url),
  });
}

interface PageJsonLdOptions {
  path: string;
  type: 'ProfilePage' | 'CollectionPage' | 'WebPage';
  name: string;
  publications?: Publication[];
}

export function buildPageJsonLd(
  config: SiteConfig,
  { path, type, name, publications = [] }: PageJsonLdOptions
): JsonLdNode | null {
  const siteUrl = getSiteUrl(config);
  if (!siteUrl) {
    return null;
  }

  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const pageUrl = absoluteUrl(siteUrl, path);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: config.site.title,
        author: { '@id': personId },
      },
      buildPerson(config, siteUrl),
      compact({
        '@type': type,
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        isPartOf: { '@id': websiteId },
        mainEntity: type === 'ProfilePage' ? { '@id': personId } : undefined,
        about: type === 'ProfilePage' ? undefined : { '@id': personId },
      }),
      ...publications.map((pub) => buildArticle(pub, config, siteUrl)),
    ],
  };
}
