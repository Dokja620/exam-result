import type { PageLoad } from './$types';
import type { Meta, Result } from '$lib/types';

export const load: PageLoad = async ({ fetch, url }) => {
	const metaRes = await fetch('/api/results');
	if (!metaRes.ok) throw new Error('Impossible de charger les métadonnées des résultats');
	const meta: Meta = await metaRes.json();

	const anneeParam = Number(url.searchParams.get('annee'));
	const annee = meta.annees.includes(anneeParam) ? anneeParam : meta.annee;

	const n = url.searchParams.get('n')?.trim() || '';
	let candidat: Result | null = null;
	let introuvable = false;
	if (n) {
		const r = await fetch(`/api/results?annee=${annee}&n=${encodeURIComponent(n)}`);
		if (r.ok) candidat = await r.json();
		else introuvable = true;
	}

	return { meta, annee, candidat, numero: n, introuvable };
};
