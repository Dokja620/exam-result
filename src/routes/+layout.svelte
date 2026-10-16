<script lang="ts">
	import Footer from '$lib/layout/footer.svelte';
	import Header from '$lib/layout/header.svelte';
	import '../app.css';
	import '../scss/global.scss';

	// Poppins, sous-ensemble latin (≈ 8 Ko par graisse), les quatre graisses utilisées,
	// font-display: swap. Le texte courant (400) et les titres (700) sont préchargés : même
	// fichier haché que celui référencé par la feuille de style.
	import '@fontsource/poppins/latin-400.css';
	import '@fontsource/poppins/latin-500.css';
	import '@fontsource/poppins/latin-600.css';
	import '@fontsource/poppins/latin-700.css';
	import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff2?url';
	import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff2?url';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href={poppins400} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={poppins700} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div id="layout">
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>
