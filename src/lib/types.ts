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
	/** Notes /20 dans l'ordre de `Dataset.matieres[serie]` (moyenne pondérée = `moyenne`) */
	notes: number[];
}

/** `[matière, coefficient]` */
export type Matiere = [string, number];

/** Ligne du relevé de notes, une fois la note associée à sa matière. */
export interface Note {
	matiere: string;
	coef: number;
	note: number;
}

/** Un numéro de candidat par issue (numéros de test de l'accueil). */
export type Examples = Record<'ajourné' | '2e session' | Exclude<Mention, ''>, string>;

export type Results = Result[];

export interface Dataset {
	annee: number;
	examen: 'BAC';
	session: string;
	/** ISO 8601 */
	generatedAt: string;
	total: number;
	/** Matières et coefficients par série */
	matieres: Record<Serie, Matiere[]>;
	/** Premier numéro de chaque issue */
	examples: Examples;
	results: Result[];
}

/** Réponse de `GET /api/results` sans paramètre `annee`. */
export interface Meta {
	annees: number[];
	annee: number;
	totaux: Record<string, number>;
	/** Numéros de test par année */
	examples: Record<string, Examples>;
}
