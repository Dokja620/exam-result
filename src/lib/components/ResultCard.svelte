<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import {
		copyText,
		downloadBlob,
		facebookUrl,
		resultPath,
		resultUrl,
		shareResult,
		whatsappUrl
	} from '$lib/utils/share';
	import { shareImageBlob, shareImageName } from '$lib/utils/share-image';
	import Popover from '$lib/components/Popover.svelte';
	import Qr from '$lib/components/Qr.svelte';
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

	// ---- Partager : un menu (popover / feuille) qui regroupe toutes les options -------------
	// L'image est préparée dès l'ouverture du menu : le partage natif garde le geste utilisateur.
	let image: Promise<Blob | null> | null = null;
	let imageFor = '';
	function prepareImage(): Promise<Blob | null> {
		if (!image || imageFor !== result.id) {
			imageFor = result.id;
			image = shareImageBlob({ result, annee, site: window.location.host }).catch(() => null);
		}
		return image;
	}

	let popover: Popover | undefined = $state();
	let shareBtn: HTMLButtonElement | undefined = $state();
	let menuOpen = $state(false);
	let canNative = $state(false);
	// Le menu (liens absolus, <dialog>) n'existe que côté navigateur
	let mounted = $state(false);
	$effect(() => {
		canNative = typeof navigator.share === 'function';
		mounted = true;
	});

	function openShare() {
		prepareImage();
		if (shareBtn) popover?.show(shareBtn);
	}

	async function shareNative() {
		const blob = await prepareImage();
		const file = blob
			? new File([blob], shareImageName(result, annee), { type: 'image/png' })
			: null;
		const r = await shareResult(result, annee, file);
		if (r === 'shared') popover?.hide();
		else if (r === 'menu') flash('Partage impossible sur cet appareil', true);
	}
	async function downloadImage() {
		const blob = await prepareImage();
		if (blob) {
			downloadBlob(blob, shareImageName(result, annee));
			flash('Image téléchargée');
			popover?.hide();
		} else flash('L’image n’a pas pu être créée sur cet appareil', true);
	}

	// « Copier le lien » : la ligne du menu se transforme ~2 s (coche + « Lien copié »)
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

	// Pied d'impression : lien canonique (QR) et date, calculés côté client
	let printUrl = $state('');
	let printDate = $state('');
	$effect(() => {
		printUrl = resultUrl(annee, result.numero);
		printDate = new Date().toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	});

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
				Félicitations. Gardez ce lien et votre relevé de notes pour vos inscriptions.
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
		<a
			class="button cta"
			href="{resultPath(annee, result.numero)}/releve"
			aria-label="Obtenir mon relevé de notes"
		>
			<Icon name="file-text" size={18} />
			<span class="l-full">Obtenir mon relevé de notes</span>
			<span class="l-mid">Mon relevé de notes</span>
			<span class="l-short">Mon relevé</span>
		</a>
		<button
			bind:this={shareBtn}
			class="button ghost cta"
			type="button"
			aria-haspopup="dialog"
			aria-expanded={menuOpen}
			aria-controls="partage-{result.id}"
			onclick={openShare}
		>
			<Icon name="share" size={18} />
			Partager
		</button>
	</div>
	<p class="feedback">{menuOpen ? '' : feedback}</p>

	{#if mounted}
		<Popover
			bind:this={popover}
			bind:open={menuOpen}
			id="partage-{result.id}"
			title="Partager le résultat"
			width={320}
			align="end"
			class="share-pop"
		>
			<ul class="pop-list">
				{#if canNative}
					<li>
						<button type="button" onclick={shareNative}>
							<span class="ico"><Icon name="share" size={18} /></span>
							Partager via…
						</button>
					</li>
				{/if}
				<li>
					<a href={whatsappUrl(result, annee)} target="_blank" rel="noopener noreferrer">
						<span class="ico"><Icon name="whatsapp" size={18} /></span>
						WhatsApp
					</a>
				</li>
				<li>
					<a href={facebookUrl(result, annee)} target="_blank" rel="noopener noreferrer">
						<span class="ico"><Icon name="facebook" size={18} /></span>
						Facebook
					</a>
				</li>
				<li>
					<button type="button" onclick={downloadImage}>
						<span class="ico"><Icon name="photo" size={18} /></span>
						Télécharger l’image
					</button>
				</li>
				<li>
					<button type="button" class:done={copied} onclick={copy}>
						<span class="ico"><Icon name={copied ? 'check' : 'link'} size={18} /></span>
						{copied ? 'Lien copié' : 'Copier le lien'}
					</button>
				</li>
			</ul>
			<p class="sr-only" aria-live="polite">{menuOpen ? announce : ''}</p>
			{#if menuOpen && feedback}<p class="pop-msg">{feedback}</p>{/if}
		</Popover>
	{/if}

	<div class="print-foot" aria-hidden="true">
		<Qr value={printUrl} label="QR code du résultat en ligne" />
		<div>
			<p><b>Vérifier en ligne :</b> {printUrl}</p>
			<p>Imprimé le {printDate}</p>
			<p class="fictif">Données fictives, document non officiel</p>
		</div>
	</div>
	<p class="sr-only" aria-live="polite">{menuOpen ? '' : announce}</p>
</article>
