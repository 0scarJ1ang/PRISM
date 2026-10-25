import type { Publication } from '@/types/publication';

// A preprint server is not a venue, so preprints are shown without a venue year.
export function formatVenue(pub: Publication): string {
  const venue = (pub.venue || pub.journal || pub.conference || '').trim();
  return /^arxiv$/i.test(venue) ? venue : `${venue} ${pub.year}`.trim();
}
