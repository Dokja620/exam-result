<script lang="ts">
	import 'iconify-icon';
	import { tick } from 'svelte';
	import FilterBar, { type Filters } from '$lib/components/table/FilterBar.svelte';
	import PdFexport from '$lib/components/table/PDFexport.svelte';
	import CsvExport from '$lib/components/table/CSVexport.svelte';
	import Pagination from '$lib/components/table/Pagination.svelte';
	import { normalize } from '$lib/utils/normalize';
	import type { Result } from '$lib/types';

	let {
		rows,
		loading = false,
		annee,
		onSelect
	}: { rows: Result[]; loading?: boolean; annee: number; onSelect: (r: Result) => void } = $props();

	// ---- Recherche (debounce) + filtres ----
	let search = $state('');
	let query = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;
	function debounceSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => (query = normalize(search)), 150);
	}

	let filters = $state<Filters>({ serie: '', province: '', statut: '', mention: '' });

	// Index de recherche précalculé une fois par jeu de données
	const indexed = $derived(
		rows.map((r) => ({ r, q: normalize(`${r.nom} ${r.prenoms}`), n: r.numero }))
	);

	const filtered = $derived.by(() => {
		const { serie, province, statut, mention } = filters;
		const out: Result[] = [];
		for (const { r, q, n } of indexed) {
			if (serie && r.serie !== serie) continue;
			if (province && r.province !== province) continue;
			if (statut && r.statut !== statut) continue;
			if (mention && r.mention !== mention) continue;
			if (query && !n.includes(query) && !q.includes(query)) continue;
			out.push(r);
		}
		return out;
	});

	// ---- Pagination ----
	const PAGE_SIZE = 50;
	let page = $state(1);
	$effect(() => {
		// Retour à la première page dès que la liste change
		void filtered;
		page = 1;
	});
	const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const pageRows = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	// ---- Impression / PDF : on rend toute la liste filtrée le temps de l'impression ----
	let printing = $state(false);
	async function exportPdf() {
		printing = true;
		await tick();
		window.print();
		printing = false;
	}
	const shown = $derived(printing ? filtered : pageRows);

	function keySelect(e: KeyboardEvent, r: Result) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(r);
		}
	}
</script>

<section id="table" aria-busy={loading}>
	<div id="table-actions" data-screenshift>
		<FilterBar bind:search bind:filters onSearch={debounceSearch} />
		<div class="exports">
			<CsvExport rows={filtered} {annee} />
			<PdFexport onExport={exportPdf} />
		</div>
	</div>

	<p class="count" data-screenshift aria-live="polite">
		{#if loading}
			Chargement des résultats {annee}…
		{:else if rows.length === 0}
			Aucune donnée.
		{:else}
			{filtered.length.toLocaleString('fr-FR')} candidat{filtered.length > 1 ? 's' : ''}
			{#if filtered.length !== rows.length}
				sur {rows.length.toLocaleString('fr-FR')}
			{/if}
		{/if}
	</p>

	<div class="content" data-screenshift>
		<table>
			<caption class="print-only">Résultats du Baccalauréat {annee} – Madagascar</caption>
			<thead>
				<tr>
					<th scope="col">Numéro</th>
					<th scope="col">Série</th>
					<th scope="col">Nom et Prénoms</th>
					<th scope="col">Province</th>
					<th scope="col">CISCO</th>
					<th scope="col">École</th>
					<th scope="col">Observation</th>
					<th scope="col">Mention</th>
				</tr>
			</thead>
			<tbody>
				{#each shown as item (item.id)}
					<tr
						tabindex="0"
						role="button"
						aria-label="Voir le résultat de {item.nom} {item.prenoms}"
						onclick={() => onSelect(item)}
						onkeydown={(e) => keySelect(e, item)}
					>
						<td data-cell="numéro"><p>{item.numero}</p></td>
						<td data-cell="série"><p>{item.serie}</p></td>
						<td data-cell="nom et prénoms"><p><span>{item.nom}</span> {item.prenoms}</p></td>
						<td data-cell="province"><p>{item.province}</p></td>
						<td data-cell="CISCO"><p>{item.cisco}</p></td>
						<td data-cell="école d'origine"><p>{item.ecole}</p></td>
						<td data-cell="observation" data-result={item.statut}><p>{item.statut}</p></td>
						<td data-mention={item.mention} data-cell="mention"><p>{item.mention || '—'}</p></td>
					</tr>
				{:else}
					{#if !loading && rows.length}
						<tr class="empty"
							><td colspan="8">Aucun résultat ne correspond à votre recherche.</td></tr
						>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>

	{#if !printing && pageCount > 1}
		<Pagination bind:page {pageCount} total={filtered.length} pageSize={PAGE_SIZE} />
	{/if}
</section>
