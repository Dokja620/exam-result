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

export async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback (anciens navigateurs / contexte non sécurisé)
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		const ok = document.execCommand('copy');
		ta.remove();
		return ok;
	}
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
