import type { Dataset, Result } from '$lib/types';

/** Jeux de données déjà chargés, partagés entre l'accueil et la liste. */
const cache = new Map<number, Result[]>();

/**
 * Chargement côté client du jeu de données d'une année. Le JSON est aussi copié dans le
 * cache hors-ligne (le même que le service worker), utile dès la première visite.
 */
export class YearData {
	rows = $state<Result[]>([]);
	loading = $state(true);
	error = $state('');

	async load(annee: number) {
		const hit = cache.get(annee);
		if (hit) {
			this.rows = hit;
			this.loading = false;
			return;
		}
		this.loading = true;
		this.error = '';
		try {
			const url = `/api/results?annee=${annee}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			if ('caches' in window) {
				caches
					.open('results-data-v1')
					.then((c) => c.put(url, res.clone()))
					.catch(() => undefined);
			}
			const ds: Dataset = await res.json();
			cache.set(annee, ds.results);
			this.rows = ds.results;
		} catch (e) {
			this.error = 'Vérifiez votre connexion puis réessayez.';
			console.error(e);
		} finally {
			this.loading = false;
		}
	}
}
