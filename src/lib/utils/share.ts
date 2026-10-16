import type { Result } from '$lib/types';

export function resultUrl(annee: number, numero: string): string {
	const url = new URL(window.location.href);
	url.search = '';
	url.searchParams.set('annee', String(annee));
	url.searchParams.set('n', numero);
	return url.toString();
}

export function shareText(r: Result, annee: number): string {
	const nom = `${r.nom} ${r.prenoms}`;
	return r.statut === 'admis'
		? `${nom} – ADMIS au BAC ${annee} (série ${r.serie}, mention ${r.mention}).`
		: `${nom} – BAC ${annee}, série ${r.serie} : ${r.statut}.`;
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
