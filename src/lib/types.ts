export const SERIES = ['A1', 'A2', 'C', 'D', 'L', 'S', 'OSE', 'G'] as const;
export type Serie = (typeof SERIES)[number];

export const STATUTS = ['admis', '2e session', 'ajourné'] as const;
export type Statut = (typeof STATUTS)[number];

export const MENTIONS = ['très bien', 'bien', 'assez bien', 'passable'] as const;
/** Chaîne vide = pas de mention (candidat non admis). */
export type Mention = (typeof MENTIONS)[number] | '';

export const PROVINCES = [
	'Antananarivo',
	'Toamasina',
	'Fianarantsoa',
	'Mahajanga',
	'Toliara',
	'Antsiranana'
] as const;
export type Province = (typeof PROVINCES)[number];

export interface Result {
	/** `${annee}-${numero}` – unique toutes années confondues */
	id: string;
	/** Numéro de candidat (6 chiffres) */
	numero: string;
	nom: string;
	prenoms: string;
	serie: Serie;
	province: Province;
	cisco: string;
	ecole: string;
	statut: Statut;
	mention: Mention;
	/** Moyenne générale /20 */
	moyenne: number;
}

export type Results = Result[];

export interface Dataset {
	annee: number;
	examen: 'BAC';
	session: string;
	/** ISO 8601 */
	generatedAt: string;
	total: number;
	results: Result[];
}

/** Réponse de `GET /api/results` sans paramètre `annee`. */
export interface Meta {
	annees: number[];
	annee: number;
	totaux: Record<string, number>;
}
