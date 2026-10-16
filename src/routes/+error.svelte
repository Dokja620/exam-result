<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Introuvable' : 'Erreur'}, Résultats du BAC</title>
</svelte:head>

<div class="result-page wrap wrap-narrow">
	<div class="notice">
		<Icon name="file-search" size={32} />
		{#if page.status === 404}
			<strong>Aucun résultat à cette adresse.</strong>
			<span
				>Le numéro de candidat ou la session n'existe pas. Vérifiez les six chiffres de votre
				convocation.</span
			>
		{:else}
			<strong>Une erreur est survenue ({page.status}).</strong>
			<span>{page.error?.message}</span>
		{/if}
		<a class="btn btn-ink" href="/">Vérifier un numéro</a>
	</div>
</div>
