<script lang="ts">
	import 'iconify-icon';
	import FilterBar from '$lib/components/table/FilterBar.svelte';
	import PdFexport from '$lib/components/table/PDFexport.svelte';
	import Modal from '$lib/components/table/Modal.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { examResults } = $props();

	let search = $state($page.url.searchParams.get('search') || '');

	// Function to handle search
	async function handleSearch() {
		const url = new URL(window.location.href);
		if (search.trim()) {
			url.searchParams.set('search', search.trim());
		} else {
			url.searchParams.delete('search');
		}
		await goto(url.toString());
	}

	// Debounce search to avoid too many requests
	let searchTimeout: number;
	function debounceSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(handleSearch, 100);
	}

	let selectedItem = $state(null);

	function openModal(item: any) {
		selectedItem = item;
		// @ts-ignore
		document.getElementById('selected-modal').showModal();
	}
</script>

<section id="table">
	<div id="table-actions" data-screenshift>
		<FilterBar bind:search onSearch={debounceSearch} />
		<PdFexport />
	</div>
	<div class="content" data-screenshift>
		<table>
			<thead>
				<tr>
					<th>Matricule</th>
					<th>Serie</th>
					<th>Nom et Prénoms</th>
					<th>CISCO</th>
					<th>Ecole</th>
					<th>Observation</th>
					<th>Mention</th>
				</tr>
			</thead>
			<tbody>
				{#each examResults as item (item.id)}
					<tr onclick={() => openModal(item)}>
						<td data-cell="matricule"><p>{item.matricule}</p></td>
						<td data-cell="serie"><p>{item.serie}</p></td>
						<td data-cell="nom et prénoms"
							><p><span>{item.last_name}</span> {item.first_name}</p></td
						>
						<td data-cell="CISCO"><p>{item.CISCO}</p></td>
						<td data-cell="école d'origine"><p>{item.school}</p></td>
						<td data-cell="observation" data-result={item.observation}><p>{item.observation}</p></td
						>
						<td data-mention={item.mention} data-cell="mention"><p>{item.mention}</p></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
<Modal {selectedItem} />
