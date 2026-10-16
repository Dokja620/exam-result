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
