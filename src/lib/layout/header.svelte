<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import flag from '$lib/assets/images/madagascar.webp';

	const onEtab = $derived(page.url.pathname.startsWith('/etablissements'));
</script>

<header class="site-header">
	<div class="wrap">
		<a href="/" class="brand">
			<img src={flag} alt="" width="456" height="347" />
			<span>
				Résultats du BAC
				<small>Madagascar</small>
			</span>
		</a>
		<nav aria-label="Navigation principale">
			<a href="/etablissements" aria-current={onEtab ? 'page' : undefined}>
				<Icon name="school" size={18} />
				Par établissement
			</a>
		</nav>
	</div>
</header>
