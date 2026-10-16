<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Stats from '$lib/landing/stats.svelte';
	import Hero from '$lib/landing/hero.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Modal, { preloadResultCard } from '$lib/components/table/Modal.svelte';
	import { goto, invalidateAll, replaceState } from '$app/navigation';
	import { resultPath } from '$lib/utils/share';
	import { fmtInt } from '$lib/stats';
	import type { Result } from '$lib/types';

	let { data } = $props();

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

	// Vérification d'un numéro : une seule requête (mise en cache par le service worker)
	let checking = $state(false);
	async function checkNumero(numero: string) {
		const n = numero.trim();
		if (!n || checking) return;
		checking = true;
		try {
			// Le relevé (composant chargé à la demande) arrive en même temps que la réponse
			const [res] = await Promise.all([
				fetch(`/api/results?annee=${data.annee}&n=${encodeURIComponent(n)}`),
				preloadResultCard()
			]);
			if (res.ok) {
				selected = (await res.json()) as Result;
				notFound = '';
				syncUrl(n);
			} else if (res.status === 404) notFound = n;
			else throw new Error(`HTTP ${res.status}`);
		} catch {
			// Réseau indisponible : la page autonome (ou son cache hors-ligne) prend le relais
			goto(resultPath(data.annee, n));
		} finally {
			checking = false;
		}
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

	const total = $derived(data.meta.totaux[String(data.annee)] ?? 0);
</script>

<Seo
	title="Résultats du BAC {data.annee}, Madagascar"
	description="Consultez votre résultat au Baccalauréat {data.annee} à Madagascar par numéro de candidat, ou parcourez les résultats par nom, série, province et établissement."
	path="/"
/>

<div class="home wrap">
	<Hero
		annees={data.meta.annees}
		annee={data.annee}
		loading={checking}
		{notFound}
		examples={data.meta.examples?.[String(data.annee)]}
		onCheck={checkNumero}
		onYearChange={changeYear}
	/>

	<aside class="home-side">
		{#if data.stats}
			<Stats stats={data.stats} annee={data.annee} />
		{:else}
			<div class="notice" role="alert">
				<Icon name="wifi-off" size={24} />
				<strong>Les chiffres {data.annee} n'ont pas pu être chargés.</strong>
				<span>Vérifiez votre connexion puis réessayez.</span>
				<button class="button ghost" type="button" onclick={() => invalidateAll()}>Réessayer</button
				>
			</div>
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
