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
	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	let { name, size = 20, label }: { name: IconName; size?: number; label?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label}
	class="icon"
>
	<path d={PATHS[name]} />
</svg>
