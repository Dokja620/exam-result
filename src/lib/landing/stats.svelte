<script lang="ts">
	import 'iconify-icon';
	import { computeStats } from '$lib/stats';
	import type { Result } from '$lib/types';

	let { rows, annee }: { rows: Result[]; annee: number } = $props();

	const stats = $derived(computeStats(rows));
	const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
	let open = $state(false);
</script>

{#if rows.length}
	<section id="stats" data-screenshift aria-labelledby="stats-title">
		<div class="summary">
			<div class="kpi" style="--pct: {stats.global.taux}%">
				<span class="value">{fmt(stats.global.taux)} %</span>
				<span class="kpi-label">Taux de réussite {annee}</span>
			</div>
			<div class="kpi">
				<span class="value">{stats.global.admis.toLocaleString('fr-FR')}</span>
				<span class="kpi-label">Admis sur {stats.global.total.toLocaleString('fr-FR')}</span>
			</div>
			<div class="kpi">
				<span class="value">{stats.deuxieme.toLocaleString('fr-FR')}</span>
				<span class="kpi-label">2e session</span>
			</div>
			<div class="kpi">
				<span class="value">{stats.ajournes.toLocaleString('fr-FR')}</span>
				<span class="kpi-label">Ajournés</span>
			</div>
		</div>

		<button
			class="btn btn-ghost btn-sm stats-toggle"
			aria-expanded={open}
			aria-controls="stats-details"
			onclick={() => (open = !open)}
		>
			<iconify-icon icon={open ? 'tabler:chevron-up' : 'tabler:chart-bar'}></iconify-icon>
			{open ? 'Masquer les statistiques' : 'Statistiques détaillées'}
		</button>

		{#if open}
			<div id="stats-details" class="details">
				<h5 id="stats-title">Statistiques du BAC {annee}</h5>
				<div class="grid">
					<div class="block">
						<h6>Taux de réussite par série</h6>
						<ul>
							{#each stats.parSerie as s (s.label)}
								<li>
									<span class="name">{s.label}</span>
									<span
										class="bar"
										role="img"
										aria-label="{fmt(s.taux)} % d'admis en série {s.label}"
									>
										<span style="width: {s.taux}%"></span>
									</span>
									<span class="num">{fmt(s.taux)} % <small>({s.admis}/{s.total})</small></span>
								</li>
							{/each}
						</ul>
					</div>
					<div class="block">
						<h6>Taux de réussite par province</h6>
						<ul>
							{#each stats.parProvince as p (p.label)}
								<li>
									<span class="name">{p.label}</span>
									<span class="bar" role="img" aria-label="{fmt(p.taux)} % d'admis à {p.label}">
										<span style="width: {p.taux}%"></span>
									</span>
									<span class="num">{fmt(p.taux)} % <small>({p.admis}/{p.total})</small></span>
								</li>
							{/each}
						</ul>
					</div>
					<div class="block">
						<h6>Mentions (parmi les admis)</h6>
						<ul>
							{#each stats.mentions as m (m.label)}
								<li data-mention={m.label}>
									<span class="name">{m.label}</span>
									<span class="bar" role="img" aria-label="{fmt(m.part)} % de mention {m.label}">
										<span style="width: {m.part}%"></span>
									</span>
									<span class="num">{fmt(m.part)} % <small>({m.total})</small></span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</section>
{/if}
