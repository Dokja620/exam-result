import { decodeDataset, type CompactDataset } from '$lib/compact';
import type { Result } from '$lib/types';

/** Jeux de données déjà chargés pendant la session de navigation. */
const cache = new Map<number, Result[]>();

/**
 * Chargement côté client du jeu de données compact d'une année (liste). Avec l'empreinte
 * `version` (lue dans les métadonnées), l'URL est immuable : le navigateur la garde un an et
 * le service worker la sert depuis son cache. Le JSON est aussi copié dans le cache hors-ligne
 * (le même que le service worker), utile dès la première visite.
 */
export class YearData {
	// Brut : 3 000+ lignes en lecture seule, inutile de les rendre réactives en profondeur
	rows = $state.raw<Result[]>([]);
	loading = $state(true);
	error = $state('');

	async load(annee: number, version?: string) {
		const hit = cache.get(annee);
		if (hit) {
			this.rows = hit;
			this.loading = false;
			return;
		}
		this.loading = true;
		this.error = '';
		try {
			const url = `/api/results?annee=${annee}${version ? `&v=${version}` : ''}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			if ('caches' in window) {
				caches
					.open('results-data-v2')
					.then((c) => c.put(url, res.clone()))
					.catch(() => undefined);
			}
			const rows = decodeDataset((await res.json()) as CompactDataset);
			cache.set(annee, rows);
			this.rows = rows;
		} catch (e) {
			this.error = 'Vérifiez votre connexion puis réessayez.';
			console.error(e);
		} finally {
			this.loading = false;
		}
	}
}
