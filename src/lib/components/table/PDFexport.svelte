<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	let { onExport, disabled = false }: { onExport: () => void; disabled?: boolean } = $props();
</script>

<button
	class="button ghost"
	type="button"
	aria-label="Imprimer la liste filtrée"
	onclick={onExport}
	{disabled}
>
	<Icon name="printer" size={18} />
	Imprimer
</button>
