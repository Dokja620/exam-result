/**
 * Accès aux données côté serveur. Les fichiers `src/lib/data/<annee>.json`
 * sont découpés en chunks séparés par Vite et chargés à la demande.
 */
import type { Dataset, Meta, Result } from '$lib/types';
import { normalize } from '$lib/utils/normalize';

const loaders = import.meta.glob<{ default: Dataset }>('$lib/data/*.json');

const years: number[] = Object.keys(loaders)
	.map((p) => Number(p.match(/(\d{4})\.json$/)?.[1]))
	.filter((y) => !Number.isNaN(y))
	.sort((a, b) => b - a);

const cache = new Map<number, Promise<Dataset>>();

export function listYears(): number[] {
	return years;
}

export function defaultYear(): number {
	return years[0];
}

export async function loadDataset(annee: number): Promise<Dataset | null> {
	const key = Object.keys(loaders).find((p) => p.endsWith(`/${annee}.json`));
	if (!key) return null;
	let p = cache.get(annee);
	if (!p) {
		p = loaders[key]().then((m) => m.default);
		cache.set(annee, p);
	}
	return p;
}

export async function getMeta(): Promise<Meta> {
	const totaux: Record<string, number> = {};
	for (const y of years) {
		const ds = await loadDataset(y);
		if (ds) totaux[String(y)] = ds.total;
	}
	return { annees: years, annee: defaultYear(), totaux };
}

export async function findByNumero(annee: number, numero: string): Promise<Result | null> {
	const ds = await loadDataset(annee);
	if (!ds) return null;
	const n = numero.trim();
	return ds.results.find((r) => r.numero === n) ?? null;
}

export async function search(annee: number, q: string, limit = 20): Promise<Result[]> {
	const ds = await loadDataset(annee);
	if (!ds) return [];
	const needle = normalize(q);
	if (!needle) return ds.results.slice(0, limit);
	const out: Result[] = [];
	for (const r of ds.results) {
		if (r.numero.includes(needle) || normalize(`${r.nom} ${r.prenoms}`).includes(needle)) {
			out.push(r);
			if (out.length >= limit) break;
		}
	}
	return out;
}
