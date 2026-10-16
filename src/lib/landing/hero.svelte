<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

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

<section class="masthead" aria-labelledby="hero-title">
	<div class="wrap">
		<div>
			<p class="kicker">Baccalauréat {annee}</p>
			<h1 id="hero-title">Consultez votre résultat</h1>
		</div>

		<form class="slip" onsubmit={submit} novalidate>
			<div class="row">
				<label class="field">
					<span>Session</span>
					<select
						class="select"
						value={annee}
						onchange={(e) => onYearChange(Number(e.currentTarget.value))}
					>
						{#each annees as a (a)}
							<option value={a}>BAC {a}</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>Numéro de candidat</span>
					<input
						class="numero"
						type="text"
						inputmode="numeric"
						autocomplete="off"
						maxlength="6"
						pattern="[0-9]*"
						placeholder="000000"
						bind:value={numero}
						aria-invalid={notFound ? 'true' : undefined}
						aria-describedby={notFound ? 'hero-error' : 'hero-hint'}
					/>
				</label>
			</div>

			{#if notFound}
				<p id="hero-error" class="error" role="alert">
					<Icon name="file-search" size={18} />
					<span>
						Aucun candidat n° <strong>{notFound}</strong> au BAC {annee}. Vérifiez les six chiffres
						ou changez de session.
					</span>
				</p>
			{:else}
				<p id="hero-hint" class="hint">Six chiffres, inscrits sur votre convocation.</p>
			{/if}

			<button class="btn btn-ink submit" type="submit" disabled={loading}>
				{#if loading}
					Chargement des résultats…
				{:else}
					Voir mon résultat
					<Icon name="arrow-right" size={18} />
				{/if}
			</button>
		</form>
	</div>
</section>
