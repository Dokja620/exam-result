<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import flag from '$lib/assets/images/madagascar.webp';
	import { copyText, resultUrl, shareResult } from '$lib/utils/share';
	import type { Result } from '$lib/types';

	let {
		result,
		annee,
		enter = false
	}: { result: Result; annee: number; enter?: boolean } = $props();

	const admis = $derived(result.statut === 'admis');
	const deuxieme = $derived(result.statut === '2e session');

	let feedback = $state('');
	let timer: ReturnType<typeof setTimeout>;
	function flash(msg: string) {
		feedback = msg;
		clearTimeout(timer);
		timer = setTimeout(() => (feedback = ''), 2500);
	}

	async function share() {
		const r = await shareResult(result, annee);
		if (r === 'copied') flash('Lien copié');
		else if (r === 'failed') flash('Partage impossible sur cet appareil');
	}
	async function copy() {
		flash((await copyText(resultUrl(annee, result.numero))) ? 'Lien copié' : 'Copie impossible');
	}

	const moyenne = $derived(
		result.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	);
</script>

<article class="releve" class:enter data-statut={result.statut} aria-labelledby="releve-statut">
	<div class="officiel">
		<img src={flag} alt="" width="456" height="347" />
		<div>
			<b>Repoblikan'i Madagasikara</b>
			Baccalauréat de l'enseignement général
		</div>
		<div class="session">
			<b>Session {annee}</b>
			N° {result.numero}
		</div>
	</div>

	<div class="band">
		{#if admis}
			<p class="statut" id="releve-statut">Admis</p>
			<p class="sous">Mention {result.mention || 'passable'}</p>
		{:else if deuxieme}
			<p class="statut" id="releve-statut">2e session</p>
			<p class="sous">Convocation aux épreuves de la seconde session</p>
		{:else}
			<p class="statut" id="releve-statut">Ajourné</p>
			<p class="sous">Résultat de la session {annee}</p>
		{/if}
	</div>

	<div class="corps">
		<div class="identite">
			<p class="nom">{result.nom}</p>
			<p class="prenoms">{result.prenoms}</p>
		</div>

		<dl class="score">
			<div>
				<dt>Moyenne générale</dt>
				<dd>{moyenne} <small>/ 20</small></dd>
			</div>
			<div>
				<dt>Série</dt>
				<dd>{result.serie}</dd>
			</div>
		</dl>

		<dl class="details">
			<div>
				<dt>Établissement</dt>
				<dd>{result.ecole}</dd>
			</div>
			<div>
				<dt>CISCO</dt>
				<dd>{result.cisco}</dd>
			</div>
			<div>
				<dt>Province</dt>
				<dd>{result.province}</dd>
			</div>
		</dl>

		<p class="mot">
			{#if admis}
				Félicitations. Ce relevé atteste de votre admission au baccalauréat, session {annee}.
				Conservez-le pour vos inscriptions.
			{:else if deuxieme}
				Il manque peu de points. Les dates et le lieu des épreuves de seconde session sont
				communiqués par votre établissement et votre CISCO.
			{:else}
				Cette session n'est pas concluante, mais elle ne ferme aucune porte : l'inscription à la
				prochaine session est ouverte auprès de votre CISCO.
			{/if}
		</p>
	</div>

	<div class="actions">
		<button class="btn btn-ink" type="button" onclick={share}>
			<Icon name="share" size={18} />
			Partager
		</button>
		<button class="btn btn-quiet" type="button" onclick={copy}>
			<Icon name="link" size={18} />
			Copier le lien
		</button>
		<button class="btn btn-quiet" type="button" onclick={() => window.print()}>
			<Icon name="printer" size={18} />
			Imprimer
		</button>
	</div>
	<p class="feedback" aria-live="polite">{feedback}</p>
</article>
