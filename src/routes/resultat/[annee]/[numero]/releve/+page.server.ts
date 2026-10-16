import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findByNumero, listYears, loadDataset, notesOf, withoutNotes } from '$lib/server/data';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const annee = Number(params.annee);
	if (!listYears().includes(annee)) error(404, `Aucune session ${params.annee}`);
	const result = await findByNumero(annee, params.numero);
	if (!result) error(404, { message: 'introuvable' });
	const notes = await notesOf(annee, result);
	if (!notes.length) error(404, { message: 'Relevé de notes indisponible' });
	const ds = await loadDataset(annee);
	setHeaders({ 'cache-control': 'public, max-age=300' });
	return { annee, session: ds?.session ?? `Session ${annee}`, result: withoutNotes(result), notes };
};
