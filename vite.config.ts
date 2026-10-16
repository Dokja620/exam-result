import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	// Bun lie @fontsource depuis son cache global, hors du projet : sans ceci le
	// serveur de dev refuse (403) de servir les .woff2. Sans effet sur le build.
	server: { fs: { strict: false } }
});
