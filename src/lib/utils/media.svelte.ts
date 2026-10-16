/** Rune réactive sur une media query. Valeur `fallback` côté serveur. */
export class MediaQuery {
	current = $state(false);

	constructor(query: string, fallback = false) {
		this.current = fallback;
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia(query);
		this.current = mq.matches;
		mq.addEventListener('change', (e) => (this.current = e.matches));
	}
}
