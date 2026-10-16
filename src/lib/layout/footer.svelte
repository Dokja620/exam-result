<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import profil from '$lib/assets/images/profil.webp';

	const AUTHOR = {
		name: 'Axel RAKOTOARIVAO',
		github: 'https://github.com/Dokja620',
		linkedin: 'https://www.linkedin.com/in/axel-rakotoarivao'
	};
</script>

<footer class="site-footer">
	<div class="wrap">
		<div class="author">
			<img
				src={profil}
				alt="Portrait de {AUTHOR.name}"
				class="squircle"
				width="96"
				height="96"
				loading="lazy"
				decoding="async"
			/>
			<div>
				<div class="label">Créé par</div>
				<div class="who">
					<span class="name">{AUTHOR.name}</span>
					<a
						href={AUTHOR.github}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Profil GitHub de {AUTHOR.name}"
					>
						<Icon name="github" size={15} />
					</a>
					<a
						href={AUTHOR.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Profil LinkedIn de {AUTHOR.name}"
					>
						<Icon name="linkedin" size={15} />
					</a>
				</div>
			</div>
		</div>
		<div class="colophon">
			<p>Données fictives</p>
			<p class="mono">Svelte · données JSON · hors ligne</p>
		</div>
	</div>
</footer>
