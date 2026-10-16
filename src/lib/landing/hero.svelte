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

	const CELLS = [0, 1, 2, 3, 4, 5];
	let numero = $state('');
	let focused = $state(false);
	let input: HTMLInputElement | undefined = $state();

	function clean(e: Event & { currentTarget: HTMLInputElement }) {
		const v = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
		numero = v;
		e.currentTarget.value = v;
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (numero.length === 0) {
			input?.focus();
			return;
		}
		onCheck(numero);
	}

	const years = $derived([...annees].sort((a, b) => b - a));
</script>

<section class="check" aria-labelledby="check-title">
	<h1 id="check-title">Votre résultat du BAC {annee}</h1>
	<p class="lede">Saisissez le numéro inscrit sur votre convocation.</p>

	<form class="check-form" onsubmit={submit} novalidate>
		{#if years.length > 1}
			<fieldset class="years">
				<legend class="sr-only">Session</legend>
				{#each years as a (a)}
					<label>
						<input
							type="radio"
							name="annee"
							value={a}
							checked={a === annee}
							onchange={() => onYearChange(a)}
						/>
						<span>{a}</span>
					</label>
				{/each}
			</fieldset>
		{/if}

		<label class="sr-only" for="numero">Numéro de candidat, six chiffres</label>
		<div class="code" class:focused class:invalid={!!notFound}>
			<input
				bind:this={input}
				id="numero"
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength="6"
				pattern="[0-9]*"
				value={numero}
				oninput={clean}
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
				aria-invalid={notFound ? 'true' : undefined}
				aria-describedby={notFound ? 'check-error' : 'check-hint'}
			/>
			<div class="cells" aria-hidden="true">
				{#each CELLS as i (i)}
					<span
						class="cell"
						class:filled={i < numero.length}
						class:current={focused && i === Math.min(numero.length, 5)}>{numero[i] ?? ''}</span
					>
				{/each}
			</div>
		</div>

		{#if notFound}
			<p id="check-error" class="error" role="alert">
				Aucun candidat n° <strong>{notFound}</strong> au BAC {annee}. Vérifiez les six chiffres ou
				changez de session.
			</p>
		{:else}
			<p id="check-hint" class="hint">Six chiffres, par exemple 104 236.</p>
		{/if}

		<button class="button submit" type="submit" disabled={loading}>
			{#if loading}
				Chargement des résultats…
			{:else}
				Voir mon résultat
				<Icon name="arrow-right" size={18} />
			{/if}
		</button>
	</form>

	<p class="alt">
		Numéro égaré ? <a href="/liste/{annee}?focus=1">Cherchez par nom</a>
	</p>
</section>
