import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listYears, loadDataset, withoutNotes } from '$lib/server/data';
import { statsParEcole } from '$lib/stats';

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	const annee = Number(params.annee);
	const ds = await loadDataset(annee);
	if (!ds) error(404, `Aucune session ${params.annee}`);

	const ecoles = statsParEcole(ds.results);
	const ecole = url.searchParams.get('ecole') ?? '';
	const fiche = ecoles.find((e) => e.label === ecole) ?? null;
	const admis = fiche
		? ds.results
				.filter((r) => r.ecole === ecole && r.statut === 'admis')
				.sort((a, b) => b.moyenne - a.moyenne)
				.map(withoutNotes)
		: [];

	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return { annee, annees: listYears(), ecoles, fiche, admis };
};
