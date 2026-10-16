<script lang="ts" module>
	/** Icônes Tabler (traits 2px) intégrées en SVG : aucun appel réseau. */
	const PATHS = {
		search: 'M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6',
		x: 'M18 6l-12 12M6 6l12 12',
		share:
			'M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M8.7 10.7l6.6 -3.4M8.7 13.3l6.6 3.4',
		link: 'M9 15l6 -6M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463',
		printer:
			'M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z',
		download: 'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2M7 11l5 5l5 -5M12 4l0 12',
		'chevron-left': 'M15 6l-6 6l6 6',
		'chevron-right': 'M9 6l6 6l-6 6',
		'chevrons-left': 'M11 7l-5 5l5 5M17 7l-5 5l5 5',
		'chevrons-right': 'M7 7l5 5l-5 5M13 7l5 5l-5 5',
		'chevron-down': 'M6 9l6 6l6 -6',
		'arrow-right': 'M5 12l14 0M13 18l6 -6M13 6l6 6',
		'arrow-left': 'M5 12l14 0M5 12l6 6M5 12l6 -6',
		check: 'M5 12l5 5l10 -10',
		school: 'M22 9l-10 -4l-10 4l10 4l10 -4v6M6 10.6v5.4a6 3 0 0 0 12 0v-5.4',
		'wifi-off':
			'M12 18l.01 0M9.172 15.172a4 4 0 0 1 5.656 0M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374M3 3l18 18',
		'file-search':
			'M14 3v4a1 1 0 0 0 1 1h4M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v4.5M16.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M18.5 19.5l2.5 2.5'
	} as const;
	/** Logos de marque (Simple Icons), pleins : dessinés en fill, pas en trait. */
	const BRANDS = {
		github:
			'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
		linkedin:
			'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
	} as const;
	export type IconName = keyof typeof PATHS | keyof typeof BRANDS;
	const isBrand = (n: IconName): n is keyof typeof BRANDS => n in BRANDS;
</script>

<script lang="ts">
	let { name, size = 20, label }: { name: IconName; size?: number; label?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={isBrand(name) ? 'currentColor' : 'none'}
	stroke={isBrand(name) ? 'none' : 'currentColor'}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label}
	class="icon"
>
	<path d={isBrand(name) ? BRANDS[name] : PATHS[name]} />
</svg>
