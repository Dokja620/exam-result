import type { Result } from '$lib/types';

/** Chemin de la page autonome d'un résultat (SSR + balises Open Graph). */
export function resultPath(annee: number, numero: string): string {
	return `/resultat/${annee}/${encodeURIComponent(numero)}`;
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

/** Web Share si dispo, sinon copie du lien. Retourne 'shared' | 'copied' | 'failed'. */
export async function shareResult(
	r: Result,
	annee: number
): Promise<'shared' | 'copied' | 'failed'> {
	const url = resultUrl(annee, r.numero);
	const text = shareText(r, annee);
	if (typeof navigator.share === 'function') {
		try {
			await navigator.share({ title: `Résultat BAC ${annee}`, text, url });
			return 'shared';
		} catch (e) {
			if ((e as Error).name === 'AbortError') return 'failed';
		}
	}
	return (await copyText(`${text}\n${url}`)) ? 'copied' : 'failed';
}
