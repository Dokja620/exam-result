import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	defaultYear,
	findByNumero,
	getMeta,
	loadDataset,
	listYears,
	search
} from '$lib/server/data';

/**
 * GET /api/results                      -> métadonnées (années disponibles, totaux)
 * GET /api/results?annee=2025           -> jeu de données complet de l'année
 * GET /api/results?annee=2025&n=123456  -> un candidat (404 si absent)
 * GET /api/results?annee=2025&search=ra -> 20 premiers résultats correspondants
 */
export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const anneeParam = url.searchParams.get('annee');
	const n = url.searchParams.get('n')?.trim();
	const q = url.searchParams.get('search')?.trim();

	if (!anneeParam && !n && !q) {
		setHeaders({ 'cache-control': 'public, max-age=300' });
		return json(await getMeta());
	}

	const annee = Number(anneeParam ?? defaultYear());
	if (!listYears().includes(annee)) {
		return json({ error: `Année inconnue : ${anneeParam}` }, { status: 404 });
	}

	if (n) {
		const r = await findByNumero(annee, n);
		if (!r) return json({ error: 'Candidat introuvable' }, { status: 404 });
		setHeaders({ 'cache-control': 'public, max-age=3600' });
		return json(r);
	}

	if (q) {
		setHeaders({ 'cache-control': 'public, max-age=300' });
		return json(await search(annee, q));
	}

	const ds = await loadDataset(annee);
	setHeaders({ 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' });
	return json(ds);
};
