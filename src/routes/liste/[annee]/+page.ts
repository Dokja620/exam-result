import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Meta, Result } from '$lib/types';
import { filtersFromParams } from '$lib/components/table/FilterBar.svelte';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const metaRes = await fetch('/api/results');
	if (!metaRes.ok) throw new Error('Impossible de charger les métadonnées des résultats');
	const meta: Meta = await metaRes.json();

	const annee = Number(params.annee);
	if (!meta.annees.includes(annee)) error(404, `Aucune session ${params.annee}`);

	const n = url.searchParams.get('n')?.trim() || '';
	let candidat: Result | null = null;
	if (n) {
		const r = await fetch(`/api/results?annee=${annee}&n=${encodeURIComponent(n)}`);
		if (r.ok) candidat = await r.json();
	}

	return {
		meta,
		annee,
		candidat,
		q: url.searchParams.get('q') ?? '',
		filters: filtersFromParams(url.searchParams),
		focus: url.searchParams.has('focus')
	};
};
