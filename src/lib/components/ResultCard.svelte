<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { copyText, resultUrl, shareResult } from '$lib/utils/share';
	import type { Result } from '$lib/types';

	let {
		result,
		annee,
		enter = false
	}: { result: Result; annee: number; enter?: boolean } = $props();

	const admis = $derived(result.statut === 'admis');
	const deuxieme = $derived(result.statut === '2e session');

	// Annonces : toujours lues par la région live, affichées seulement pour les erreurs
	let announce = $state('');
	let feedback = $state('');
	let timer: ReturnType<typeof setTimeout>;
	function flash(msg: string, visible = false) {
		announce = msg;
		feedback = visible ? msg : '';
		clearTimeout(timer);
		timer = setTimeout(() => (announce = feedback = ''), 4000);
	}

	async function share() {
		const r = await shareResult(result, annee);
		if (r === 'copied') flash('Lien copié');
		else if (r === 'failed') flash('Partage impossible sur cet appareil', true);
	}
	// « Copier le lien » : le bouton se transforme ~2 s, l'annonce passe par la région live
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;
	async function copy() {
		const ok = await copyText(resultUrl(annee, result.numero));
		if (!ok) {
			flash('Copie impossible : sélectionnez l’adresse dans la barre du navigateur', true);
			return;
		}
		copied = true;
		flash('Lien du résultat copié dans le presse-papiers');
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}

	// Position de la moyenne sur l'échelle 0–20 (seuils : 8 pour la 2e session, 10 pour l'admission)
	const pos = $derived(Math.min(100, Math.max(0, (result.moyenne / 20) * 100)));

	const moyenne = $derived(
		result.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	);
</script>

<article class="releve" class:enter data-statut={result.statut} aria-labelledby="releve-statut">
	<header class="verdict">
		<p class="meta">
			<span>BAC {annee}</span>
			<span class="num">N° {result.numero}</span>
		</p>
		{#if admis}
			<p class="statut" id="releve-statut">Admis</p>
			<p class="sous">
				Mention <span class="hl" data-mention={result.mention || 'passable'}
					>{result.mention || 'passable'}</span
				>
			</p>
		{:else if deuxieme}
			<p class="statut" id="releve-statut">2e session</p>
			<p class="sous">Convoqué aux épreuves de la seconde session</p>
		{:else}
			<p class="statut" id="releve-statut">Ajourné</p>
			<p class="sous">Session {annee} non validée</p>
		{/if}
	</header>

	<div class="corps">
		<div class="identite">
			<p class="nom">{result.nom}</p>
			<p class="prenoms">{result.prenoms}</p>
		</div>

		<div class="note">
			<p class="valeur">
				<span class="moyenne num">{moyenne}</span>
				<span class="sur">/ 20</span>
				<span class="legende">Moyenne générale</span>
			</p>
			<div class="scale" aria-hidden="true">
				<span class="zone" data-zone="ajourné"></span>
				<span class="zone" data-zone="2e session"></span>
				<span class="zone" data-zone="admis"></span>
				<span class="marker" style="left: {pos}%"></span>
			</div>
			<div class="ticks" aria-hidden="true">
				<span style="left: 0%">0</span>
				<span style="left: 40%">8</span>
				<span style="left: 50%">10</span>
				<span style="left: 100%">20</span>
			</div>
		</div>

		<dl class="details">
			<div>
				<dt>Série</dt>
				<dd>{result.serie}</dd>
			</div>
			<div>
				<dt>Lycée</dt>
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
				Félicitations. Gardez ce relevé (lien ou impression) pour vos inscriptions.
			{:else if deuxieme}
				Il manque peu de points. Les dates et le lieu des épreuves de seconde session sont
				communiqués par votre lycée et votre CISCO.
			{:else}
				Cette session n'est pas validée, mais elle ne ferme aucune porte : l'inscription à la
				prochaine session est ouverte auprès de votre CISCO.
			{/if}
		</p>
	</div>

	<div class="actions">
		<button class="button" type="button" onclick={share}>
			<Icon name="share" size={18} />
			Partager
		</button>
		<button class="button text copy" class:done={copied} type="button" onclick={copy}>
			<Icon name={copied ? 'check' : 'link'} size={18} />
			{copied ? 'Lien copié' : 'Copier le lien'}
		</button>
		<button class="button text" type="button" onclick={() => window.print()}>
			<Icon name="printer" size={18} />
			Imprimer
		</button>
	</div>
	<p class="sr-only" aria-live="polite">{announce}</p>
	<p class="feedback">{feedback}</p>
</article>
