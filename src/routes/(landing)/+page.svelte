<script lang="ts">
	import Table from '$lib/landing/table.svelte';
	import Stats from '$lib/landing/stats.svelte';
	import Hero from '$lib/landing/hero.svelte';
	import Modal from '$lib/components/table/Modal.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { resultPath } from '$lib/utils/share';
	import type { Dataset, Result } from '$lib/types';

	let { data } = $props();

	// ---- Jeu de données de l'année courante (chargé côté client, mis en cache) ----
	const cache = new Map<number, Result[]>();
	let rows = $state<Result[]>([]);
	let loading = $state(true);
	let loadError = $state('');

	async function loadYear(annee: number) {
		const hit = cache.get(annee);
		if (hit) {
			rows = hit;
			loading = false;
			return;
		}
		loading = true;
		loadError = '';
		try {
			const url = `/api/results?annee=${annee}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			// Copie dans le cache hors-ligne (même cache que le service worker), utile dès
			// la première visite, avant que le service worker ne contrôle la page.
			if ('caches' in window) {
				caches
					.open('results-data-v1')
					.then((c) => c.put(url, res.clone()))
					.catch(() => undefined);
			}
			const ds: Dataset = await res.json();
			cache.set(annee, ds.results);
			rows = ds.results;
		} catch (e) {
			loadError = 'Vérifiez votre connexion puis réessayez.';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (browser) loadYear(data.annee);
	});

	// ---- Candidat sélectionné (modale) + URL partageable ?n= ----
	let selected = $state<Result | null>(data.candidat);
	let notFound = $state('');

	$effect(() => {
		selected = data.candidat;
		notFound = data.introuvable ? data.numero : '';
	});

	function syncUrl(numero: string | null) {
		const url = new URL(window.location.href);
		if (numero) url.searchParams.set('n', numero);
		else url.searchParams.delete('n');
		url.searchParams.set('annee', String(data.annee));
		replaceState(url, {});
	}

	function select(r: Result) {
		selected = r;
		notFound = '';
		syncUrl(r.numero);
	}

	function closeModal() {
		selected = null;
		syncUrl(null);
	}

	function checkNumero(numero: string) {
		const n = numero.trim();
		if (!n) return;
		if (!rows.length) {
			// Données pas encore là : la page autonome répond côté serveur
			goto(resultPath(data.annee, n));
			return;
		}
		const r = rows.find((x) => x.numero === n);
		if (r) select(r);
		else notFound = n;
	}

	function changeYear(annee: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('annee', String(annee));
		url.searchParams.delete('n');
		goto(url, { keepFocus: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>Résultats du BAC {data.annee}, Madagascar</title>
	<meta
		name="description"
		content="Consultez votre résultat au Baccalauréat {data.annee} à Madagascar par numéro de candidat, ou parcourez les résultats par nom, série, province et établissement."
	/>
</svelte:head>

<Hero
	annees={data.meta.annees}
	annee={data.annee}
	{loading}
	{notFound}
	onCheck={checkNumero}
	onYearChange={changeYear}
/>

{#if rows.length}
	<Stats {rows} annee={data.annee} />
{/if}

<Table
	{rows}
	{loading}
	error={loadError}
	annee={data.annee}
	onSelect={select}
	onRetry={() => loadYear(data.annee)}
/>

<Modal {selected} annee={data.annee} onClose={closeModal} />
