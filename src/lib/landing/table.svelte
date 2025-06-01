<script lang="ts">
	import 'iconify-icon';
	import FilterBar from '$lib/components/table/FilterBar.svelte';
	import PdFexport from '$lib/components/table/PDFexport.svelte';
	export let examResults;
</script>

<section id="table">
	<div class="actions" data-screenshift>
		<FilterBar />
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
					<tr>
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
