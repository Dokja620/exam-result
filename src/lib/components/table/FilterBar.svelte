<script lang="ts" module>
	export interface Filters {
		serie: string;
		province: string;
		statut: string;
		mention: string;
	}
	export const EMPTY_FILTERS: Filters = { serie: '', province: '', statut: '', mention: '' };
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { MENTIONS, PROVINCES, SERIES, STATUTS } from '$lib/types';

	let {
		search = $bindable(''),
		filters = $bindable<Filters>({ ...EMPTY_FILTERS }),
		autofocus = false,
		onSearch
	}: { search?: string; filters?: Filters; autofocus?: boolean; onSearch: () => void } = $props();

	let input: HTMLInputElement | undefined = $state();
	$effect(() => {
		if (autofocus) input?.focus();
	});
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const active = $derived(Object.values(filters).some(Boolean) || search !== '');

	function reset() {
		filters = { ...EMPTY_FILTERS };
		search = '';
		onSearch();
		input?.focus();
	}

	// « / » focalise la recherche (sauf dans un champ de saisie)
	function onKey(e: KeyboardEvent) {
		if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
		e.preventDefault();
		input?.focus();
		input?.select();
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="filterbar">
	<div class="search">
		<Icon name="search" size={18} />
		<input
			bind:this={input}
			type="search"
			bind:value={search}
			oninput={onSearch}
			placeholder="Numéro, nom ou prénoms"
			aria-label="Rechercher par numéro de candidat, nom ou prénoms"
			autocomplete="off"
		/>
		<kbd aria-hidden="true">/</kbd>
	</div>

	<div class="selects" role="group" aria-label="Filtres">
		<label>
			<span class="sr-only">Série</span>
			<select class="field-select" bind:value={filters.serie}>
				<option value="">Toutes séries</option>
				{#each SERIES as s (s)}<option value={s}>Série {s}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Province</span>
			<select class="field-select" bind:value={filters.province}>
				<option value="">Toutes provinces</option>
				{#each PROVINCES as p (p)}<option value={p}>{p}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Résultat</span>
			<select class="field-select" bind:value={filters.statut}>
				<option value="">Tous résultats</option>
				{#each STATUTS as s (s)}<option value={s}>{cap(s)}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Mention</span>
			<select class="field-select" bind:value={filters.mention}>
				<option value="">Toutes mentions</option>
				{#each MENTIONS as m (m)}<option value={m}>{cap(m)}</option>{/each}
			</select>
		</label>
		{#if active}
			<button class="reset" type="button" onclick={reset}>
				<Icon name="x" size={16} /> Tout effacer
			</button>
		{/if}
	</div>
</div>
