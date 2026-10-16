<script lang="ts">
	import 'iconify-icon';
	import { copyText, resultUrl, shareResult } from '$lib/utils/share';
	import type { Result } from '$lib/types';

	let {
		selected,
		annee,
		onClose
	}: { selected: Result | null; annee: number; onClose: () => void } = $props();

	let modal: HTMLDialogElement | undefined = $state();
	let feedback = $state('');
	let feedbackTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (!modal) return;
		if (selected && !modal.open) modal.showModal();
		else if (!selected && modal.open) modal.close();
	});

	function flash(msg: string) {
		feedback = msg;
		clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => (feedback = ''), 2500);
	}

	async function share() {
		if (!selected) return;
		const r = await shareResult(selected, annee);
		if (r === 'copied') flash('Lien copié dans le presse-papiers');
		else if (r === 'failed') flash('Partage impossible');
	}

	async function copyLink() {
		if (!selected) return;
		flash((await copyText(resultUrl(annee, selected.numero))) ? 'Lien copié' : 'Copie impossible');
	}

	function print() {
		window.print();
	}

	const admis = $derived(selected?.statut === 'admis');
</script>

<dialog
	bind:this={modal}
	id="selected-modal"
	class="modal"
	aria-labelledby="modal-title"
	onclose={onClose}
>
	{#if selected}
		<div class="modal-box" class:failed={!admis} data-statut={selected.statut}>
			<button
				class="btn btn-sm btn-circle btn-ghost close"
				type="button"
				aria-label="Fermer"
				onclick={() => modal?.close()}
			>
				<iconify-icon icon="tabler:x" style="font-size: 20px"></iconify-icon>
			</button>

			{#if admis}
				<h3 id="modal-title">🎉 Félicitations !</h3>
			{:else if selected.statut === '2e session'}
				<h3 id="modal-title">💪 Rendez-vous à la 2e session</h3>
			{:else}
				<h3 id="modal-title">😔 Ce n'est que partie remise</h3>
			{/if}

			<div class="result-overview">
				<div class="icon">
					{#if admis}
						<iconify-icon icon="solar:diploma-bold" style="font-size: 100px;"></iconify-icon>
					{:else}
						<iconify-icon icon="fluent:document-error-16-filled" style="font-size: 100px;"
						></iconify-icon>
					{/if}
				</div>
				<div class="info">
					<h4><span>{selected.nom}</span> {selected.prenoms}</h4>
					<div class="mention">
						{#if selected.mention === 'très bien'}
							<iconify-icon icon="solar:hand-stars-bold"></iconify-icon>
						{:else if selected.mention === 'bien'}
							<iconify-icon icon="solar:stars-bold"></iconify-icon>
						{:else if selected.mention === 'assez bien'}
							<iconify-icon icon="solar:stars-minimalistic-bold"></iconify-icon>
						{:else if selected.mention === 'passable'}
							<iconify-icon icon="solar:star-line-duotone"></iconify-icon>
						{:else}
							<iconify-icon icon="ph:hand-waving-fill"></iconify-icon>
						{/if}
						<h4>{selected.mention || selected.statut}</h4>
					</div>
				</div>
			</div>

			<dl class="details">
				<div>
					<dt>Numéro</dt>
					<dd>{selected.numero}</dd>
				</div>
				<div>
					<dt>Série</dt>
					<dd>{selected.serie}</dd>
				</div>
				<div>
					<dt>Moyenne</dt>
					<dd>{selected.moyenne.toLocaleString('fr-FR')} / 20</dd>
				</div>
				<div>
					<dt>Observation</dt>
					<dd data-result={selected.statut}><p>{selected.statut}</p></dd>
				</div>
				<div>
					<dt>École</dt>
					<dd>{selected.ecole}</dd>
				</div>
				<div>
					<dt>CISCO</dt>
					<dd>{selected.cisco} · {selected.province}</dd>
				</div>
			</dl>

			<div class="modal-content">
				<div class="text">
					{#if admis}
						<p>Vous avez brillamment réussi le BAC {annee} !</p>
						<p>
							Nous vous souhaitons une réussite éclatante dans vos études et dans la vie. Continuez
							à viser haut, et sachez que nous espérons vous voir triompher encore l'année
							prochaine, encore plus fort et déterminé !
						</p>
					{:else if selected.statut === '2e session'}
						<p>Vous êtes convoqué(e) à la deuxième session du BAC {annee}.</p>
						<p>
							Il ne vous manque que quelques points : révisez les matières à fort coefficient,
							reposez-vous, et présentez-vous avec confiance. Vous y êtes presque.
						</p>
					{:else}
						<p>Malheureusement, vous n'avez pas été admis au BAC {annee} cette fois-ci.</p>
						<p>
							Cela ne définit en rien votre potentiel ou votre avenir. Chaque grande réussite
							commence souvent par un défi. Gardez la tête haute, apprenez de cette expérience, et
							revenez plus fort. Nous croyons en vous et votre réussite future.
						</p>
					{/if}
				</div>
				<div class="actions">
					<button class="btn btn-base" type="button" onclick={share}>
						<iconify-icon icon="solar:share-line-duotone" style="font-size: 20px"></iconify-icon>
						<p>{admis ? 'Partagez votre succès' : 'Partager'}</p>
					</button>
					<button class="btn btn-base" type="button" onclick={copyLink}>
						<iconify-icon icon="tabler:link" style="font-size: 20px"></iconify-icon>
						<p>Copier le lien</p>
					</button>
					<button class="btn btn-base" type="button" onclick={print}>
						<iconify-icon icon="solar:pen-new-round-line-duotone" style="font-size: 20px"
						></iconify-icon>
						<p>Obtenez votre relevé</p>
					</button>
				</div>
				<p class="feedback" aria-live="polite">{feedback}</p>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	{/if}
</dialog>
