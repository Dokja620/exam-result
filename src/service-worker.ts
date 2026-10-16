/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * Hors-ligne : les assets du build sont pré-cachés, les résultats JSON
 * (`/api/results?annee=…`) sont servis depuis le cache puis rafraîchis en
 * arrière-plan (stale-while-revalidate). Les navigations passent par le
 * réseau avec repli sur la page d'accueil en cache.
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const ASSETS_CACHE = `assets-${version}`;
const DATA_CACHE = 'results-data-v2';
const PAGES_CACHE = 'pages-v1';
// Les images Open Graph ne servent qu'aux robots des réseaux sociaux : pas de pré-cache
const ASSETS = [...build, ...files.filter((f) => !f.startsWith('/og/'))];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		Promise.all([
			caches.open(ASSETS_CACHE).then((cache) => cache.addAll(ASSETS)),
			// Page d'accueil + métadonnées : disponibles hors-ligne dès la première visite.
			// (Les données de l'année sont mises en cache par la page elle-même, voir +page.svelte.)
			caches.open(PAGES_CACHE).then((cache) => cache.add('/').catch(() => undefined)),
			caches.open(DATA_CACHE).then((cache) => cache.add('/api/results').catch(() => undefined))
		]).then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(k) =>
								(k.startsWith('assets-') && k !== ASSETS_CACHE) ||
								(k.startsWith('results-data-') && k !== DATA_CACHE)
						)
						.map((k) => caches.delete(k))
				)
			)
			.then(() => sw.clients.claim())
	);
});

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	const network = fetch(request)
		.then((res) => {
			if (res.ok) cache.put(request, res.clone());
			return res;
		})
		.catch(() => undefined);
	if (cached) {
		void network;
		return cached;
	}
	const res = await network;
	if (res) return res;
	return new Response(JSON.stringify({ error: 'Hors ligne' }), {
		status: 503,
		headers: { 'content-type': 'application/json' }
	});
}

/**
 * Jeu de données d'une année à URL immuable (`?annee=…&v=<empreinte>`) : le cache d'abord ;
 * à la mise en cache d'une nouvelle empreinte, les anciennes de la même année sont retirées.
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;
	const res = await fetch(request);
	if (res.ok) {
		const url = new URL(request.url);
		const annee = url.searchParams.get('annee');
		for (const old of await cache.keys()) {
			const u = new URL(old.url);
			if (u.searchParams.get('annee') === annee && u.searchParams.has('v') && u.href !== url.href)
				await cache.delete(old);
		}
		await cache.put(request, res.clone());
	}
	return res;
}

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);
	try {
		const res = await fetch(request);
		if (res.ok) cache.put(request, res.clone());
		return res;
	} catch {
		const cached = (await cache.match(request)) ?? (await cache.match('/'));
		return cached ?? new Response('Hors ligne', { status: 503 });
	}
}

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	// Assets immuables du build
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(request).then((r) => r ?? fetch(request)));
		return;
	}

	// Données de résultats (métadonnées + année + candidat)
	if (url.pathname === '/api/results' && url.searchParams.has('v')) {
		event.respondWith(cacheFirst(request, DATA_CACHE));
		return;
	}
	if (url.pathname === '/api/results') {
		event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
		return;
	}

	// Pages
	if (request.mode === 'navigate') {
		event.respondWith(networkFirst(request, PAGES_CACHE));
	}
});
