/**
 * Générateur de données de démonstration (reproductible).
 *
 *   bun run scripts/generate-data.ts            # régénère 2024 et 2025
 *   bun run scripts/generate-data.ts 2025 3000  # une année, N candidats
 *
 * Sortie : src/lib/data/<annee>.json  (schéma documenté dans README.md)
 * Le PRNG est seedé par l'année : même commande => même fichier.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dataset, Examples, Matiere, Result, Serie, Statut, Mention } from '../src/lib/types';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/lib/data');

// ---------- PRNG (mulberry32) ----------
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// ---------- Référentiels ----------
const NOMS = [
	'RAKOTO',
	'RABE',
	'RANDRIA',
	'RAZAFY',
	'RASOA',
	'ANDRIANARIVO',
	'RAKOTOARIVAO',
	'RAZAFINDRAKOTO',
	'RANDRIANARISOA',
	'RAJAONARISON',
	'RAVELOMANANA',
	'RAHARISON',
	'ANDRIAMAHEFA',
	'RAFARALAHY',
	'RASOLOFO',
	'RAKOTONDRABE',
	'RAMANANTSOA',
	'RANAIVOSON',
	'RAZANAKOLONA',
	'ANDRIANTSOA',
	'RAZAFIMAHATRATRA',
	'RABEMANANJARA',
	'RAKOTOMALALA',
	'RANDRIAMANANA',
	'RAHARIMALALA',
	'RAJOELINA',
	'RAVALOMANANA',
	'RATSIRAKA',
	'RAMIANDRISOA',
	'RANDRIANASOLO',
	'RAFANOMEZANTSOA',
	'TSIMANOVA',
	'SOLOFONIAINA',
	'MAHATANA',
	'FANOMEZANA',
	'VELONJARA',
	'BOTO',
	'JAOFERA',
	'MANANJARA',
	'TOVONDRAINY',
	'ZAFIMAHOVA',
	'SAID',
	'ABDALLAH',
	'KOTOZAFY',
	'FIDISON',
	'LAHIMENA',
	'NOMENJANAHARY',
	'ANDRIANJAFY',
	'RAZAFINDRAIBE',
	'RAKOTOSON',
	'RAVONINJATOVO'
];
const PRENOMS = [
	'Fenitra',
	'Nomena',
	'Tsiry',
	'Mialy',
	'Hery',
	'Tojo',
	'Faniry',
	'Aina',
	'Miora',
	'Lova',
	'Tahina',
	'Haja',
	'Mamy',
	'Fitiavana',
	'Finaritra',
	'Toky',
	'Ando',
	'Nirina',
	'Sitraka',
	'Tiana',
	'Hanitra',
	'Voahirana',
	'Lalaina',
	'Mahefa',
	'Rado',
	'Onja',
	'Santatra',
	'Fanja',
	'Herizo',
	'Lanto',
	'Zo',
	'Mendrika',
	'Ny Aina',
	'Iarivo',
	'Tsanta',
	'Koloina',
	'Safidy',
	'Antsa',
	'Mirado',
	'Ony',
	'Jean',
	'Marie',
	'Nirintsoa',
	'Fara',
	'Vola',
	'Feno',
	'Rija',
	'Niaina',
	'Tovo',
	'Manoa',
	'Sariaka',
	'Anjara',
	'Harena',
	'Soa',
	'Mamitiana',
	'Tsiory',
	'Hasina',
	'Ravaka',
	'Ialy',
	'Miantsa'
];

const SERIES: { s: Serie; w: number }[] = [
	{ s: 'D', w: 34 },
	{ s: 'A2', w: 24 },
	{ s: 'A1', w: 8 },
	{ s: 'C', w: 10 },
	{ s: 'L', w: 8 },
	{ s: 'S', w: 6 },
	{ s: 'OSE', w: 5 },
	{ s: 'G', w: 5 }
];

const PROVINCES: Record<string, { w: number; cisco: Record<string, string[]> }> = {
	Antananarivo: {
		w: 38,
		cisco: {
			'Antananarivo Renivohitra': [
				'Lycée Moderne Ampefiloha',
				'Lycée Jules Ferry Faravohitra',
				'Lycée Privé Saint-Michel Amparibe',
				'Lycée Andohalo',
				'Collège Saint-François-Xavier'
			],
			'Antananarivo Atsimondrano': [
				'Lycée Tanjombato',
				'Lycée Privé Les Lauréats',
				'Lycée Ampitatafika'
			],
			Antsirabe: ['Lycée André Resampa', 'Lycée Privé Sainte-Thérèse', 'Lycée Technique Antsirabe'],
			Miarinarivo: ['Lycée Miarinarivo', 'Lycée Privé FJKM Miarinarivo'],
			Tsiroanomandidy: ['Lycée Tsiroanomandidy', 'Lycée Privé Avotra'],
			Ankazobe: ['Lycée Ankazobe']
		}
	},
	Toamasina: {
		w: 16,
		cisco: {
			Toamasina: [
				'Lycée Jacques Rabemananjara',
				'Lycée Privé Sainte-Famille',
				'Lycée Technique Toamasina'
			],
			Moramanga: ['Lycée Moramanga', 'Lycée Privé Mahatsinjo'],
			Ambatondrazaka: ['Lycée Ambatondrazaka', 'Lycée Privé FJKM Ambatondrazaka'],
			Maroantsetra: ['Lycée Maroantsetra']
		}
	},
	Fianarantsoa: {
		w: 15,
		cisco: {
			Fianarantsoa: [
				'Lycée Raherivelo Ramamonjy',
				'Lycée Privé Saint-Joseph',
				'Lycée Technique Fianarantsoa'
			],
			Mananjary: ['Lycée Mananjary', 'Lycée Privé Mananjary'],
			Ikalamavony: ['Lycée Ikalamavony'],
			Manakara: ['Lycée Manakara', 'Lycée Privé Sainte-Marie Manakara']
		}
	},
	Mahajanga: {
		w: 11,
		cisco: {
			Mahajanga: [
				'Lycée Philibert Tsiranana',
				'Lycée Privé Notre-Dame Mahajanga',
				'Lycée Technique Mahajanga'
			],
			Marovoay: ['Lycée Marovoay'],
			Maevatanana: ['Lycée Maevatanana']
		}
	},
	Toliara: {
		w: 11,
		cisco: {
			Toliara: [
				'Lycée Antanimena Toliara',
				'Lycée Privé Saint-Augustin',
				'Lycée Technique Toliara'
			],
			Morondava: ['Lycée Morondava'],
			Taolagnaro: ['Lycée Taolagnaro', 'Lycée Privé Fort-Dauphin']
		}
	},
	Antsiranana: {
		w: 9,
		cisco: {
			Antsiranana: ['Lycée Mixte Antsiranana', 'Lycée Privé Saint-Paul Antsiranana'],
			Ambanja: ['Lycée Ambanja'],
			'Nosy Be': ['Lycée Nosy Be', 'Lycée Privé Les Cocotiers']
		}
	}
};

// Matières et coefficients par série (inspirés du BAC malgache). EPS (coef. 1) est présente
// partout : c'est elle qui absorbe le dernier ajustement au quart de point.
const MATIERES: Record<Serie, Matiere[]> = {
	A1: [
		['Philosophie', 4],
		['Français', 3],
		['Malagasy', 3],
		['Anglais', 2],
		['Histoire-Géographie', 3],
		['Mathématiques', 3],
		['SVT', 2],
		['EPS', 1]
	],
	A2: [
		['Philosophie', 4],
		['Français', 4],
		['Malagasy', 4],
		['Anglais', 3],
		['Histoire-Géographie', 3],
		['Mathématiques', 1],
		['SVT', 2],
		['EPS', 1]
	],
	L: [
		['Philosophie', 4],
		['Français', 4],
		['Malagasy', 3],
		['Anglais', 3],
		['Langue vivante 2', 2],
		['Histoire-Géographie', 3],
		['Mathématiques', 1],
		['EPS', 1]
	],
	C: [
		['Mathématiques', 5],
		['Physique-Chimie', 5],
		['SVT', 2],
		['Français', 2],
		['Malagasy', 2],
		['Anglais', 2],
		['Philosophie', 2],
		['Histoire-Géographie', 2],
		['EPS', 1]
	],
	D: [
		['Mathématiques', 4],
		['SVT', 4],
		['Physique-Chimie', 4],
		['Français', 2],
		['Malagasy', 2],
		['Anglais', 2],
		['Philosophie', 2],
		['Histoire-Géographie', 2],
		['EPS', 1]
	],
	S: [
		['Mathématiques', 4],
		['Physique-Chimie', 4],
		['Technologie', 3],
		['SVT', 2],
		['Français', 2],
		['Malagasy', 2],
		['Anglais', 2],
		['Philosophie', 2],
		['EPS', 1]
	],
	OSE: [
		['Économie', 5],
		['Gestion', 4],
		['Mathématiques', 3],
		['Histoire-Géographie', 2],
		['Français', 2],
		['Malagasy', 2],
		['Anglais', 2],
		['Philosophie', 2],
		['EPS', 1]
	],
	G: [
		['Comptabilité', 5],
		['Gestion', 4],
		['Économie', 3],
		['Droit', 2],
		['Mathématiques', 2],
		['Français', 2],
		['Malagasy', 2],
		['Anglais', 2],
		['EPS', 1]
	]
};

// ---------- Helpers ----------
function pick<T>(rnd: () => number, arr: readonly T[]): T {
	return arr[Math.floor(rnd() * arr.length)];
}
function weighted<T>(rnd: () => number, items: { v: T; w: number }[]): T {
	const total = items.reduce((a, b) => a + b.w, 0);
	let r = rnd() * total;
	for (const it of items) {
		r -= it.w;
		if (r <= 0) return it.v;
	}
	return items[items.length - 1].v;
}
const round2 = (n: number) => Math.round(n * 100) / 100;

function mentionFor(moyenne: number): Mention {
	if (moyenne >= 16) return 'très bien';
	if (moyenne >= 14) return 'bien';
	if (moyenne >= 12) return 'assez bien';
	return 'passable';
}

const quarter = (n: number) => Math.round(n * 4) / 4;
const clamp20 = (n: number) => Math.min(20, Math.max(0, n));

/**
 * Notes par matière (au quart de point) dont la moyenne pondérée retombe sur `moyenne`
 * (écart ≤ 0,125 / Σcoef, soit < 0,01). PRNG propre au candidat : les autres champs du jeu
 * de données restent identiques à ceux générés sans notes.
 */
function notesFor(annee: number, numero: string, serie: Serie, moyenne: number): number[] {
	const rnd = mulberry32(annee * 1_000_003 + Number(numero));
	const mats = MATIERES[serie];
	const total = mats.reduce((a, [, c]) => a + c, 0);
	const target = moyenne * total;
	// Profil : un point fort et un point faible par candidat, plus du bruit
	const fort = Math.floor(rnd() * mats.length);
	const faible = (fort + 1 + Math.floor(rnd() * (mats.length - 1))) % mats.length;
	const notes = mats.map((_, i) => {
		const bias = i === fort ? 2.5 : i === faible ? -2.5 : 0;
		const noise = (rnd() + rnd() + rnd() - 1.5) * 3.2;
		return quarter(clamp20(moyenne + bias + noise));
	});
	const eps = mats.findIndex(([m]) => m === 'EPS');
	// EPS part de la moyenne : loin des bornes, elle pourra absorber le reste
	notes[eps] = quarter(clamp20(moyenne + (rnd() - 0.5) * 2));
	const points = () => notes.reduce((a, n, i) => a + n * mats[i][1], 0);
	// On répartit l'écart sur les autres matières, puis EPS (coef. 1) finit au quart de point
	for (let pass = 0; pass < 60; pass++) {
		const r = target - points();
		if (Math.abs(r) <= 1) break;
		const i = pass % mats.length;
		if (i === eps) continue;
		const c = mats[i][1];
		notes[i] = quarter(clamp20(notes[i] + (Math.abs(r) > 2 * c ? r / c / 2 : r / c)));
	}
	notes[eps] = quarter(clamp20(notes[eps] + (target - points())));
	const err = Math.abs(points() / total - moyenne);
	if (err > 0.01) throw new Error(`notes incohérentes ${annee}-${numero} (${err})`);
	return notes;
}

/** Premier candidat (par numéro) de chaque issue : numéros de test affichés sur l'accueil. */
function examplesFor(results: Result[]): Examples {
	const find = (ok: (r: Result) => boolean) => results.find(ok)?.numero ?? '';
	return {
		ajourné: find((r) => r.statut === 'ajourné'),
		'2e session': find((r) => r.statut === '2e session'),
		passable: find((r) => r.mention === 'passable'),
		'assez bien': find((r) => r.mention === 'assez bien'),
		bien: find((r) => r.mention === 'bien'),
		'très bien': find((r) => r.mention === 'très bien')
	};
}

// ---------- Génération ----------
export function generate(annee: number, count: number): Dataset {
	const rnd = mulberry32(annee * 7919 + count);
	const numeros = new Set<string>();
	const results: Result[] = [];
	const provItems = Object.entries(PROVINCES).map(([v, p]) => ({ v, w: p.w }));
	const serieItems = SERIES.map(({ s, w }) => ({ v: s, w }));

	while (results.length < count) {
		const numero = String(100000 + Math.floor(rnd() * 900000));
		if (numeros.has(numero)) continue;
		numeros.add(numero);

		const province = weighted(rnd, provItems);
		const ciscos = Object.keys(PROVINCES[province].cisco);
		const cisco = pick(rnd, ciscos);
		const ecole = pick(rnd, PROVINCES[province].cisco[cisco]);
		const serie = weighted(rnd, serieItems);

		// Distribution réaliste : ~56 % admis, ~7 % 2e session, ~37 % ajournés
		const statut = weighted<Statut>(rnd, [
			{ v: 'admis', w: 56 },
			{ v: '2e session', w: 7 },
			{ v: 'ajourné', w: 37 }
		]);
		let moyenne: number;
		if (statut === 'admis') {
			// Biais vers « passable »
			const r = rnd();
			moyenne =
				r < 0.6
					? 10 + rnd() * 2
					: r < 0.87
						? 12 + rnd() * 2
						: r < 0.97
							? 14 + rnd() * 2
							: 16 + rnd() * 3;
		} else if (statut === '2e session') {
			moyenne = 8 + rnd() * 2;
		} else {
			moyenne = 3 + rnd() * 5;
		}
		moyenne = round2(moyenne);
		const mention: Mention = statut === 'admis' ? mentionFor(moyenne) : '';

		const nbPrenoms = rnd() < 0.55 ? 2 : rnd() < 0.8 ? 1 : 3;
		const prenomsArr: string[] = [];
		while (prenomsArr.length < nbPrenoms) {
			const p = pick(rnd, PRENOMS);
			if (!prenomsArr.includes(p)) prenomsArr.push(p);
		}
		let nom = pick(rnd, NOMS);
		if (rnd() < 0.25) nom += ' ' + pick(rnd, NOMS);

		results.push({
			id: `${annee}-${numero}`,
			numero,
			nom,
			prenoms: prenomsArr.join(' '),
			serie,
			province,
			cisco,
			ecole,
			statut,
			mention,
			moyenne,
			notes: notesFor(annee, numero, serie, moyenne)
		});
	}

	results.sort((a, b) => a.numero.localeCompare(b.numero));

	return {
		annee,
		examen: 'BAC',
		session: `Session ${annee}`,
		generatedAt: `${annee}-07-25T08:00:00.000Z`,
		total: results.length,
		matieres: MATIERES,
		examples: examplesFor(results),
		results
	};
}

// ---------- CLI ----------
const [argYear, argCount] = process.argv.slice(2);
const plan: [number, number][] = argYear
	? [[Number(argYear), Number(argCount ?? 3000)]]
	: [
			[2024, 2600],
			[2025, 3200]
		];

mkdirSync(OUT_DIR, { recursive: true });
for (const [annee, count] of plan) {
	const ds = generate(annee, count);
	const file = join(OUT_DIR, `${annee}.json`);
	writeFileSync(file, JSON.stringify(ds, null, '\t') + '\n');
	const admis = ds.results.filter((r) => r.statut === 'admis').length;
	console.log(`${file}: ${ds.total} candidats, ${((admis / ds.total) * 100).toFixed(1)} % admis`);
}
