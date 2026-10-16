/** Minuscules, sans accents, espaces compactés – pour la recherche. */
export function normalize(s: string): string {
	return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
