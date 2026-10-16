import type { Result } from '$lib/types';

const HEADERS: [keyof Result, string][] = [
	['numero', 'Numéro'],
	['nom', 'Nom'],
	['prenoms', 'Prénoms'],
	['serie', 'Série'],
	['province', 'Province'],
	['cisco', 'CISCO'],
	['ecole', 'Établissement'],
	['statut', 'Observation'],
	['mention', 'Mention'],
	['moyenne', 'Moyenne']
];

function cell(v: unknown): string {
	const s = String(v ?? '');
	return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV séparé par `;` (Excel FR) avec BOM UTF-8. */
export function toCsv(rows: Result[]): string {
	const lines = [HEADERS.map(([, label]) => cell(label)).join(';')];
	for (const r of rows) {
		lines.push(
			HEADERS.map(([k]) => cell(k === 'moyenne' ? String(r.moyenne).replace('.', ',') : r[k])).join(
				';'
			)
		);
	}
	return '﻿' + lines.join('\r\n');
}

export function downloadCsv(rows: Result[], filename: string) {
	const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
