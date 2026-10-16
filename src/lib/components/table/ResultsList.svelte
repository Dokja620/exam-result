<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import FilterBar, { EMPTY_FILTERS, type Filters } from '$lib/components/table/FilterBar.svelte';
	import PdfExport from '$lib/components/table/PDFexport.svelte';
	import CsvExport from '$lib/components/table/CSVexport.svelte';
	import Pagination from '$lib/components/table/Pagination.svelte';
	import { normalize } from '$lib/utils/normalize';
	import { MediaQuery } from '$lib/utils/media.svelte';
	import type { Result } from '$lib/types';

	let {
		rows,
		loading = false,
		error = '',
		annee,
		initialSearch = '',
		autofocus = false,
		onSelect,
		onRetry
	}: {
		rows: Result[];
		loading?: boolean;
		error?: string;
		annee: number;
		initialSearch?: string;
		autofocus?: boolean;
		onSelect: (r: Result) => void;
		onRetry: () => void;
	} = $props();

	// ---- Recherche (debounce) + filtres ----
	let search = $state(initialSearch);
	let query = $state(normalize(initialSearch));
	let searchTimeout: ReturnType<typeof setTimeout>;
	function debounceSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => (query = normalize(search)), 150);
	}

	let filters = $state<Filters>({ ...EMPTY_FILTERS });

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
		void filtered;
		page = 1;
	});
	const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const pageRows = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	// ---- Impression : toute la liste filtrée, en tableau, le temps de l'impression ----
	let printing = $state(false);
	async function exportPdf() {
		printing = true;
		await tick();
		window.print();
		printing = false;
	}
	const shown = $derived(printing ? filtered : pageRows);

	// Tableau à partir de 768 px, cartes en dessous (côté serveur : tableau)
	const wide = new MediaQuery('(min-width: 768px)', true);
	const asTable = $derived(wide.current || printing);

	function keySelect(e: KeyboardEvent, r: Result) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(r);
		}
	}
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const SKELETON = [0, 1, 2, 3, 4, 5];
	const fmt = (n: number) => n.toLocaleString('fr-FR');
	const moy = (n: number) =>
		n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>

<section
	id="resultats"
	class="results"
	aria-busy={loading}
	aria-label="Liste des candidats {annee}"
>
	<FilterBar bind:search bind:filters onSearch={debounceSearch} {autofocus} />

	<div class="list-bar">
		<p class="count" aria-live="polite">
			{#if loading}
				Chargement…
			{:else if rows.length}
				<b class="num">{fmt(filtered.length)}</b>
				candidat{filtered.length > 1 ? 's' : ''}
				{#if filtered.length !== rows.length}sur {fmt(rows.length)}{/if}
			{/if}
		</p>
		<div class="list-actions">
			<CsvExport rows={filtered} {annee} />
			<PdfExport onExport={exportPdf} disabled={filtered.length === 0} />
		</div>
	</div>

	{#if error}
		<div class="notice" role="alert">
			<Icon name="wifi-off" size={28} />
			<strong>Les résultats {annee} n'ont pas pu être chargés.</strong>
			<span>{error}</span>
			<button class="button" type="button" onclick={onRetry}>Réessayer</button>
		</div>
	{:else if loading}
		<div aria-hidden="true">
			{#each SKELETON as i (i)}<div class="skeleton-row"></div>{/each}
		</div>
	{:else if filtered.length === 0}
		<div class="notice">
			<Icon name="file-search" size={28} />
			<strong>Aucun candidat ne correspond.</strong>
			<span>Vérifiez l'orthographe du nom ou retirez un filtre.</span>
		</div>
	{:else if asTable}
		<p class="print-title">Résultats du Baccalauréat {annee}, Madagascar (données fictives)</p>
		<div class="table-scroll">
			<table class="results-table">
				<thead>
					<tr>
						<th scope="col">Numéro</th>
						<th scope="col">Candidat</th>
						<th scope="col">Série</th>
						<th scope="col" class="lg">Lycée</th>
						<th scope="col">Résultat</th>
						<th scope="col">Mention</th>
						<th scope="col" class="moy">Moyenne</th>
					</tr>
				</thead>
				<tbody>
					{#each shown as item (item.id)}
						<tr
							tabindex="0"
							aria-label="Voir le relevé de {item.nom} {item.prenoms}"
							onclick={() => onSelect(item)}
							onkeydown={(e) => keySelect(e, item)}
						>
							<td class="numero">{item.numero}</td>
							<td class="name"><b>{item.nom}</b> {item.prenoms}</td>
							<td>{item.serie}</td>
							<td class="muted lg">{item.ecole}</td>
							<td><span class="statut-tag" data-statut={item.statut}>{cap(item.statut)}</span></td>
							<td class="mention">{item.mention || '—'}</td>
							<td class="moy">{moy(item.moyenne)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<ul class="result-rows">
			{#each shown as item (item.id)}
				<li>
					<button type="button" onclick={() => onSelect(item)}>
						<span class="name"><b>{item.nom}</b> {item.prenoms}</span>
						<span class="moy num">{moy(item.moyenne)}</span>
						<span class="meta num">N° {item.numero}, série {item.serie}</span>
						<span class="statut-tag" data-statut={item.statut}>{cap(item.statut)}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if !printing && !loading && !error && pageCount > 1}
		<Pagination bind:page {pageCount} total={filtered.length} pageSize={PAGE_SIZE} />
	{/if}
</section>
