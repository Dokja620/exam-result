<script>
	import Table from '$lib/landing/table.svelte';
	let { data } = $props();
</script>

<div id="title" data-screenshift>
	<h4>Résultat du Baccalauréat - Antananarivo - 2025</h4>
</div>

<Table examResults={data.results} />
