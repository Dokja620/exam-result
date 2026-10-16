<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { computeStats, fmtInt, fmtPct } from '$lib/stats';
	import type { Result } from '$lib/types';

	let { rows, annee }: { rows: Result[]; annee: number } = $props();

	const stats = $derived(computeStats(rows));
</script>

<section class="overview wrap" aria-labelledby="stats-title">
	<h2 id="stats-title" class="sr-only">Statistiques du BAC {annee}</h2>
	<div class="strip">
		<div class="figures">
			<div class="taux">
				<span class="value">{fmtPct(stats.global.taux)}</span>
				<span class="legend">Taux de réussite</span>
				<span class="gauge" aria-hidden="true"
					><span style="width: {stats.global.taux}%"></span></span
				>
			</div>
			<div>
				<span class="value">{fmtInt(stats.global.admis)}</span>
				<span class="legend">Admis sur {fmtInt(stats.global.total)}</span>
			</div>
			<div>
				<span class="value">{fmtInt(stats.deuxieme)}</span>
				<span class="legend">Convoqués en 2e session</span>
			</div>
			<div>
				<span class="value">{fmtInt(stats.ajournes)}</span>
				<span class="legend">Ajournés</span>
			</div>
		</div>

		<details>
			<summary>
				Détail par série, province et mention
				<Icon name="chevron-down" size={18} />
			</summary>
			<div class="details-body">
				<div class="block">
					<h3>Réussite par série</h3>
					<ul>
						{#each stats.parSerie as s (s.label)}
							<li>
								<span class="name">Série {s.label}</span>
								<span
									class="bar"
									role="img"
									aria-label="{fmtPct(s.taux)} d'admis en série {s.label}"
								>
									<span style="width: {s.taux}%"></span>
								</span>
								<span class="pct">{fmtPct(s.taux)}<small>{s.admis}/{s.total}</small></span>
							</li>
						{/each}
					</ul>
				</div>
				<div class="block">
					<h3>Réussite par province</h3>
					<ul>
						{#each stats.parProvince as p (p.label)}
							<li>
								<span class="name">{p.label}</span>
								<span class="bar" role="img" aria-label="{fmtPct(p.taux)} d'admis à {p.label}">
									<span style="width: {p.taux}%"></span>
								</span>
								<span class="pct">{fmtPct(p.taux)}<small>{p.admis}/{p.total}</small></span>
							</li>
						{/each}
					</ul>
				</div>
				<div class="block">
					<h3>Mentions parmi les admis</h3>
					<ul>
						{#each stats.mentions as m (m.label)}
							<li data-mention={m.label}>
								<span class="name">{m.label}</span>
								<span class="bar" role="img" aria-label="{fmtPct(m.part)} de mention {m.label}">
									<span style="width: {m.part}%"></span>
								</span>
								<span class="pct">{fmtPct(m.part)}<small>{m.total}</small></span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</details>
	</div>
</section>
