<script lang="ts">
	import 'iconify-icon';

	let {
		annees,
		annee,
		loading = false,
		notFound = '',
		onCheck,
		onYearChange
	}: {
		annees: number[];
		annee: number;
		loading?: boolean;
		notFound?: string;
		onCheck: (numero: string) => void;
		onYearChange: (annee: number) => void;
	} = $props();

	let numero = $state('');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		onCheck(numero);
	}
</script>

<section id="search-individual" aria-labelledby="quick-check-title">
	<p id="quick-check-title">Vérifier mon résultat</p>
	<form id="search" onsubmit={submit}>
		<label class="sr-only" for="quick-annee">Année</label>
		<select
			id="quick-annee"
			class="select select-ghost"
			value={annee}
			onchange={(e) => onYearChange(Number(e.currentTarget.value))}
		>
			{#each annees as a (a)}
				<option value={a}>BAC {a}</option>
			{/each}
		</select>
		<label class="sr-only" for="quick-numero">Numéro de candidat</label>
		<input
			id="quick-numero"
			class="input input-ghost"
			type="text"
			inputmode="numeric"
			autocomplete="off"
			pattern="[0-9]*"
			placeholder="Numéro de candidat"
			bind:value={numero}
			aria-describedby={notFound ? 'quick-check-error' : undefined}
		/>
		<button class="btn btn-primary" type="submit" disabled={loading}>
			<iconify-icon icon="tabler:search"></iconify-icon>
			{loading ? 'Chargement…' : 'Vérifier'}
		</button>
	</form>
	{#if notFound}
		<p id="quick-check-error" class="error" role="alert">
			Aucun candidat n° <strong>{notFound}</strong> pour le BAC {annee}.
		</p>
	{/if}
</section>
