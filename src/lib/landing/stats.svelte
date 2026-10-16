<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { fmtInt, fmtPct, type SessionStats } from '$lib/stats';

	let { stats, annee }: { stats: SessionStats; annee: number } = $props();
	const total = $derived(stats.global.total || 1);
	const parts = $derived([
		{ key: 'admis', label: 'Admis', n: stats.global.admis },
		{ key: '2e session', label: '2e session', n: stats.deuxieme },
		{ key: 'ajourné', label: 'Ajournés', n: stats.ajournes }
	]);
</script>

<section class="overview" aria-labelledby="stats-title">
	<h2 id="stats-title">La session {annee}</h2>
	<p class="headline">
		<span class="big num">{fmtPct(stats.global.taux)}</span>
		<span>des {fmtInt(stats.global.total)} candidats sont admis.</span>
	</p>

	<div
		class="split"
		role="img"
		aria-label={parts.map((p) => `${p.label} : ${fmtInt(p.n)}`).join(', ')}
	>
		{#each parts as p (p.key)}
			<span data-statut={p.key} style="flex-grow: {p.n / total}"></span>
		{/each}
	</div>
	<ul class="split-legend">
		{#each parts as p (p.key)}
			<li data-statut={p.key}>
				<span class="n num">{fmtInt(p.n)}</span>
				<span class="l">{p.label}</span>
			</li>
		{/each}
	</ul>

	<details>
		<summary>
			Par série, province et mention
			<Icon name="chevron-down" size={18} />
		</summary>
		<div class="details-body">
			<div class="block">
				<h3>Réussite par série</h3>
				<ul>
					{#each stats.parSerie as s (s.label)}
						<li>
							<span class="name">Série {s.label}</span>
							<span class="bar" role="img" aria-label="{fmtPct(s.taux)} d'admis en série {s.label}">
								<span style="width: {s.taux}%"></span>
							</span>
							<span class="pct num">{fmtPct(s.taux)}</span>
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
							<span class="pct num">{fmtPct(p.taux)}</span>
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
							<span class="pct num">{fmtPct(m.part)}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</details>
</section>
