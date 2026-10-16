import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

const compressed = new Map<string, Promise<ArrayBuffer>>();

const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml)|image\/svg\+xml)/;

/** Brotli si le moteur le sait (Bun), sinon gzip ; `null` si le client n'accepte ni l'un ni l'autre. */
function pickEncoding(accept: string): { name: string; stream: () => CompressionStream } | null {
	if (/\bbr\b/.test(accept)) {
		try {
			new CompressionStream('brotli' as CompressionFormat);
			return { name: 'br', stream: () => new CompressionStream('brotli' as CompressionFormat) };
		} catch {
			// Pas de brotli dans CompressionStream (Node) : on retombe sur gzip
		}
	}
	if (/\bgzip\b/.test(accept)) return { name: 'gzip', stream: () => new CompressionStream('gzip') };
	return null;
}

/**
 * Compression des réponses dynamiques (HTML des pages, JSON de l'API) sur le serveur Node/Bun
 * autonome : adapter-node ne compresse que les fichiers statiques pré-compressés. Sur
 * Cloudflare (`platform.env` défini), le réseau compresse lui-même : on n'y touche pas. Les
 * sous-requêtes des fonctions `load` restent en clair.
 */
const compress: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	// adapter-node expose `platform.req` ; adapter-cloudflare, `platform.env` / `platform.cf`
	const onCloudflare = !!event.platform && 'env' in event.platform;
	if (dev || onCloudflare || event.isSubRequest || !response.body) return response;

	const type = response.headers.get('content-type') ?? '';
	if (!COMPRESSIBLE.test(type) || response.headers.has('content-encoding')) return response;
	const length = Number(response.headers.get('content-length') ?? Infinity);
	if (length < 1024) return response;

	const encoding = pickEncoding(event.request.headers.get('accept-encoding') ?? '');
	if (!encoding) return response;

	const headers = new Headers(response.headers);
	headers.set('content-encoding', encoding.name);
	headers.delete('content-length');
	headers.append('vary', 'Accept-Encoding');
	// L'ETag désigne la représentation non compressée
	const etag = response.headers.get('etag');
	if (etag && !etag.startsWith('W/')) headers.set('etag', `W/${etag}`);
	// Grosses réponses à ETag fort (jeu de données d'une année) : compressées une seule fois
	if (etag && !etag.startsWith('W/')) {
		const key = `${encoding.name}:${etag}`;
		let bytes = compressed.get(key);
		if (!bytes) {
			bytes = new Response(response.body.pipeThrough(encoding.stream())).arrayBuffer();
			compressed.set(key, bytes);
			if (compressed.size > 16) compressed.delete(compressed.keys().next().value!);
		}
		return new Response(await bytes, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}
	return new Response(response.body.pipeThrough(encoding.stream()), {
		status: response.status,
		statusText: response.statusText,
		headers
	});
};

/** Pages HTML : cache court par défaut (les assets hachés, eux, sont immuables). */
const htmlCache: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (
		(response.headers.get('content-type') ?? '').startsWith('text/html') &&
		!response.headers.has('cache-control')
	) {
		try {
			response.headers.set('cache-control', 'public, max-age=0, must-revalidate');
		} catch {
			// En-têtes immuables (réponse issue d'un fetch) : on laisse tel quel
		}
	}
	return response;
};

export const handle = sequence(compress, htmlCache);
