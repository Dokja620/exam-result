<script lang="ts">
	import 'iconify-icon';
	let { onExport }: { onExport: () => void } = $props();
</script>

<div class="export">
	<button
		class="btn btn-secondary"
		type="button"
		onclick={onExport}
		aria-label="Exporter la liste en PDF"
	>
		<iconify-icon icon="ph:file-pdf" style="font-size: 30px"></iconify-icon>
		Exporter en PDF
	</button>
</div>
