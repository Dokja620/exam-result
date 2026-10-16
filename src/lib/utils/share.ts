import type { Result } from '$lib/types';

/** Chemin de la page autonome d'un résultat (SSR + balises Open Graph). */
export function resultPath(annee: number, numero: string): string {
	return `/resultat/${annee}/${encodeURIComponent(numero)}`;
}

/** Nom du fichier de l'image de partage. */
export function shareImageName(r: Result, annee: number): string {
	return `resultat-bac-${annee}-${r.numero}.png`;
}

export function resultUrl(annee: number, numero: string): string {
	return new URL(resultPath(annee, numero), window.location.origin).toString();
}

export function statutLabel(r: Result): string {
	if (r.statut === 'admis') return r.mention ? `Admis, mention ${r.mention}` : 'Admis';
	if (r.statut === '2e session') return 'Convoqué à la 2e session';
	return 'Ajourné';
}

export function shareText(r: Result, annee: number): string {
	return `${r.nom} ${r.prenoms}, BAC ${annee} série ${r.serie} : ${statutLabel(r)}.`;
}

/**
 * Copie dans le presse-papiers. L'API Clipboard n'existe qu'en contexte sécurisé (https,
 * localhost) : en http sur le réseau local, on retombe sur un textarea + execCommand('copy').
 */
export async function copyText(text: string): Promise<boolean> {
	if (window.isSecureContext && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Permission refusée : on tente le repli
		}
	}
	return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
	const active = document.activeElement as HTMLElement | null;
	// Dans une modale (<dialog> modal), le reste de la page est inerte : le textarea doit y vivre
	const host = active?.closest('dialog[open]') ?? document.body;
	const ta = document.createElement('textarea');
	ta.value = text;
	ta.setAttribute('readonly', '');
	ta.setAttribute('aria-hidden', 'true');
	ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
	host.appendChild(ta);
	ta.select();
	ta.setSelectionRange(0, text.length);
	let ok = false;
	try {
		ok = document.execCommand('copy');
	} catch {
		ok = false;
	}
	ta.remove();
	active?.focus({ preventScroll: true });
	return ok;
}

export type ShareOutcome = 'shared' | 'cancelled' | 'menu';

/**
 * Partage natif : avec l'image si l'appareil sait partager des fichiers, sinon titre + texte +
 * lien. Retourne 'menu' quand aucune feuille de partage n'existe (le composant ouvre alors son
 * menu de repli : WhatsApp, Facebook, image, lien).
 */
export async function shareResult(
	r: Result,
	annee: number,
	image?: File | null
): Promise<ShareOutcome> {
	const data = {
		title: `Résultat BAC ${annee}`,
		text: shareText(r, annee),
		url: resultUrl(annee, r.numero)
	};
	if (typeof navigator.share !== 'function') return 'menu';
	const withFile = image && navigator.canShare?.({ files: [image] });
	try {
		await navigator.share(withFile ? { ...data, files: [image] } : data);
		return 'shared';
	} catch (e) {
		const name = (e as Error).name;
		if (name === 'AbortError') return 'cancelled';
		// NotAllowedError (geste utilisateur expiré) ou fichier refusé : on retente sans image
		if (withFile) {
			try {
				await navigator.share(data);
				return 'shared';
			} catch (e2) {
				if ((e2 as Error).name === 'AbortError') return 'cancelled';
			}
		}
		return 'menu';
	}
}

export function whatsappUrl(r: Result, annee: number): string {
	return `https://wa.me/?text=${encodeURIComponent(`${shareText(r, annee)} ${resultUrl(annee, r.numero)}`)}`;
}

export function facebookUrl(r: Result, annee: number): string {
	return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultUrl(annee, r.numero))}`;
}

export function downloadBlob(blob: Blob, name: string) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
