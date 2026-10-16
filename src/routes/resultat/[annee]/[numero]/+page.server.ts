import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findByNumero, listYears } from '$lib/server/data';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const annee = Number(params.annee);
	if (!listYears().includes(annee)) error(404, `Aucune session ${params.annee}`);
	const result = await findByNumero(annee, params.numero);
	if (!result) error(404, { message: 'introuvable' });
	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return { annee, result, annees: listYears() };
};
