<script lang="ts">
	import Table from '$lib/landing/table.svelte';
	import Stats from '$lib/landing/stats.svelte';
	import QuickCheck from '$lib/landing/quickCheck.svelte';
	import Modal from '$lib/components/table/Modal.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { Dataset, Result } from '$lib/types';

	let { data } = $props();

	// ---- Jeu de données de l'année courante (chargé côté client, mis en cache) ----
	const cache = new Map<number, Result[]>();
	let rows = $state<Result[]>([]);
	let loading = $state(false);
	let loadError = $state('');

	async function loadYear(annee: number) {
		const hit = cache.get(annee);
		if (hit) {
			rows = hit;
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
			loadError = `Impossible de charger les résultats ${annee}. Vérifiez votre connexion puis réessayez.`;
			console.error(e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (browser) loadYear(data.annee);
	});

	// ---- Candidat sélectionné (modal) + URL partageable ?n= ----
	let selected = $state<Result | null>(data.candidat);
	let notFound = $state('');

	$effect(() => {
		// Ouverture directe via lien partagé
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
	<title>Résultats du BAC {data.annee} – Madagascar</title>
	<meta
		name="description"
		content="Consultez les résultats du Baccalauréat {data.annee} à Madagascar : recherche par numéro de candidat ou par nom, statistiques par série et par province."
	/>
</svelte:head>

<div id="title" data-screenshift>
	<h4>Résultat du Baccalauréat - Madagascar - {data.annee}</h4>
	<QuickCheck
		annees={data.meta.annees}
		annee={data.annee}
		{loading}
		{notFound}
		onCheck={checkNumero}
		onYearChange={changeYear}
	/>
</div>

{#if loadError}
	<div class="alert alert-error" role="alert" data-screenshift>
		<p>{loadError}</p>
		<button class="btn btn-sm" onclick={() => loadYear(data.annee)}>Réessayer</button>
	</div>
{/if}

<Stats {rows} annee={data.annee} />

<Table {rows} {loading} annee={data.annee} onSelect={select} />

<Modal {selected} annee={data.annee} onClose={closeModal} />
