<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import {
		copyText,
		downloadBlob,
		facebookUrl,
		resultUrl,
		shareResult,
		whatsappUrl
	} from '$lib/utils/share';
	import { shareImageBlob, shareImageName } from '$lib/utils/share-image';
	import { tick } from 'svelte';
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

	// ---- Partager : image générée au survol / focus du bouton, pour garder le geste utilisateur
	let image: Promise<Blob | null> | null = null;
	let imageFor = '';
	function prepareImage(): Promise<Blob | null> {
		if (!image || imageFor !== result.id) {
			imageFor = result.id;
			image = shareImageBlob({ result, annee, site: window.location.host }).catch(() => null);
		}
		return image;
	}

	let menuOpen = $state(false);
	let sharing = $state(false);
	let shareBtn: HTMLButtonElement | undefined = $state();
	let menu: HTMLDivElement | undefined = $state();

	async function share() {
		if (menuOpen) return closeMenu();
		sharing = true;
		const blob = await prepareImage();
		const file = blob
			? new File([blob], shareImageName(result, annee), { type: 'image/png' })
			: null;
		const r = await shareResult(result, annee, file);
		sharing = false;
		if (r === 'menu') openMenu();
	}

	async function openMenu() {
		menuOpen = true;
		await tick();
		menu?.querySelector<HTMLElement>('a, button')?.focus();
	}
	function closeMenu(refocus = true) {
		menuOpen = false;
		if (refocus) shareBtn?.focus();
	}
	function onMenuKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation(); // ne ferme pas la modale qui contient la carte
			closeMenu();
			return;
		}
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		const items = [...(menu?.querySelectorAll<HTMLElement>('a, button') ?? [])];
		const i = items.indexOf(document.activeElement as HTMLElement);
		const n = e.key === 'ArrowDown' ? i + 1 : i - 1;
		items[(n + items.length) % items.length]?.focus();
	}
	function onOutside(e: PointerEvent) {
		if (!menuOpen) return;
		const t = e.target as Node;
		if (menu?.contains(t) || shareBtn?.contains(t)) return;
		closeMenu(false);
	}
	async function downloadImage() {
		const blob = await prepareImage();
		closeMenu();
		if (blob) {
			downloadBlob(blob, shareImageName(result, annee));
			flash('Image téléchargée');
		} else flash('L’image n’a pas pu être créée sur cet appareil', true);
	}
	async function copyFromMenu() {
		closeMenu();
		await copy();
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

<svelte:window onpointerdown={onOutside} />

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
		<div class="share-wrap">
			<button
				bind:this={shareBtn}
				class="button share"
				type="button"
				aria-haspopup="true"
				aria-expanded={menuOpen}
				aria-controls="share-menu-{result.id}"
				aria-busy={sharing}
				onclick={share}
				onpointerenter={prepareImage}
				onfocus={prepareImage}
				ontouchstart={prepareImage}
			>
				<Icon name="share" size={18} />
				Partager
			</button>
			{#if menuOpen}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					bind:this={menu}
					id="share-menu-{result.id}"
					class="share-menu"
					role="group"
					aria-label="Partager le résultat"
					onkeydown={onMenuKey}
				>
					<a
						href={whatsappUrl(result, annee)}
						target="_blank"
						rel="noopener noreferrer"
						onclick={() => closeMenu(false)}
					>
						<Icon name="whatsapp" size={18} /> WhatsApp
					</a>
					<a
						href={facebookUrl(result, annee)}
						target="_blank"
						rel="noopener noreferrer"
						onclick={() => closeMenu(false)}
					>
						<Icon name="facebook" size={18} /> Facebook
					</a>
					<button type="button" onclick={downloadImage}>
						<Icon name="photo" size={18} /> Télécharger l’image
					</button>
					<button type="button" onclick={copyFromMenu}>
						<Icon name="link" size={18} /> Copier le lien
					</button>
				</div>
			{/if}
		</div>
		<button class="button text copy" class:done={copied} type="button" onclick={copy}>
			<Icon name={copied ? 'check' : 'link'} size={18} />
			{copied ? 'Lien copié' : 'Copier le lien'}
		</button>
		<button class="button text" type="button" onclick={() => window.print()}>
			<Icon name="printer" size={18} />
			Imprimer
		</button>
	</div>
	<div class="print-foot" aria-hidden="true">
		<Qr value={printUrl} label="QR code du résultat en ligne" />
		<div>
			<p><b>Vérifier en ligne :</b> {printUrl}</p>
			<p>Imprimé le {printDate}</p>
			<p class="fictif">Données fictives, document non officiel</p>
		</div>
	</div>
	<p class="sr-only" aria-live="polite">{announce}</p>
	<p class="feedback">{feedback}</p>
</article>
