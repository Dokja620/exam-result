<script lang="ts">
	export let search: string = '';
	export let onSearch: () => void;

	function handleInput() {
		onSearch();
	}
</script>

<fieldset class="fieldset">
	<label class="input">
		<iconify-icon icon="tabler:search" class="text-lg"></iconify-icon>
		<input
			type="search"
			bind:value={search}
			class="grow"
			placeholder="Rechercher"
			oninput={handleInput}
		/>
	</label>
	<p class="fieldset-label">Recherchez par Matricule, Nom et Prénoms</p>
</fieldset>
