<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import { shareText, statutLabel } from '$lib/utils/share';

	let { data } = $props();

	const r = $derived(data.result);
	const title = $derived(`${r.nom} ${r.prenoms}, ${statutLabel(r)}, BAC ${data.annee}`);
	const description = $derived(`${shareText(r, data.annee)} Données fictives.`);
</script>

<Seo {title} {description} path="/resultat/{data.annee}/{r.numero}" noindex />

<div class="result-page wrap">
	<a href="/liste/{data.annee}" class="back">
		<Icon name="arrow-left" size={18} />
		Tous les résultats {data.annee}
	</a>

	<ResultCard result={r} annee={data.annee} enter />

	<p class="autre">
		Ce n'est pas vous ? <a href="/?annee={data.annee}">Vérifier un autre numéro</a>
	</p>
</div>
