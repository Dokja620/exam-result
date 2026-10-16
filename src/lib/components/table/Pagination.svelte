<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let {
		page = $bindable(1),
		pageCount,
		total,
		pageSize
	}: { page?: number; pageCount: number; total: number; pageSize: number } = $props();

	const from = $derived((page - 1) * pageSize + 1);
	const to = $derived(Math.min(page * pageSize, total));

	function go(p: number) {
		page = Math.min(Math.max(1, p || 1), pageCount);
		document.getElementById('resultats')?.scrollIntoView({ block: 'start' });
	}
</script>

<nav class="pagination" aria-label="Pagination">
	<p class="num">
		{from.toLocaleString('fr-FR')} à {to.toLocaleString('fr-FR')} sur {total.toLocaleString(
			'fr-FR'
		)}
	</p>
	<div class="pages">
		<button type="button" onclick={() => go(1)} disabled={page === 1} aria-label="Première page">
			<Icon name="chevrons-left" size={18} />
		</button>
		<button
			type="button"
			onclick={() => go(page - 1)}
			disabled={page === 1}
			aria-label="Page précédente"
		>
			<Icon name="chevron-left" size={18} />
		</button>
		<label>
			<input
				type="number"
				min="1"
				max={pageCount}
				value={page}
				aria-label="Numéro de page"
				onchange={(e) => go(Number(e.currentTarget.value))}
			/>
			/ {pageCount}
		</label>
		<button
			type="button"
			onclick={() => go(page + 1)}
			disabled={page === pageCount}
			aria-label="Page suivante"
		>
			<Icon name="chevron-right" size={18} />
		</button>
		<button
			type="button"
			onclick={() => go(pageCount)}
			disabled={page === pageCount}
			aria-label="Dernière page"
		>
			<Icon name="chevrons-right" size={18} />
		</button>
	</div>
</nav>
