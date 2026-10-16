<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import Qr from '$lib/components/Qr.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { resultPath, shareText } from '$lib/utils/share';

	let { data } = $props();

	const r = $derived(data.result);
	const notes = $derived(data.notes);
	const totalCoef = $derived(notes.reduce((a, n) => a + n.coef, 0));
	const totalPoints = $derived(notes.reduce((a, n) => a + n.coef * n.note, 0));

	const fr = (n: number, d = 2) =>
		n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	const decision = $derived(
		r.statut === 'admis'
			? 'Admis'
			: r.statut === '2e session'
				? 'Autorisé à la seconde session'
				: 'Ajourné'
	);
	const mention = $derived(r.statut === 'admis' ? cap(r.mention || 'passable') : '—');

	const back = $derived(resultPath(data.annee, r.numero));
	const url = $derived(`${page.url.origin}${back}`);

	// Date d'édition : celle du navigateur (au rendu serveur, celle du serveur)
	let today = $state(
		new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
	);
	$effect(() => {
		today = new Date().toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	});

	const WATERMARK = 'DONNÉES FICTIVES — DOCUMENT NON OFFICIEL';
</script>

<Seo
	title="Relevé de notes, {r.nom} {r.prenoms}, BAC {data.annee} (données fictives)"
	description="Relevé de notes de {shareText(
		r,
		data.annee
	)} Données fictives, document non officiel."
	path="{back}/releve"
	noindex
/>

<div class="transcript-page wrap">
	<div class="transcript-tools">
		<a href={back} class="back">
			<Icon name="arrow-left" size={18} />
			Retour
		</a>
		<div class="pdf">
			<button class="button" type="button" onclick={() => window.print()}>
				<Icon name="download" size={18} />
				Télécharger en PDF
			</button>
			<p class="hint">Dans la fenêtre d'impression, choisissez « Enregistrer en PDF ».</p>
		</div>
	</div>

	<article class="sheet" aria-labelledby="sheet-title">
		<div class="watermark" aria-hidden="true">
			<span>{WATERMARK}</span>
			<span>{WATERMARK}</span>
			<span>{WATERMARK}</span>
		</div>

		<header class="sheet-head">
			<p class="brand">
				<span class="mark" aria-hidden="true">20</span>
				Résultats du BAC
				<small>site de démonstration</small>
			</p>
			<p class="fictif">Données fictives · document non officiel</p>
		</header>

		<div class="sheet-title">
			<h1 id="sheet-title">Relevé de notes</h1>
			<p>Baccalauréat · {data.session} · Série {r.serie}</p>
		</div>

		<dl class="candidat">
			<div class="wide">
				<dt>Candidat</dt>
				<dd><b>{r.nom}</b> {r.prenoms}</dd>
			</div>
			<div>
				<dt>N° de candidat</dt>
				<dd class="num">{r.numero}</dd>
			</div>
			<div>
				<dt>Série</dt>
				<dd>{r.serie}</dd>
			</div>
			<div class="wide">
				<dt>Lycée</dt>
				<dd>{r.ecole}</dd>
			</div>
			<div>
				<dt>CISCO</dt>
				<dd>{r.cisco}</dd>
			</div>
			<div>
				<dt>Province</dt>
				<dd>{r.province}</dd>
			</div>
		</dl>

		<table class="notes">
			<caption class="sr-only">Notes par matière</caption>
			<thead>
				<tr>
					<th scope="col">Matière</th>
					<th scope="col" class="n">Coef.</th>
					<th scope="col" class="n">Note /20</th>
					<th scope="col" class="n">Points</th>
				</tr>
			</thead>
			<tbody>
				{#each notes as n (n.matiere)}
					<tr>
						<th scope="row">{n.matiere}</th>
						<td class="n">{n.coef}</td>
						<td class="n">{fr(n.note)}</td>
						<td class="n">{fr(n.coef * n.note)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row">Total</th>
					<td class="n">{totalCoef}</td>
					<td class="n"></td>
					<td class="n">{fr(totalPoints)}</td>
				</tr>
			</tfoot>
		</table>

		<dl class="bilan" data-statut={r.statut}>
			<div>
				<dt>Moyenne générale</dt>
				<dd><span class="moy num">{fr(r.moyenne)}</span> / 20</dd>
			</div>
			<div>
				<dt>Mention</dt>
				<dd>
					{#if r.statut === 'admis'}<span class="hl" data-mention={r.mention || 'passable'}
							>{mention}</span
						>{:else}{mention}{/if}
				</dd>
			</div>
			<div>
				<dt>Décision</dt>
				<dd>{decision}</dd>
			</div>
		</dl>

		<footer class="sheet-foot">
			<Qr value={url} label="QR code du résultat en ligne" />
			<div>
				<p><b>Vérifier en ligne :</b> <span class="url">{url}</span></p>
				<p>Édité le {today}</p>
				<p class="disclaimer">
					Document généré à partir de données fictives par un site de démonstration indépendant. Il
					n'a aucune valeur officielle et ne remplace aucun relevé délivré par une autorité.
				</p>
			</div>
		</footer>
	</article>
</div>
