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
	<header>
		<h1>Résultats par établissement</h1>
		<p>Taux de réussite de chaque lycée au BAC {data.annee} et liste de ses admis.</p>
	</header>

	<form class="picker" onsubmit={(e) => e.preventDefault()}>
		<label>
			<span>Session</span>
			<select class="select" value={data.annee} onchange={pickYear}>
				{#each data.annees as a (a)}<option value={a}>BAC {a}</option>{/each}
			</select>
		</label>
		<label>
			<span>Établissement</span>
			<select class="select" value={data.fiche?.label ?? ''} onchange={pick}>
				<option value="">Tous les établissements</option>
				{#each data.ecoles as e (e.label)}<option value={e.label}>{e.label}</option>{/each}
			</select>
		</label>
	</form>

	{#if data.fiche}
		<section class="fiche" aria-labelledby="fiche-title">
			<div class="head">
				<h2 id="fiche-title">{data.fiche.label}</h2>
				<p class="lieu">CISCO {data.fiche.cisco}, {data.fiche.province}</p>
			</div>
			<div class="taux">
				<span class="value">{fmtPct(data.fiche.taux)}</span>
				<span class="legend">
					{fmtInt(data.fiche.admis)} admis sur {fmtInt(data.fiche.total)} candidats présentés
				</span>
			</div>

			{#if data.admis.length}
				<div class="table-scroll">
					<table class="results-table">
						<thead>
							<tr>
								<th scope="col">Numéro</th>
								<th scope="col">Nom et prénoms</th>
								<th scope="col">Série</th>
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
									<td class="numero">{r.numero}</td>
									<td class="name"><b>{r.nom}</b> {r.prenoms}</td>
									<td>{r.serie}</td>
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
					<strong>Aucun admis dans cet établissement cette session.</strong>
				</div>
			{/if}
		</section>
	{:else}
		<ol class="ranking" aria-label="Établissements, par taux de réussite">
			{#each [...data.ecoles].sort((a, b) => b.taux - a.taux) as e (e.label)}
				<li>
					<a href="/etablissements/{data.annee}?ecole={encodeURIComponent(e.label)}">
						<span class="nom">{e.label}</span>
						<span class="pct">{fmtPct(e.taux)}<small>{e.admis}/{e.total}</small></span>
						<span class="lieu">{e.cisco}, {e.province}</span>
						<span class="bar" aria-hidden="true"><span style="width: {e.taux}%"></span></span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</div>
