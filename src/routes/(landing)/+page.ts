import type { PageLoad } from './$types';
import type { Meta, Result } from '$lib/types';
import type { SessionStats } from '$lib/stats';

export const load: PageLoad = async ({ fetch, url }) => {
	const metaRes = await fetch('/api/results');
	if (!metaRes.ok) throw new Error('Impossible de charger les métadonnées des résultats');
	const meta: Meta = await metaRes.json();

	const anneeParam = Number(url.searchParams.get('annee'));
	const annee = meta.annees.includes(anneeParam) ? anneeParam : meta.annee;

	// Chiffres de la session calculés côté serveur : l'accueil ne télécharge jamais le jeu de
	// données complet (la vérification d'un numéro passe par `?n=`).
	const n = url.searchParams.get('n')?.trim() || '';
	const [statsRes, candidatRes] = await Promise.all([
		fetch(`/api/results?annee=${annee}&stats`),
		n ? fetch(`/api/results?annee=${annee}&n=${encodeURIComponent(n)}`) : null
	]);
	const stats: SessionStats | null = statsRes.ok ? await statsRes.json() : null;
	let candidat: Result | null = null;
	let introuvable = false;
	if (candidatRes) {
		if (candidatRes.ok) candidat = await candidatRes.json();
		else introuvable = true;
	}

	return { meta, annee, stats, candidat, numero: n, introuvable };
};
