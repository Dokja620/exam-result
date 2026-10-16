import type { Result } from '$lib/types';

/**
 * Image de partage (1080 × 1350, format portrait des réseaux sociaux) dessinée au <canvas>
 * avec la palette v1 et Poppins (déjà chargée par la page). Pour un ajourné ou une 2e session,
 * on n'affiche pas la moyenne : l'image reste présentable, sans exposer la note.
 */

// Palette v1 (valeurs des jetons de src/app.css / _tokens.scss)
const C = {
	bg: '#faf9f9',
	paper: '#ffffff',
	ink: '#020b12',
	ink2: '#4a5257',
	ink3: '#6b7176',
	line: '#e6e6e6',
	blue: '#5abfdd',
	red: '#ed1d27',
	green: '#018945',
	stone: '#a8a8a8',
	track: '#eeeeee'
};
const VERDICT = {
	admis: { wash: '#e6f3ec', ink: '#005b2e', zone: '#29af00' },
	'2e session': { wash: '#fff1dc', ink: '#713a09', zone: '#faa423' },
	ajourné: { wash: '#f2f1f0', ink: '#020b12', zone: '#a8a8a8' }
} as const;
const HL: Record<string, string> = {
	'très bien': 'rgba(83, 255, 31, 0.84)',
	bien: 'rgba(188, 255, 31, 0.74)',
	'assez bien': 'rgba(255, 212, 20, 0.59)',
	passable: 'rgba(168, 168, 168, 0.53)'
};

// Onglets du drapeau (même tracé que --tab-tl / --tab-br, 70 × 50)
const TAB_TL = 'M24 0H66a4 4 0 0 1 4 4V46a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V24A24 24 0 0 1 24 0Z';
const TAB_BR = 'M4 0H66a4 4 0 0 1 4 4V26A24 24 0 0 1 46 50H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z';

const W = 1080;
const H = 1350;
const FONT = 'Poppins, system-ui, sans-serif';

function font(weight: number, size: number) {
	return `${weight} ${size}px ${FONT}`;
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number | [number, number, number, number]
) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
}

/** Découpe un texte en lignes qui tiennent dans `max` px (au plus `lines` lignes). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines = 2): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	const out: string[] = [];
	let cur = '';
	for (const w of words) {
		const next = cur ? `${cur} ${w}` : w;
		if (ctx.measureText(next).width <= max || !cur) cur = next;
		else {
			out.push(cur);
			cur = w;
		}
	}
	if (cur) out.push(cur);
	if (out.length > lines) {
		const kept = out.slice(0, lines);
		let last = kept[lines - 1];
		while (ctx.measureText(`${last}…`).width > max && last.length > 1) last = last.slice(0, -1);
		kept[lines - 1] = `${last.trimEnd()}…`;
		return kept;
	}
	return out;
}

/** Réduit la taille de police jusqu'à ce que le texte tienne sur une ligne. */
function fit(
	ctx: CanvasRenderingContext2D,
	text: string,
	weight: number,
	size: number,
	max: number
) {
	let s = size;
	ctx.font = font(weight, s);
	while (ctx.measureText(text).width > max && s > 24) {
		s -= 2;
		ctx.font = font(weight, s);
	}
	return s;
}

// Petites « sprinkles » de fond (comme le hero), position fixe pour un rendu stable
function sprinkles(ctx: CanvasRenderingContext2D) {
	let seed = 7;
	const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	ctx.save();
	ctx.lineCap = 'round';
	for (let i = 0; i < 46; i++) {
		const x = rnd() * W;
		const y = rnd() * H;
		const col = rnd() < 0.5 ? C.red : C.green;
		// Pas sous la marque ni sous le pied d'image
		if ((y < 150 && x < 620) || y > 1190) continue;
		ctx.globalAlpha = 0.18 + rnd() * 0.2;
		ctx.strokeStyle = col;
		ctx.lineWidth = 3;
		if (rnd() < 0.55) {
			const l = 14 + rnd() * 40;
			ctx.beginPath();
			ctx.moveTo(x, y + l);
			ctx.lineTo(x + l, y);
			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.arc(x, y, 5 + rnd() * 4, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
	ctx.restore();
}

export interface ShareImageOptions {
	result: Result;
	annee: number;
	/** Hôte affiché en pied d'image (ex. resultats-bac.example) */
	site: string;
}

export async function drawShareImage(
	canvas: HTMLCanvasElement,
	{ result: r, annee, site }: ShareImageOptions
) {
	if (document.fonts) {
		await Promise.all(
			[400, 500, 600, 700].map((w) => document.fonts.load(font(w, 40), 'Admis 0123'))
		).catch(() => undefined);
	}
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('canvas indisponible');
	const v = VERDICT[r.statut];
	const admis = r.statut === 'admis';

	// Fond
	ctx.fillStyle = C.bg;
	ctx.fillRect(0, 0, W, H);
	sprinkles(ctx);

	// Marque
	const bx = 90;
	roundRect(ctx, bx, 64, 60, 60, 16);
	ctx.fillStyle = C.blue;
	ctx.fill();
	ctx.fillStyle = C.ink;
	ctx.font = font(700, 28);
	ctx.textAlign = 'center';
	ctx.fillText('20', bx + 30, 104);
	ctx.textAlign = 'left';
	ctx.font = font(700, 36);
	ctx.fillText('Résultats du BAC', bx + 80, 107);

	// Carte + onglets du drapeau
	const x = 90;
	const y = 170;
	const w = 900;
	const h = 980;
	const tabW = 210;
	const tabH = 150;
	const off = 24;
	ctx.save();
	ctx.translate(x - off, y - off);
	ctx.scale(3, 3);
	ctx.fillStyle = C.red;
	ctx.fill(new Path2D(TAB_TL));
	ctx.restore();
	ctx.save();
	ctx.translate(x + w + off - tabW, y + h + off - tabH);
	ctx.scale(3, 3);
	ctx.fillStyle = C.green;
	ctx.fill(new Path2D(TAB_BR));
	ctx.restore();

	ctx.save();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
	ctx.shadowBlur = 40;
	ctx.shadowOffsetY = 12;
	roundRect(ctx, x, y, w, h, 44);
	ctx.fillStyle = C.paper;
	ctx.fill();
	ctx.restore();

	// Bandeau du verdict
	const bandH = 400;
	roundRect(ctx, x, y, w, bandH, [44, 44, 0, 0]);
	ctx.fillStyle = v.wash;
	ctx.fill();

	const px = x + 72;
	const inner = w - 144;
	ctx.fillStyle = v.ink;
	ctx.globalAlpha = 0.85;
	ctx.font = font(600, 30);
	ctx.fillText(`BAC ${annee}`, px, y + 86);
	ctx.textAlign = 'right';
	ctx.fillText(`Série ${r.serie}`, px + inner, y + 86);
	ctx.textAlign = 'left';
	ctx.globalAlpha = 1;

	const word = admis ? 'Admis' : r.statut === '2e session' ? '2e session' : 'Ajourné';
	const size = fit(ctx, word, 700, 168, inner);
	ctx.letterSpacing = `${-0.035 * size}px`;
	ctx.fillText(word, px - 4, y + 270);
	ctx.letterSpacing = '0px';

	ctx.font = font(600, 44);
	const subY = y + 345;
	if (admis) {
		const mention = r.mention || 'passable';
		const lead = 'Mention ';
		ctx.fillText(lead, px, subY);
		const lx = px + ctx.measureText(lead).width;
		const mw = ctx.measureText(mention).width;
		ctx.fillStyle = HL[mention] ?? HL.passable;
		ctx.fillRect(lx - 4, subY - 22, mw + 8, 30);
		ctx.fillStyle = C.ink;
		ctx.fillText(mention, lx, subY);
	} else {
		ctx.font = font(600, 38);
		const sub =
			r.statut === '2e session'
				? 'Convoqué à la seconde session'
				: 'La prochaine session est ouverte';
		const lines = wrap(ctx, sub, inner, 2);
		lines.forEach((l, i) => ctx.fillText(l, px, subY - (lines.length - 1) * 24 + i * 48));
	}

	// Identité
	let cy = y + bandH + 110;
	ctx.fillStyle = C.ink;
	ctx.font = font(700, 64);
	const nomLines = wrap(ctx, r.nom, inner, 2);
	ctx.letterSpacing = '-1px';
	for (const l of nomLines) {
		ctx.fillText(l, px, cy);
		cy += 74;
	}
	ctx.letterSpacing = '0px';
	ctx.fillStyle = C.ink2;
	ctx.font = font(400, 44);
	for (const l of wrap(ctx, r.prenoms, inner, 1)) {
		ctx.fillText(l, px, cy - 8);
		cy += 56;
	}

	// Moyenne (admis seulement) ou mot d'encouragement
	cy += 70;
	if (admis) {
		const moy = r.moyenne.toLocaleString('fr-FR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		ctx.fillStyle = C.ink;
		ctx.font = font(700, 120);
		ctx.letterSpacing = '-4px';
		ctx.fillText(moy, px - 4, cy + 40);
		const mx = px + ctx.measureText(moy).width + 14;
		ctx.letterSpacing = '0px';
		ctx.fillStyle = C.ink2;
		ctx.font = font(400, 44);
		ctx.fillText('/ 20', mx, cy + 40);
		ctx.textAlign = 'right';
		ctx.font = font(400, 30);
		ctx.fillText('Moyenne générale', px + inner, cy + 40);
		ctx.textAlign = 'left';

		// Échelle 0–20 (8 et 10 en seuils), comme sur le relevé
		const sy = cy + 86;
		const zones: [number, number, string][] = [
			[0, 8, C.track],
			[8, 10, C.track],
			[10, 20, v.zone]
		];
		for (const [a, b, col] of zones) {
			const zx = px + (a / 20) * inner + (a ? 3 : 0);
			const zw = ((b - a) / 20) * inner - (a ? 3 : 0);
			roundRect(ctx, zx, sy, zw, 14, a === 0 ? [7, 0, 0, 7] : b === 20 ? [0, 7, 7, 0] : 0);
			ctx.fillStyle = col;
			ctx.fill();
		}
		const mxp = px + Math.min(1, Math.max(0, r.moyenne / 20)) * inner;
		ctx.beginPath();
		ctx.arc(mxp, sy + 7, 18, 0, Math.PI * 2);
		ctx.fillStyle = C.paper;
		ctx.fill();
		ctx.lineWidth = 9;
		ctx.strokeStyle = C.ink;
		ctx.stroke();
	} else {
		ctx.fillStyle = C.ink2;
		ctx.font = font(500, 40);
		const msg =
			r.statut === '2e session'
				? 'Il manque peu de points. On y retourne, et on y va.'
				: 'Une session ne ferme aucune porte. La suite s’écrit maintenant.';
		wrap(ctx, msg, inner, 3).forEach((l, i) => ctx.fillText(l, px, cy + 20 + i * 56));
	}

	// Pied de carte : lycée
	ctx.strokeStyle = C.line;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(px, y + h - 130);
	ctx.lineTo(px + inner, y + h - 130);
	ctx.stroke();
	ctx.fillStyle = C.ink2;
	ctx.font = font(500, 30);
	const lycee = wrap(ctx, `${r.ecole} · ${r.province}`, inner, 1)[0];
	ctx.fillText(lycee, px, y + h - 66);

	// Pied d'image
	ctx.fillStyle = C.ink;
	ctx.font = font(600, 32);
	ctx.fillText(site, x, H - 92);
	ctx.fillStyle = C.ink3;
	ctx.font = font(400, 26);
	ctx.fillText('Données fictives · site de démonstration, sans lien avec le ministère', x, H - 50);
}

export async function shareImageBlob(opts: ShareImageOptions): Promise<Blob> {
	const canvas = document.createElement('canvas');
	await drawShareImage(canvas, opts);
	return new Promise((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png')
	);
}

export function shareImageName(r: Result, annee: number) {
	return `resultat-bac-${annee}-${r.numero}.png`;
}
