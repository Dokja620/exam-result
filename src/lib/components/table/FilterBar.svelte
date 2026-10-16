<script lang="ts" module>
	import { MENTIONS, PROVINCES, SERIES, STATUTS } from '$lib/types';

	export interface Filters {
		serie: string;
		province: string;
		statut: string;
		mention: string;
	}
	export const EMPTY_FILTERS: Filters = { serie: '', province: '', statut: '', mention: '' };
	export const FILTER_KEYS = ['serie', 'province', 'statut', 'mention'] as const;

	/** Valeurs admises par filtre : sert aussi à valider la query string (`?serie=…`). */
	export const FILTER_OPTIONS: Record<keyof Filters, readonly string[]> = {
		serie: SERIES,
		province: PROVINCES,
		statut: STATUTS,
		mention: MENTIONS
	};

	export function filtersFromParams(params: URLSearchParams): Filters {
		const f = { ...EMPTY_FILTERS };
		for (const k of FILTER_KEYS) {
			const v = params.get(k) ?? '';
			if (FILTER_OPTIONS[k].includes(v)) f[k] = v;
		}
		return f;
	}
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { MediaQuery } from '$lib/utils/media.svelte';

	let {
		search = $bindable(''),
		filters = $bindable<Filters>({ ...EMPTY_FILTERS }),
		count = 0,
		autofocus = false,
		onSearch
	}: {
		search?: string;
		filters?: Filters;
		count?: number;
		autofocus?: boolean;
		onSearch: () => void;
	} = $props();

	let input: HTMLInputElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let open = $state(false);
	let anchor = $state({ top: 0, left: 0 });

	$effect(() => {
		if (autofocus) input?.focus();
	});

	// Popover ancré au bouton à partir de 768 px, feuille en bas d'écran en dessous
	const wide = new MediaQuery('(min-width: 768px)', true);

	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const GROUPS: {
		key: keyof Filters;
		legend: string;
		all: string;
		label: (v: string) => string;
	}[] = [
		{ key: 'serie', legend: 'Série', all: 'Toutes', label: (v) => v },
		{ key: 'province', legend: 'Province', all: 'Toutes', label: (v) => v },
		{ key: 'statut', legend: 'Résultat', all: 'Tous', label: cap },
		{ key: 'mention', legend: 'Mention', all: 'Toutes', label: cap }
	];
	const chipLabel: Record<keyof Filters, (v: string) => string> = {
		serie: (v) => `Série ${v}`,
		province: (v) => v,
		statut: cap,
		mention: (v) => `Mention ${v}`
	};

	const chips = $derived(
		FILTER_KEYS.filter((k) => filters[k]).map((k) => ({ key: k, label: chipLabel[k](filters[k]) }))
	);
	const fmt = (n: number) => n.toLocaleString('fr-FR');

	function place() {
		if (!trigger) return;
		const r = trigger.getBoundingClientRect();
		const width = Math.min(440, window.innerWidth - 32);
		anchor = {
			top: Math.round(r.bottom + 8),
			left: Math.round(Math.min(Math.max(16, r.right - width), window.innerWidth - width - 16))
		};
	}

	function show() {
		if (!dialog) return;
		place();
		dialog.showModal();
		open = true;
	}
	function hide() {
		dialog?.close();
	}

	// Clic sur le fond (la zone hors du panneau appartient au <dialog> lui-même)
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) hide();
	}

	function removeFilter(k: keyof Filters) {
		filters[k] = '';
		trigger?.focus();
	}
	function resetFilters() {
		filters = { ...EMPTY_FILTERS };
	}
	function clearAll() {
		resetFilters();
		search = '';
		onSearch();
		input?.focus();
	}

	// « / » focalise la recherche (sauf dans un champ de saisie)
	function onKey(e: KeyboardEvent) {
		if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || open) return;
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
		e.preventDefault();
		input?.focus();
		input?.select();
	}
</script>

<svelte:window onkeydown={onKey} onresize={() => open && place()} />

<div class="filterbar">
	<div class="filterbar-row">
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

		<button
			bind:this={trigger}
			class="filters-trigger"
			type="button"
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls="filtres-dialog"
			aria-label={chips.length
				? `Filtres, ${chips.length} actif${chips.length > 1 ? 's' : ''}`
				: 'Filtres'}
			onclick={show}
		>
			<Icon name="adjustments" size={18} />
			<span class="txt">Filtres</span>
			{#if chips.length}<span class="n-actifs num" aria-hidden="true">{chips.length}</span>{/if}
		</button>
	</div>

	{#if chips.length}
		<ul class="chips" aria-label="Filtres actifs">
			{#each chips as c (c.key)}
				<li>
					<button
						class="chip"
						type="button"
						onclick={() => removeFilter(c.key)}
						aria-label="Retirer le filtre {c.label}"
					>
						{c.label}
						<Icon name="x" size={14} />
					</button>
				</li>
			{/each}
			<li>
				<button class="chip-clear" type="button" onclick={clearAll}>Tout effacer</button>
			</li>
		</ul>
	{/if}
</div>

<dialog
	bind:this={dialog}
	id="filtres-dialog"
	class="filters-dialog"
	class:sheet={!wide.current}
	aria-labelledby="filtres-titre"
	style="--top: {anchor.top}px; --left: {anchor.left}px"
	onclick={onDialogClick}
	onclose={() => (open = false)}
>
	<div class="panel">
		<header>
			<span class="grip" aria-hidden="true"></span>
			<h2 id="filtres-titre">Filtres</h2>
			<button class="close" type="button" aria-label="Fermer les filtres" onclick={hide}>
				<Icon name="x" size={18} />
			</button>
		</header>

		<div class="groups">
			{#each GROUPS as g (g.key)}
				<fieldset>
					<legend>{g.legend}</legend>
					<div class="opts">
						<label class="opt">
							<input type="radio" name="f-{g.key}" value="" bind:group={filters[g.key]} />
							<span>{g.all}</span>
						</label>
						{#each FILTER_OPTIONS[g.key] as v (v)}
							<label class="opt">
								<input type="radio" name="f-{g.key}" value={v} bind:group={filters[g.key]} />
								<span>{g.label(v)}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{/each}
		</div>

		<footer>
			<button class="button text" type="button" onclick={resetFilters} disabled={!chips.length}>
				Réinitialiser
			</button>
			<button class="button" type="button" onclick={hide}>
				Voir {fmt(count)} résultat{count > 1 ? 's' : ''}
			</button>
		</footer>
	</div>
</dialog>
