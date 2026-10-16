import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	compactJson,
	defaultYear,
	findByNumero,
	getMeta,
	listYears,
	search,
	statsOf,
	withoutNotes
} from '$lib/server/data';

/**
 * GET /api/results                         -> métadonnées (années, totaux, empreintes)
 * GET /api/results?annee=2025              -> jeu de données compact de l'année (sans notes)
 * GET /api/results?annee=2025&v=<empreinte> -> idem, URL immuable (cache 1 an)
 * GET /api/results?annee=2025&n=123456     -> un candidat (404 si absent)
 * GET /api/results?annee=2025&search=ra    -> 20 premiers résultats correspondants
 * GET /api/results?annee=2025&stats        -> statistiques de la session
 */
export const GET: RequestHandler = async ({ url, request, setHeaders }) => {
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
		return json(withoutNotes(r));
	}

	if (q) {
		setHeaders({ 'cache-control': 'public, max-age=300' });
		return json(await search(annee, q));
	}

	if (url.searchParams.has('stats')) {
		setHeaders({ 'cache-control': 'public, max-age=3600' });
		return json(await statsOf(annee));
	}

	const c = await compactJson(annee);
	if (!c) return json({ error: 'Jeu de données indisponible' }, { status: 404 });
	const etag = `"${c.version}"`;
	const headers: Record<string, string> = {
		'content-type': 'application/json',
		etag,
		'cache-control':
			url.searchParams.get('v') === c.version
				? 'public, max-age=31536000, immutable'
				: 'public, max-age=3600, stale-while-revalidate=86400'
	};
	if (request.headers.get('if-none-match') === etag) {
		return new Response(null, { status: 304, headers });
	}
	return new Response(c.body, { headers });
};
