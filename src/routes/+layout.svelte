<script lang="ts">
	import Footer from '$lib/layout/footer.svelte';
	import Header from '$lib/layout/header.svelte';
	import '../app.css';
	import '../scss/global.scss';

	import '@fontsource/lato/400.css';
	import '@fontsource/lato/700.css';
	import '@fontsource/lato/900.css';
	let { children } = $props();
</script>

<Header />
<main>
	{@render children()}
</main>
<Footer />
