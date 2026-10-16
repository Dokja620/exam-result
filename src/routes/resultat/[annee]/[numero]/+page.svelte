<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import { shareText, statutLabel } from '$lib/utils/share';

	let { data } = $props();

	const r = $derived(data.result);
	const title = $derived(`${r.nom} ${r.prenoms}, ${statutLabel(r)}, BAC ${data.annee}`);
	const description = $derived(shareText(r, data.annee));
	const canonical = $derived(`${page.url.origin}/resultat/${data.annee}/${r.numero}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Résultats du BAC, Madagascar" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content="fr_MG" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="result-page wrap">
	<a href="/?annee={data.annee}" class="back">
		<Icon name="arrow-left" size={18} />
		Tous les résultats {data.annee}
	</a>

	<ResultCard result={r} annee={data.annee} />

	<p class="autre">
		Ce n'est pas vous ? <a href="/?annee={data.annee}">Vérifiez un autre numéro</a>.
	</p>
</div>
