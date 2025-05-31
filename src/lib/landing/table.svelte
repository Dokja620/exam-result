<script lang="ts">
	import 'iconify-icon';
	import { onMount } from 'svelte';
	let results: Results[] = $state();
	onMount(async () => {
		try {
			const response = await fetch('/api/results');
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.details || `Server responded with : ${response.status}`);
			}
			const fetchedResults: Results[] = await response.json();
			results = fetchedResults;
			console.log('Houses successfully fetched into Swiper');
		} catch (err: any) {
			console.log('Something went wrong');
		}
	});

	let modal: any;

	function openModal() {
		modal.showModal();
	}
	let filterIsFilled: boolean = true;

	let filter = { examYear: 2025, examCisco: 'Antananarivo' };
</script>

<section id="table">
	<div class="content" data-screenshift>
		<section id="table-actions">
			{#if filterIsFilled}
				<div class="content">
					<h3 class="title">Résultat du Baccalauréat - {filter.examCisco} - {filter.examYear}</h3>

					<div class="actions">
						<fieldset class="fieldset">
							<label class="input">
								<iconify-icon icon="tabler:search" class="text-lg"></iconify-icon>
								<input type="search" class="grow" placeholder="Rechercher" />
							</label>
							<p class="fieldset-label">Recherchez par matricule, nom, série, école ou mention</p>
						</fieldset>
						<div class="export">
							<button class="btn btn-secondary" aria-label="download pdf button">
								<iconify-icon icon="ph:file-pdf" style="font-size: 30px"></iconify-icon>
								Exporter en PDF
							</button>
						</div>
					</div>
				</div>
			{/if}
		</section>

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
				{#each results as item (item.id)}
					<tr onclick={openModal}>
						<td data-cell="matricule"><p>{item.matricule}</p></td>
						<td data-cell="serie"><p>{item.serie}</p></td>
						<td data-cell="nom et prénoms"><p>{item.last_name} {item.first_name}</p></td>
						<td data-cell="CISCO"><p>{item.CISCO}</p></td>
						<td data-cell="école d'origine"><p>{item.school}</p></td>
						<td data-cell="observation" data-result={item.observation}><p>{item.observation}</p></td
						>
						<td data-cell="mention"><p>{item.mention}</p></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
