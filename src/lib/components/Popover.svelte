<script lang="ts">
	/**
	 * Panneau ancré : popover sous son bouton à partir de 768 px, feuille en bas d'écran en
	 * dessous. <dialog> modal natif : focus piégé, `Esc` ferme, le focus revient au bouton.
	 * Utilisé par les filtres de la liste et par le menu de partage du relevé.
	 */
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { MediaQuery } from '$lib/utils/media.svelte';

	let {
		id,
		title,
		width = 400,
		align = 'end',
		class: klass = '',
		open = $bindable(false),
		children,
		footer
	}: {
		id: string;
		title: string;
		/** Largeur du popover (px, ≥ 768) */
		width?: number;
		/** Bord du bouton sur lequel s'aligne le popover */
		align?: 'start' | 'end';
		class?: string;
		open?: boolean;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let anchorEl: HTMLElement | null = null;
	// Hauteur max : place restante sous le haut du panneau
	let pos = $state({ top: 0, left: 0, width: 400 });

	const wide = new MediaQuery('(min-width: 768px)', true);

	// Sous le bouton ; au-dessus s'il n'y a pas la place en bas (bouton en bas d'écran)
	function place() {
		if (!anchorEl) return;
		const r = anchorEl.getBoundingClientRect();
		const w = Math.min(width, window.innerWidth - 32);
		const left = align === 'end' ? r.right - w : r.left;
		const h = dialog?.querySelector('.pop-panel')?.getBoundingClientRect().height ?? 0;
		const below = window.innerHeight - r.bottom - 24;
		const top = h > below && r.top - 24 > below ? Math.max(16, r.top - 8 - h) : r.bottom + 8;
		pos = {
			top: Math.round(top),
			left: Math.round(Math.min(Math.max(16, left), window.innerWidth - w - 16)),
			width: w
		};
	}

	export function show(anchor: HTMLElement) {
		if (!dialog || dialog.open) return;
		anchorEl = anchor;
		place();
		dialog.showModal();
		open = true;
		place(); // hauteur réelle connue une fois ouvert
	}
	export function hide() {
		dialog?.close();
	}

	// Clic sur le fond : la zone hors du panneau appartient au <dialog> lui-même
	function onClick(e: MouseEvent) {
		if (e.target === dialog) hide();
	}
</script>

<svelte:window onresize={() => open && place()} />

<dialog
	bind:this={dialog}
	{id}
	class="pop {klass}"
	class:is-sheet={!wide.current}
	aria-labelledby="{id}-titre"
	style="--top: {pos.top}px; --left: {pos.left}px; --w: {pos.width}px"
	onclick={onClick}
	onclose={() => (open = false)}
>
	<div class="pop-panel">
		<header class="pop-head">
			<span class="grip" aria-hidden="true"></span>
			<h2 id="{id}-titre">{title}</h2>
			<button class="pop-close" type="button" aria-label="Fermer" onclick={hide}>
				<Icon name="x" size={18} />
			</button>
		</header>
		<div class="pop-body">
			{@render children()}
		</div>
		{#if footer}
			<footer class="pop-foot">
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
