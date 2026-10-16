<script lang="ts">
	import 'iconify-icon';
	import { downloadCsv } from '$lib/utils/csv';
	import type { Result } from '$lib/types';

	let { rows, annee }: { rows: Result[]; annee: number } = $props();
</script>

<div class="export">
	<button
		class="btn btn-secondary btn-outline"
		type="button"
		disabled={rows.length === 0}
		onclick={() => downloadCsv(rows, `resultats-bac-${annee}.csv`)}
		aria-label="Exporter la liste filtrée en CSV"
	>
		<iconify-icon icon="ph:file-csv" style="font-size: 30px"></iconify-icon>
		Exporter en CSV
	</button>
</div>
