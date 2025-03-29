<script>
	const examsInfo = [
		{
			title: 'Exam type',
			value: ['CEPE', 'BEPC', 'BAC'],
			desc: 'BEPC, CEPE, BAC'
		},
		{
			title: 'Année',
			value: ['2025', '2024', '2023'],
			desc: 'BEPC, CEPE, BAC'
		},
		{
			title: 'Centre',
			value: ['Antananarivo', 'Majunga', 'Tulear'],
			desc: 'BEPC, CEPE, BAC'
		}
	];
</script>

<section id="advanced-search">
	<div class="content" data-screenshift>
		<div id="search">
			{#each examsInfo as item, index}
				<select class="select select-lg select-ghost">
					<option selected disabled>{item.title}</option>
					{#each item.value as value, valueIndex}
						<option data-index={valueIndex}>{value}</option>
					{/each}
				</select>
			{/each}
			<button class="btn btn-primary">Rechercer</button>
		</div>
	</div>
	<div class="divider"></div>
</section>
