<script lang="ts">
	import 'iconify-icon';
	const data = [
		{
			matricule: '61255-ZYOP',
			serie: 'A1',
			fullName: 'Rasolofoson Finaritra Hasina',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'passable',
			rating: '4'
		},
		{
			matricule: '85462-ZYOP',
			serie: 'A1',
			fullName: 'Raharimanana Andry Haja',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'assez bien',
			rating: '2'
		},
		{
			matricule: '54688-ZYOP',
			serie: 'A1',
			fullName: 'Andrianarivo Tovo Fanilo Hery',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'non admis',
			mention: 'null',
			rating: '0'
		},
		{
			matricule: '54856-ZYOP',
			serie: 'A1',
			fullName: 'Rakotoarisoa Tovo Fitiavana',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'très bien',
			rating: '1'
		}
	];
	let modal: any;

	function openModal() {
		modal.showModal();
	}
	let filterIsFilled: boolean = true;

	let filter = { examYear: 2023, examCisco: 'Antananarivo' };
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
				{#each data as item, index}
					<tr data-index={index} on:click={openModal}>
						<td data-cell="matricule"><p>{item.matricule}</p></td>
						<td data-cell="serie"><p>{item.serie}</p></td>
						<td data-cell="nom et prénoms"><p>{item.fullName}</p></td>
						<td data-cell="CISCO"><p>{item.cisco}</p></td>
						<td data-cell="école d'origine"><p>{item.school}</p></td>
						<td data-cell="observation" data-result={item.observation}><p>{item.observation}</p></td
						>
						<td data-cell="mention" data-rating={item.rating}><p>{item.mention}</p></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<dialog bind:this={modal} id="exam-result" class="modal">
	<div class="modal-box">
		{#if data[1].rating != '0'}
			<h3>🎉 Félicitations !</h3>
			<div class="result-overview">
				<div class="icon">
					<iconify-icon icon="solar:diploma-bold" style="font-size: 100px;"></iconify-icon>
				</div>
				<div class="info">
					<h4>{data[1].fullName}</h4>
					<h4>{data[1].mention}</h4>
				</div>
			</div>
			<div class="modal-content">
				<div class="text">
					<p>Vous avez brillamment réussi le BAC 2023 !</p>
					<p>
						Nous vous souhaitons une réussite éclatante dans vos études et dans la vie. Continuez à
						viser haut, et sachez que nous espérons vous voir triompher encore l'année prochaine,
						encore plus fort et déterminé !
					</p>
				</div>
				<div class="actions">
					<button class="btn btn-base" aria-label="share button">
						<iconify-icon icon="solar:share-line-duotone" style="font-size: 20px"></iconify-icon>
						<p>Partagez votre succès</p>
					</button>
					<button class="btn btn-base" aria-label="share button">
						<iconify-icon icon="solar:pen-new-round-line-duotone" style="font-size: 20px"
						></iconify-icon>
						<p>Obtenez votre relevé</p>
					</button>
				</div>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
