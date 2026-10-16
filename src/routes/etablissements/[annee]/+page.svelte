<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { fmtInt, fmtPct } from '$lib/stats';
	import { resultPath } from '$lib/utils/share';

	let { data } = $props();

	const moy = (n: number) =>
		n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	function pick(e: Event) {
		const v = (e.currentTarget as HTMLSelectElement).value;
		goto(
			v
				? `/etablissements/${data.annee}?ecole=${encodeURIComponent(v)}`
				: `/etablissements/${data.annee}`
		);
	}
	function pickYear(e: Event) {
		goto(`/etablissements/${(e.currentTarget as HTMLSelectElement).value}`);
	}
</script>

<svelte:head>
	<title>
		{data.fiche
			? `${data.fiche.label}, BAC ${data.annee}`
			: `Résultats par établissement, BAC ${data.annee}`}
	</title>
	<meta
		name="description"
		content="Taux de réussite au BAC {data.annee} par lycée et liste des admis de chaque établissement, Madagascar."
	/>
</svelte:head>

<div class="etab wrap">
	<header class="page-head">
		<div>
			<h1>{data.fiche ? data.fiche.label : 'Classement des lycées'}</h1>
			{#if data.fiche}
				<p>CISCO {data.fiche.cisco}, {data.fiche.province}. BAC {data.annee}.</p>
			{:else}
				<p>
					Taux de réussite de chaque lycée au BAC {data.annee}. Choisissez un lycée pour voir ses
					admis.
				</p>
			{/if}
		</div>
	</header>

	<form class="picker" onsubmit={(e) => e.preventDefault()}>
		<label>
			<span class="sr-only">Session</span>
			<select class="field-select" value={data.annee} onchange={pickYear}>
				{#each data.annees as a (a)}<option value={a}>BAC {a}</option>{/each}
			</select>
		</label>
		<label class="grow">
			<span class="sr-only">Lycée</span>
			<select class="field-select" value={data.fiche?.label ?? ''} onchange={pick}>
				<option value="">Tous les lycées</option>
				{#each data.ecoles as e (e.label)}<option value={e.label}>{e.label}</option>{/each}
			</select>
		</label>
	</form>

	{#if data.fiche}
		<section class="fiche" aria-label="Résultats de {data.fiche.label}">
			<div class="taux">
				<span class="value num">{fmtPct(data.fiche.taux)}</span>
				<span class="legend">
					de réussite : {fmtInt(data.fiche.admis)} admis sur {fmtInt(data.fiche.total)} candidats présentés
				</span>
				<span class="bar" aria-hidden="true"><span style="width: {data.fiche.taux}%"></span></span>
			</div>

			<h2>Les admis</h2>
			{#if data.admis.length}
				<div class="table-scroll">
					<table class="results-table">
						<thead>
							<tr>
								<th scope="col" class="md">Numéro</th>
								<th scope="col">Candidat</th>
								<th scope="col" class="md">Série</th>
								<th scope="col">Mention</th>
								<th scope="col" class="moy">Moyenne</th>
							</tr>
						</thead>
						<tbody>
							{#each data.admis as r (r.id)}
								<tr
									onclick={() => goto(resultPath(data.annee, r.numero))}
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter') goto(resultPath(data.annee, r.numero));
									}}
								>
									<td class="numero md">{r.numero}</td>
									<td class="name"><b>{r.nom}</b> {r.prenoms}</td>
									<td class="md">{r.serie}</td>
									<td class="mention">{r.mention}</td>
									<td class="moy">{moy(r.moyenne)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="notice">
					<Icon name="file-search" size={28} />
					<strong>Aucun admis dans ce lycée cette session.</strong>
				</div>
			{/if}
			<a class="back" href="/etablissements/{data.annee}">
				<Icon name="arrow-left" size={18} /> Tous les lycées
			</a>
		</section>
	{:else}
		<ol class="ranking" aria-label="Lycées, par taux de réussite">
			{#each [...data.ecoles].sort((a, b) => b.taux - a.taux) as e, i (e.label)}
				<li>
					<a href="/etablissements/{data.annee}?ecole={encodeURIComponent(e.label)}">
						<span class="rank num" aria-hidden="true">{i + 1}</span>
						<span class="who">
							<span class="nom">{e.label}</span>
							<span class="lieu">{e.cisco}, {e.province}</span>
						</span>
						<span class="bar" aria-hidden="true"><span style="width: {e.taux}%"></span></span>
						<span class="pct num">{fmtPct(e.taux)}<small>{e.admis} / {e.total}</small></span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</div>
