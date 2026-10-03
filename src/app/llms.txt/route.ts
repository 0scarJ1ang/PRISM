import { getConfig } from '@/lib/config';
import { getBibtexContent, getMarkdownContent, getPageConfig, getTomlContent } from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import { getProfileLinks, getSiteUrl } from '@/lib/structuredData';
import type { BasePageConfig, CardPageConfig, PublicationPageConfig, ResearchTheme, TextPageConfig } from '@/types/page';
import type { Publication } from '@/types/publication';

// Plain-text summary of the site for AI assistants (https://llmstxt.org), built from the same content files as the pages.
export const dynamic = 'force-static';

interface AboutSection {
  type: string;
  title?: string;
  source?: string;
  themes?: ResearchTheme[];
}

// Nest a markdown document's headings under the section heading it is placed in.
function demoteHeadings(markdown: string): string {
  return markdown.trim().replace(/^(#+) /gm, '#$1 ');
}

function formatPublication(pub: Publication): string {
  const authors = pub.authors.map((author) => `${author.name}${author.isCoAuthor ? '*' : ''}`).join(', ');
  const venue = [pub.venue || pub.conference || pub.journal, pub.year].filter(Boolean).join(' ');
  const links = [
    pub.url && `[Website](${pub.url})`,
    pub.arxivId && `[arXiv](https://arxiv.org/abs/${pub.arxivId})`,
    pub.doi && `[DOI](https://doi.org/${pub.doi})`,
    pub.code && `[Code](${pub.code})`,
  ].filter(Boolean);

  return [
    `### ${pub.title}`,
    `${authors}. ${venue}${pub.presentation ? ` (${pub.presentation})` : ''}.`,
    pub.description,
    links.length > 0 ? `Links: ${links.join(', ')}` : '',
    pub.abstract ? `Abstract: ${pub.abstract}` : '',
  ].filter(Boolean).join('\n\n');
}

function formatAboutSections(sections: AboutSection[]): string[] {
  return sections.flatMap((section) => {
    if (section.type === 'markdown' && section.source) {
      const themes = (section.themes ?? []).map((theme) =>
        `- **${theme.title}**: ${theme.description ?? ''}${theme.link ? ` Related work: ${theme.link}` : ''}`
      );
      return [`## ${section.title}`, getMarkdownContent(section.source).trim(), ...(themes.length > 0 ? [themes.join('\n')] : [])];
    }
    if (section.type === 'list' && section.source) {
      const news = getTomlContent<{ news: Array<{ date: string; content: string }> }>(section.source)?.news ?? [];
      return news.length > 0 ? [`## ${section.title}`, news.map((item) => `- ${item.date}: ${item.content}`).join('\n')] : [];
    }
    // Selected publications are covered in full by the publications page.
    return [];
  });
}

function formatPage(target: string): string[] {
  const pageConfig = getPageConfig(target) as (BasePageConfig & { sections?: AboutSection[] }) | null;
  if (!pageConfig) {
    return [];
  }

  if (pageConfig.type === 'about' || pageConfig.sections) {
    return formatAboutSections(pageConfig.sections ?? []);
  }

  if (pageConfig.type === 'publication') {
    const publications = parseBibTeX(getBibtexContent((pageConfig as PublicationPageConfig).source));
    const hasEqualContribution = publications.some((pub) => pub.authors.some((author) => author.isCoAuthor));
    return [
      `## ${pageConfig.title}`,
      ...(hasEqualContribution ? ['Authors marked with * contributed equally.'] : []),
      ...publications.map(formatPublication),
    ];
  }

  if (pageConfig.type === 'card') {
    const items = (pageConfig as CardPageConfig).items.map((item) => {
      const meta = [item.subtitle, item.date].filter(Boolean).join(', ');
      return `- **${item.title}**${meta ? `: ${meta}.` : ''}${item.content ? ` ${item.content}` : ''}`;
    });
    return [`## ${pageConfig.title}`, ...(pageConfig.description ? [pageConfig.description] : []), items.join('\n')];
  }

  if (pageConfig.type === 'text') {
    return [`## ${pageConfig.title}`, demoteHeadings(getMarkdownContent((pageConfig as TextPageConfig).source))];
  }

  return [];
}

export function GET() {
  const config = getConfig();
  const siteUrl = getSiteUrl(config) ?? '';
  const pages = config.navigation.filter((nav) => nav.type === 'page');
  const profileLinks = getProfileLinks(config.social);

  const facts = [
    config.seo?.alternate_names?.length && `- Also known as: ${config.seo.alternate_names.join(', ')}`,
    `- Position: ${[config.author.title, config.author.institution].filter(Boolean).join(', ')}`,
    config.social.location && `- Location: ${config.social.location}`,
    config.seo?.knows_about?.length && `- Research topics: ${config.seo.knows_about.join(', ')}`,
    config.social.email && `- Contact: ${config.social.email.replace('@', ' (at) ')}`,
    profileLinks.length > 0 && `- Profiles: ${profileLinks.join(', ')}`,
  ].filter(Boolean);

  const blocks = [
    `# ${config.author.name}`,
    `> ${config.site.description}`,
    facts.join('\n'),
    '## Pages',
    pages.map((nav) => `- [${nav.title}](${siteUrl}${nav.target === 'about' ? '/' : `/${nav.target}/`})`).join('\n'),
    ...pages.flatMap((nav) => formatPage(nav.target)),
  ];

  return new Response(`${blocks.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
