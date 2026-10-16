<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { downloadCsv } from '$lib/utils/csv';
	import type { Result } from '$lib/types';

	let { rows, annee }: { rows: Result[]; annee: number } = $props();
</script>

<button
	class="btn btn-quiet"
	type="button"
	disabled={rows.length === 0}
	onclick={() => downloadCsv(rows, `resultats-bac-${annee}.csv`)}
>
	<Icon name="download" size={18} />
	Exporter en CSV
</button>
