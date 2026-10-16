<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Introuvable' : 'Erreur'}, Résultats du BAC</title>
</svelte:head>

<div class="error-page wrap wrap-narrow">
	<p class="big-code" aria-hidden="true">{page.status}</p>
	{#if page.status === 404}
		<h1>Aucun résultat à cette adresse</h1>
		<p>
			Ce numéro de candidat ou cette session n'existe pas. Vérifiez les six chiffres de votre
			convocation et l'année de la session.
		</p>
	{:else}
		<h1>Une erreur est survenue</h1>
		<p>{page.error?.message ?? 'Réessayez dans un instant.'}</p>
	{/if}
	<div class="actions">
		<a class="button" href="/">Vérifier un numéro</a>
		<a class="button ghost" href="/liste">Chercher par nom</a>
	</div>
</div>
