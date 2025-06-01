<script lang="ts">
	export let search: string;
</script>

<fieldset class="fieldset">
	<label class="input">
		<iconify-icon icon="tabler:search" class="text-lg"></iconify-icon>
		<input type="search" bind:value={search} class="grow" placeholder="Rechercher" />
	</label>
	<p class="fieldset-label">Recherchez par matricule, nom, série, école ou mention</p>
</fieldset>
