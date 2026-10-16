/**
 * Accès aux données côté serveur. Les fichiers `src/lib/data/<annee>.json`
 * sont découpés en chunks séparés par Vite et chargés à la demande.
 */
import type { Dataset, Examples, Meta, Note, Result } from '$lib/types';
import { normalize } from '$lib/utils/normalize';
import { encodeDataset } from '$lib/compact';
import { computeStats } from '$lib/stats';

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
	const examples: Record<string, Examples> = {};
	for (const y of years) {
		const ds = await loadDataset(y);
		if (!ds) continue;
		totaux[String(y)] = ds.total;
		if (ds.examples) examples[String(y)] = ds.examples;
	}
	const versions: Record<string, string> = {};
	for (const y of years) {
		const c = await compactJson(y);
		if (c) versions[String(y)] = c.version;
	}
	return { annees: years, annee: defaultYear(), totaux, examples, versions };
}

/** FNV-1a 32 bits, en base 36 : empreinte courte et stable d'un texte. */
function fingerprint(text: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

const compactCache = new Map<number, Promise<{ body: string; version: string } | null>>();

/**
 * Jeu de données compact (sans notes) déjà sérialisé, avec son empreinte : sert d'ETag et de
 * paramètre `v` pour une URL immuable.
 */
export function compactJson(annee: number): Promise<{ body: string; version: string } | null> {
	let p = compactCache.get(annee);
	if (!p) {
		p = loadDataset(annee).then((ds) => {
			if (!ds) return null;
			const body = JSON.stringify(encodeDataset(ds));
			return { body, version: fingerprint(body) };
		});
		compactCache.set(annee, p);
	}
	return p;
}

const statsCache = new Map<number, Promise<ReturnType<typeof computeStats> | null>>();

/** Statistiques de la session (accueil), calculées une fois par année. */
export function statsOf(annee: number) {
	let p = statsCache.get(annee);
	if (!p) {
		p = loadDataset(annee).then((ds) => (ds ? computeStats(ds.results) : null));
		statsCache.set(annee, p);
	}
	return p;
}

/** Candidat sans ses notes par matière (elles ne servent qu'au relevé de notes). */
export function withoutNotes(r: Result): Result {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { notes, ...rest } = r;
	return rest;
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
	if (!needle) return ds.results.slice(0, limit).map(withoutNotes);
	const out: Result[] = [];
	for (const r of ds.results) {
		if (r.numero.includes(needle) || normalize(`${r.nom} ${r.prenoms}`).includes(needle)) {
			out.push(withoutNotes(r));
			if (out.length >= limit) break;
		}
	}
	return out;
}

/** Notes du candidat associées à leurs matières et coefficients (relevé de notes). */
export async function notesOf(annee: number, r: Result): Promise<Note[]> {
	const ds = await loadDataset(annee);
	const mats = ds?.matieres?.[r.serie] ?? [];
	const notes = r.notes;
	if (!notes || notes.length !== mats.length) return [];
	return mats.map(([matiere, coef], i) => ({ matiere, coef, note: notes[i] }));
}
