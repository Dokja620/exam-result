<script lang="ts">
	import 'iconify-icon';

	let {
		page = $bindable(1),
		pageCount,
		total,
		pageSize
	}: { page?: number; pageCount: number; total: number; pageSize: number } = $props();

	const from = $derived((page - 1) * pageSize + 1);
	const to = $derived(Math.min(page * pageSize, total));

	function go(p: number) {
		page = Math.min(Math.max(1, p), pageCount);
		document.getElementById('table')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}
</script>

<nav class="pagination" aria-label="Pagination" data-screenshift>
	<p>
		{from.toLocaleString('fr-FR')}–{to.toLocaleString('fr-FR')} sur {total.toLocaleString('fr-FR')}
	</p>
	<div class="join">
		<button
			class="btn btn-sm join-item"
			onclick={() => go(1)}
			disabled={page === 1}
			aria-label="Première page"
		>
			<iconify-icon icon="tabler:chevrons-left"></iconify-icon>
		</button>
		<button
			class="btn btn-sm join-item"
			onclick={() => go(page - 1)}
			disabled={page === 1}
			aria-label="Page précédente"
		>
			<iconify-icon icon="tabler:chevron-left"></iconify-icon>
		</button>
		<label class="btn btn-sm join-item page-input">
			Page
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
			class="btn btn-sm join-item"
			onclick={() => go(page + 1)}
			disabled={page === pageCount}
			aria-label="Page suivante"
		>
			<iconify-icon icon="tabler:chevron-right"></iconify-icon>
		</button>
		<button
			class="btn btn-sm join-item"
			onclick={() => go(pageCount)}
			disabled={page === pageCount}
			aria-label="Dernière page"
		>
			<iconify-icon icon="tabler:chevrons-right"></iconify-icon>
		</button>
	</div>
</nav>
