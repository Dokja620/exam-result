import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Cloudflare by default; ADAPTER=node builds a standalone server (used by the Dockerfile).
const adapter =
	process.env.ADAPTER === 'node' ? adapterNode({ out: 'build' }) : adapterCloudflare();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter
	}
};

export default config;
