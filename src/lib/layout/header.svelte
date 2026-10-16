<script lang="ts">
	import { page } from '$app/state';

	const path = $derived(page.url.pathname);
</script>

<header class="site-header">
	<div class="wrap">
		<a href="/" class="brand" aria-label="Résultats du BAC, accueil">
			<span class="mark" aria-hidden="true">20</span>
			Résultats du BAC
		</a>
		<nav aria-label="Navigation principale">
			<a href="/liste" aria-current={path.startsWith('/liste') ? 'page' : undefined}>Parcourir</a>
			<a
				href="/etablissements"
				aria-current={path.startsWith('/etablissements') ? 'page' : undefined}>Lycées</a
			>
		</nav>
	</div>
</header>
