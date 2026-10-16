<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
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
			<ResultCard result={selected} {annee} enter />
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>Fermer</button>
		</form>
	{/if}
</dialog>
