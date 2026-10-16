<script lang="ts" module>
	export interface Filters {
		serie: string;
		province: string;
		statut: string;
		mention: string;
	}
</script>

<script lang="ts">
	import 'iconify-icon';
	import { MENTIONS, PROVINCES, SERIES, STATUTS } from '$lib/types';

	let {
		search = $bindable(''),
		filters = $bindable<Filters>({ serie: '', province: '', statut: '', mention: '' }),
		onSearch
	}: { search?: string; filters?: Filters; onSearch: () => void } = $props();

	const active = $derived(Object.values(filters).some(Boolean));

	function reset() {
		filters = { serie: '', province: '', statut: '', mention: '' };
		search = '';
		onSearch();
	}
</script>

<div class="filters">
	<fieldset class="fieldset">
		<label class="input">
			<iconify-icon icon="tabler:search" class="text-lg"></iconify-icon>
			<input
				type="search"
				bind:value={search}
				oninput={onSearch}
				class="grow"
				placeholder="Rechercher"
				aria-label="Rechercher par numéro de candidat, nom ou prénoms"
				autocomplete="off"
			/>
		</label>
		<p class="fieldset-label">Recherchez par Numéro, Nom et Prénoms</p>
	</fieldset>

	<div class="selects" role="group" aria-label="Filtres">
		<label>
			<span class="sr-only">Série</span>
			<select class="select select-sm" bind:value={filters.serie}>
				<option value="">Toutes séries</option>
				{#each SERIES as s (s)}<option value={s}>Série {s}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Province</span>
			<select class="select select-sm" bind:value={filters.province}>
				<option value="">Toutes provinces</option>
				{#each PROVINCES as p (p)}<option value={p}>{p}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Observation</span>
			<select class="select select-sm" bind:value={filters.statut}>
				<option value="">Tous statuts</option>
				{#each STATUTS as s (s)}<option value={s}>{s}</option>{/each}
			</select>
		</label>
		<label>
			<span class="sr-only">Mention</span>
			<select class="select select-sm" bind:value={filters.mention}>
				<option value="">Toutes mentions</option>
				{#each MENTIONS as m (m)}<option value={m}>{m}</option>{/each}
			</select>
		</label>
		{#if active || search}
			<button class="btn btn-ghost btn-sm" type="button" onclick={reset}>
				<iconify-icon icon="tabler:x"></iconify-icon> Réinitialiser
			</button>
		{/if}
	</div>
</div>
