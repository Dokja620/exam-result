<script lang="ts">
	/**
	 * QR code en SVG. La bibliothèque (qrcode-generator, sans dépendance) est importée à la
	 * demande : elle ne pèse que sur les pages qui impriment un relevé.
	 */
	let { value, label = 'QR code' }: { value: string; label?: string } = $props();

	let path = $state('');
	let size = $state(0);

	$effect(() => {
		const v = value;
		if (!v) return;
		let cancelled = false;
		import('qrcode-generator').then(({ default: qrcode }) => {
			if (cancelled) return;
			const qr = qrcode(0, 'M');
			qr.addData(v);
			qr.make();
			const n = qr.getModuleCount();
			let d = '';
			for (let y = 0; y < n; y++)
				for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
			size = n + 8;
			path = d;
		});
		return () => (cancelled = true);
	});
</script>

{#if path}
	<svg
		class="qr"
		viewBox="0 0 {size} {size}"
		role="img"
		aria-label={label}
		shape-rendering="crispEdges"
	>
		<rect width={size} height={size} fill="#fff" />
		<path d={path} fill="#020b12" />
	</svg>
{:else}
	<span class="qr qr-placeholder" aria-hidden="true"></span>
{/if}
