import type { Author, Publication } from '@/types/publication';

// First author, or one of the equal-contribution authors (#) that open the author list.
export function isLeadAuthored(pub: Publication): boolean {
  const me = pub.authors.findIndex((a) => a.isHighlighted);
  if (me === 0) return true;
  return me > 0 && pub.authors.slice(0, me + 1).every((a) => a.isCoAuthor);
}

// The first few authors, then "et al."; the site owner is always kept, and null marks an elided run.
export function shortAuthorList(authors: Author[], max = 8): { shown: (Author | null)[]; etAl: boolean } {
  if (authors.length <= max + 1) return { shown: authors, etAl: false };
  const me = authors.findIndex((a) => a.isHighlighted);
  if (me < max) return { shown: authors.slice(0, max), etAl: true };
  return { shown: [...authors.slice(0, 3), null, authors[me]], etAl: me < authors.length - 1 };
}
