import { MENTIONS, PROVINCES, SERIES, type Result } from '$lib/types';

export interface Rate {
	label: string;
	total: number;
	admis: number;
	/** 0–100 */
	taux: number;
}

function rate(label: string, rows: Result[]): Rate {
	const admis = rows.filter((r) => r.statut === 'admis').length;
	return { label, total: rows.length, admis, taux: rows.length ? (admis / rows.length) * 100 : 0 };
}

export function computeStats(rows: Result[]) {
	const global = rate('Global', rows);
	const parSerie = SERIES.map((s) =>
		rate(
			s,
			rows.filter((r) => r.serie === s)
		)
	).filter((x) => x.total);
	const parProvince = PROVINCES.map((p) =>
		rate(
			p,
			rows.filter((r) => r.province === p)
		)
	).filter((x) => x.total);
	const mentions = MENTIONS.map((m) => {
		const n = rows.filter((r) => r.mention === m).length;
		return { label: m, total: n, part: global.admis ? (n / global.admis) * 100 : 0 };
	});
	const deuxieme = rows.filter((r) => r.statut === '2e session').length;
	const ajournes = rows.filter((r) => r.statut === 'ajourné').length;
	return { global, parSerie, parProvince, mentions, deuxieme, ajournes };
}

export type SessionStats = ReturnType<typeof computeStats>;

export interface EcoleRate extends Rate {
	cisco: string;
	province: string;
}

/** Taux de réussite par établissement, trié par nom. */
export function statsParEcole(rows: Result[]): EcoleRate[] {
	const groups = new Map<string, Result[]>();
	for (const r of rows) {
		const g = groups.get(r.ecole);
		if (g) g.push(r);
		else groups.set(r.ecole, [r]);
	}
	return [...groups.entries()]
		.map(([ecole, list]) => ({
			...rate(ecole, list),
			cisco: list[0].cisco,
			province: list[0].province
		}))
		.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

/** Format fr-FR, 1 décimale max. */
export const fmtPct = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
export const fmtInt = (n: number) => n.toLocaleString('fr-FR');
