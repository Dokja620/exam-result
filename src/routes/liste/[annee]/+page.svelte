<script lang="ts">
	import ResultsList from '$lib/components/table/ResultsList.svelte';
	import Modal from '$lib/components/table/Modal.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { YearData } from '$lib/utils/dataset.svelte';
	import type { Result } from '$lib/types';

	let { data } = $props();

	const ds = new YearData();
	$effect(() => {
		if (browser) ds.load(data.annee);
	});

	let selected = $state<Result | null>(data.candidat);
	$effect(() => {
		selected = data.candidat;
	});

	function syncUrl(numero: string | null) {
		const url = new URL(window.location.href);
		if (numero) url.searchParams.set('n', numero);
		else url.searchParams.delete('n');
		url.searchParams.delete('focus');
		replaceState(url, {});
	}

	function select(r: Result) {
		selected = r;
		syncUrl(r.numero);
	}
	function closeModal() {
		selected = null;
		syncUrl(null);
	}

	const years = $derived([...data.meta.annees].sort((a, b) => b - a));
</script>

<svelte:head>
	<title>Tous les résultats du BAC {data.annee}, Madagascar</title>
	<meta
		name="description"
		content="Liste des candidats au BAC {data.annee} à Madagascar : recherche par nom ou numéro, filtres par série, province, résultat et mention."
	/>
</svelte:head>

<div class="browse wrap">
	<header class="page-head">
		<h1>Tous les résultats</h1>
		<label class="year">
			<span class="sr-only">Session</span>
			<select
				class="field-select"
				value={data.annee}
				onchange={(e) => goto(`/liste/${e.currentTarget.value}`)}
			>
				{#each years as a (a)}<option value={a}>BAC {a}</option>{/each}
			</select>
		</label>
	</header>

	<ResultsList
		rows={ds.rows}
		loading={ds.loading}
		error={ds.error}
		annee={data.annee}
		initialSearch={data.q}
		initialFilters={data.filters}
		autofocus={data.focus}
		onSelect={select}
		onRetry={() => ds.load(data.annee)}
	/>
</div>

<Modal {selected} annee={data.annee} onClose={closeModal} />
