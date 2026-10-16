/**
 * Format compact du jeu de données envoyé au navigateur (`GET /api/results?annee=`).
 * Orienté colonnes, sans les notes par matière (le relevé de notes est rendu côté serveur),
 * avec un dictionnaire pour les chaînes répétées : un lycée porte sa CISCO et sa province.
 * Environ 6 fois plus léger que le JSON source, avant compression.
 */
import { MENTIONS, PROVINCES, SERIES, STATUTS, type Dataset, type Result } from '$lib/types';

export interface CompactDataset {
	annee: number;
	session: string;
	total: number;
	/** `[lycée, index CISCO, index province]` */
	ecoles: [string, number, number][];
	ciscos: string[];
	/**
	 * Colonnes, une entrée par candidat. Numéros : écarts successifs quand ils sont tous à six
	 * chiffres et croissants (le cas des fichiers générés), sinon les chaînes telles quelles.
	 */
	numero: number[] | string[];
	nom: string[];
	prenoms: string[];
	/** Index dans SERIES, ecoles, STATUTS, ['', ...MENTIONS] */
	serie: number[];
	ecole: number[];
	statut: number[];
	mention: number[];
	/** Moyenne × 100, entière */
	moyenne: number[];
}

const MENTION_KEYS = ['', ...MENTIONS] as const;

function indexer<T>(values: readonly T[]) {
	const map = new Map<T, number>(values.map((v, i) => [v, i]));
	return (v: T) => {
		const i = map.get(v);
		if (i === undefined) throw new Error(`Valeur inconnue : ${String(v)}`);
		return i;
	};
}

export function encodeDataset(ds: Dataset): CompactDataset {
	const ciscos: string[] = [];
	const ciscoIdx = new Map<string, number>();
	const ecoles: [string, number, number][] = [];
	const ecoleIdx = new Map<string, number>();
	const serie = indexer(SERIES);
	const statut = indexer(STATUTS);
	const mention = indexer(MENTION_KEYS);
	const province = indexer(PROVINCES);

	const out: CompactDataset = {
		annee: ds.annee,
		session: ds.session,
		total: ds.total,
		ecoles,
		ciscos,
		numero: [],
		nom: [],
		prenoms: [],
		serie: [],
		ecole: [],
		statut: [],
		mention: [],
		moyenne: []
	};
	for (const r of ds.results) {
		let c = ciscoIdx.get(r.cisco);
		if (c === undefined) ciscoIdx.set(r.cisco, (c = ciscos.push(r.cisco) - 1));
		const key = `${r.ecole}\u0000${r.cisco}\u0000${r.province}`;
		let e = ecoleIdx.get(key);
		if (e === undefined)
			ecoleIdx.set(key, (e = ecoles.push([r.ecole, c, province(r.province)]) - 1));
		out.nom.push(r.nom);
		out.prenoms.push(r.prenoms);
		out.serie.push(serie(r.serie));
		out.ecole.push(e);
		out.statut.push(statut(r.statut));
		out.mention.push(mention(r.mention));
		out.moyenne.push(Math.round(r.moyenne * 100));
	}
	const numeros = ds.results.map((r) => r.numero);
	const ascending = numeros.every(
		(n, i) => /^[1-9]\d{5}$/.test(n) && (i === 0 || Number(n) > Number(numeros[i - 1]))
	);
	out.numero = ascending
		? numeros.map((n, i) => Number(n) - (i ? Number(numeros[i - 1]) : 0))
		: numeros;
	return out;
}

/** Reconstruit les lignes (sans `notes`) à partir du format compact. */
export function decodeDataset(c: CompactDataset): Result[] {
	const rows: Result[] = new Array(c.numero.length);
	let acc = 0;
	for (let i = 0; i < rows.length; i++) {
		const raw = c.numero[i];
		const numero = typeof raw === 'number' ? String((acc += raw)) : raw;
		const [ecole, cisco, province] = c.ecoles[c.ecole[i]];
		rows[i] = {
			id: `${c.annee}-${numero}`,
			numero,
			nom: c.nom[i],
			prenoms: c.prenoms[i],
			serie: SERIES[c.serie[i]],
			province: PROVINCES[province],
			cisco: c.ciscos[cisco],
			ecole,
			statut: STATUTS[c.statut[i]],
			mention: MENTION_KEYS[c.mention[i]],
			moyenne: c.moyenne[i] / 100
		};
	}
	return rows;
}
