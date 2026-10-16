<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	let { onExport, disabled = false }: { onExport: () => void; disabled?: boolean } = $props();
</script>

<button class="btn btn-quiet" type="button" onclick={onExport} {disabled}>
	<Icon name="printer" size={18} />
	Imprimer la liste
</button>
