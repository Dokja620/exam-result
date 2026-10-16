<script lang="ts" module>
	/**
	 * Le relevé (partage, impression, QR) n'est chargé qu'au besoin : l'accueil et la liste n'en
	 * paient le poids qu'à l'ouverture d'une modale. `preloadResultCard` l'anticipe (saisie d'un
	 * numéro, survol d'une ligne).
	 */
	let cardModule: ReturnType<typeof load> | undefined;
	function load() {
		return import('$lib/components/ResultCard.svelte');
	}
	export function preloadResultCard() {
		cardModule ??= load();
		return cardModule;
	}
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Result } from '$lib/types';

	let {
		selected,
		annee,
		onClose
	}: { selected: Result | null; annee: number; onClose: () => void } = $props();

	let modal: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!modal) return;
		if (selected && !modal.open) modal.showModal();
		else if (!selected && modal.open) modal.close();
	});
</script>

<dialog bind:this={modal} class="modal result-modal" onclose={onClose}>
	{#if selected}
		<div class="modal-box">
			<button class="close" type="button" aria-label="Fermer" onclick={() => modal?.close()}>
				<Icon name="x" size={18} />
			</button>
			{#await preloadResultCard() then { default: ResultCard }}
				<ResultCard result={selected} {annee} enter />
			{/await}
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>Fermer</button>
		</form>
	{/if}
</dialog>
