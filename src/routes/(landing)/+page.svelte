<script lang="ts">
	import Stats from '$lib/landing/stats.svelte';
	import Hero from '$lib/landing/hero.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/table/Modal.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { resultPath } from '$lib/utils/share';
	import { YearData } from '$lib/utils/dataset.svelte';
	import { fmtInt } from '$lib/stats';
	import type { Result } from '$lib/types';

	let { data } = $props();

	// Jeu de données de l'année : sert aux chiffres et à la vérification hors-ligne
	const ds = new YearData();
	$effect(() => {
		if (browser) ds.load(data.annee);
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

	function checkNumero(numero: string) {
		const n = numero.trim();
		if (!n) return;
		if (!ds.rows.length) {
			// Données pas encore là : la page autonome répond côté serveur
			goto(resultPath(data.annee, n));
			return;
		}
		const r = ds.rows.find((x) => x.numero === n);
		if (r) {
			selected = r;
			notFound = '';
			syncUrl(r.numero);
		} else notFound = n;
	}

	function closeModal() {
		selected = null;
		syncUrl(null);
	}

	function changeYear(annee: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('annee', String(annee));
		url.searchParams.delete('n');
		goto(url, { keepFocus: true, noScroll: true });
	}

	const total = $derived(data.meta.totaux[String(data.annee)] ?? ds.rows.length);
</script>

<svelte:head>
	<title>Résultats du BAC {data.annee}, Madagascar</title>
	<meta
		name="description"
		content="Consultez votre résultat au Baccalauréat {data.annee} à Madagascar par numéro de candidat, ou parcourez les résultats par nom, série, province et établissement."
	/>
</svelte:head>

<div class="home wrap">
	<Hero
		annees={data.meta.annees}
		annee={data.annee}
		loading={ds.loading && !ds.error}
		{notFound}
		onCheck={checkNumero}
		onYearChange={changeYear}
	/>

	<aside class="home-side">
		{#if ds.rows.length}
			<Stats rows={ds.rows} annee={data.annee} />
		{:else if ds.error}
			<div class="notice" role="alert">
				<Icon name="wifi-off" size={24} />
				<strong>Les chiffres {data.annee} n'ont pas pu être chargés.</strong>
				<span>{ds.error}</span>
				<button class="button ghost" type="button" onclick={() => ds.load(data.annee)}
					>Réessayer</button
				>
			</div>
		{:else}
			<div class="overview-skeleton" aria-hidden="true"></div>
		{/if}

		<nav class="explore" aria-label="Explorer les résultats">
			<a href="/liste/{data.annee}">
				<span>
					<b>Parcourir tous les résultats</b>
					<small
						>{total ? `${fmtInt(total)} candidats` : 'Tous les candidats'}, recherche et filtres</small
					>
				</span>
				<Icon name="arrow-right" size={20} />
			</a>
			<a href="/etablissements/{data.annee}">
				<span>
					<b>Classement des lycées</b>
					<small>Taux de réussite et admis par établissement</small>
				</span>
				<Icon name="arrow-right" size={20} />
			</a>
		</nav>
	</aside>
</div>

<Modal {selected} annee={data.annee} onClose={closeModal} />
