<script>
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
			rating: '1'
		},
		{
			matricule: '85462-ZYOP',
			serie: 'A1',
			fullName: 'Raharimanana Andry Haja',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'assez bien',
			rating: '1'
		},
		{
			matricule: '54688-ZYOP',
			serie: 'A1',
			fullName: 'Andrianarivo Tovo Fanilo Hery',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'très bien',
			rating: '1'
		},
		{
			matricule: '54856-ZYOP',
			serie: 'A1',
			fullName: 'Rakotoarisoa Tovo Fitiavana',
			cisco: 'Morondava',
			school: 'School_5',
			observation: 'admis',
			mention: 'null',
			rating: '1'
		}
	];
</script>

<section id="table">
	<div class="content" data-screenshift>
		<table>
			<caption>
				<div class="caption">
					<p>Resultats BEPC - 2023 - Antananarivo</p>
					<div class="table-actions">
						<ul>
							<li>
								<button class="btn btn-sm btn-ghost" aria-label="export excel">
									<iconify-icon icon="vscode-icons:file-type-excel" style="font-size: 30px"
									></iconify-icon>
								</button>
							</li>
							<li>
								<button class="btn btn-sm btn-ghost" aria-label="share on social media">
									<iconify-icon icon="material-icon-theme:pdf" style="font-size: 30px"
									></iconify-icon>
								</button>
							</li>
						</ul>
					</div>
				</div>
			</caption>
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
					<tr data-index={index}>
						<td data-cell="matricule"><p>{item.matricule}</p></td>
						<td data-cell="serie"><p>{item.serie}</p></td>
						<td data-cell="nom et prénoms"><p>{item.fullName}</p></td>
						<td data-cell="CISCO"><p>{item.cisco}</p></td>
						<td data-cell="école d'origine"><p>{item.school}</p></td>
						<td data-cell="observation"><p>{item.observation}</p></td>
						<td data-cell="mention" data-rating={item.rating}><p>{item.mention}</p></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
