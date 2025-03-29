<script lang="ts">
	import Footer from '$lib/layout/footer.svelte';
	import Header from '$lib/layout/header.svelte';
	import '../app.css';
	import '../scss/global.scss';
	let { children } = $props();
</script>

<Header />
<main>
	{@render children()}
</main>
<Footer />
