<script lang="ts" module>
	/** Images Open Graph (1200 × 630, `static/og/`), générées par `bun run og:generate`. */
	export const OG_IMAGES = {
		home: 'Résultats du BAC à Madagascar : consultez votre résultat',
		liste: 'Tous les résultats du BAC : recherche par nom, numéro, série',
		lycees: 'Classement des lycées par taux de réussite au BAC'
	} as const;
	export type OgImage = keyof typeof OG_IMAGES;

	export const SITE_NAME = 'Résultats du BAC';
	const DEFAULT_SITE_URL = 'https://exam-results.ohayoprepa.mg';
</script>

<script lang="ts">
	/**
	 * Balises de partage communes à toutes les pages : titre, description, URL canonique
	 * absolue, Open Graph et Twitter. L'origine vient de PUBLIC_SITE_URL ; à défaut, de
	 * l'adresse de production (jamais localhost hors du serveur de développement).
	 */
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	let {
		title,
		description,
		path = page.url.pathname,
		image = 'home',
		type = 'website',
		noindex = false
	}: {
		title: string;
		description: string;
		/** Chemin canonique (avec sa requête éventuelle), par défaut celui de la page */
		path?: string;
		image?: OgImage;
		type?: 'website' | 'article';
		noindex?: boolean;
	} = $props();

	const origin = $derived(
		(env.PUBLIC_SITE_URL || (dev ? page.url.origin : DEFAULT_SITE_URL)).replace(/\/+$/, '')
	);
	const url = $derived(origin + path);
	const imageUrl = $derived(`${origin}/og/${image}.png`);
	const alt = $derived(OG_IMAGES[image]);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={alt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={alt} />
</svelte:head>
