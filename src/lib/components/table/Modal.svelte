<script lang="ts">
	let { selectedItem } = $props();
	import html2canvas from 'html2canvas';
</script>

<dialog bind:this={modal} id="selected-modal" class="modal">
	{#if selectedItem}
		{#if selectedItem.observation != 'non admis'}
			<div class="modal-box" bind:this={modalContent}>
				<h3>🎉 Félicitations !</h3>
				<div class="result-overview">
					<div class="icon">
						<iconify-icon icon="solar:diploma-bold" style="font-size: 100px;"></iconify-icon>
					</div>
					<div class="info">
						<h4><span>{selectedItem.last_name}</span> {selectedItem.first_name}</h4>
						<div class="mention">
							{#if selectedItem.mention === 'honorable'}
								<iconify-icon icon="token:stars"></iconify-icon>
							{:else if selectedItem.mention === 'très bien'}
								<iconify-icon icon="solar:hand-stars-bold"></iconify-icon>
							{:else if selectedItem.mention === 'bien'}
								<iconify-icon icon="solar:stars-bold"></iconify-icon>
							{:else if selectedItem.mention === 'assez bien'}
								<iconify-icon icon="solar:stars-minimalistic-bold"></iconify-icon>
							{:else if selectedItem.mention === 'passable'}
								<iconify-icon icon="solar:star-line-duotone"></iconify-icon>
							{/if}
							<h4>{selectedItem.mention}</h4>
						</div>
					</div>
				</div>
				<div class="modal-content">
					<div class="text">
						<p>Vous avez brillamment réussi le BAC 2025 !</p>
						<p>
							Nous vous souhaitons une réussite éclatante dans vos études et dans la vie. Continuez
							à viser haut, et sachez que nous espérons vous voir triompher encore l'année
							prochaine, encore plus fort et déterminé !
						</p>
					</div>
					<div class="actions">
						<button class="btn btn-base" aria-label="share button">
							<iconify-icon icon="solar:share-line-duotone" style="font-size: 20px"></iconify-icon>
							<p>Partagez votre succès</p>
						</button>
						<button class="btn btn-base" aria-label="share button">
							<iconify-icon icon="solar:pen-new-round-line-duotone" style="font-size: 20px"
							></iconify-icon>
							<p>Obtenez votre relevé</p>
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="modal-box failed">
				<h3>😔 Ce n'est que partie remise</h3>
				<div class="result-overview">
					<div class="icon">
						<iconify-icon icon="fluent:document-error-16-filled" style="font-size: 100px;"
						></iconify-icon>
					</div>
					<div class="info">
						<h4><span>{selectedItem.last_name}</span> {selectedItem.first_name}</h4>
						<div class="mention">
							<iconify-icon icon="ph:hand-waving-fill"></iconify-icon>
							<h4>{selectedItem.mention || 'Sans mention'}</h4>
						</div>
					</div>
				</div>
				<div class="modal-content">
					<div class="text">
						<p>Malheureusement, vous n'avez pas été admis au BAC 2025 cette fois-ci.</p>
						<p>
							Cela ne définit en rien votre potentiel ou votre avenir. Chaque grande réussite
							commence souvent par un défi. Gardez la tête haute, apprenez de cette expérience, et
							revenez plus fort. Nous croyons en vous et votre réussite future.
						</p>
					</div>
					<div class="actions">
						<button class="btn btn-base" aria-label="share button">
							<iconify-icon icon="solar:share-line-duotone" style="font-size: 20px"></iconify-icon>
							<p>Voulez vous partagez ?</p>
						</button>
						<button class="btn btn-base" aria-label="share button">
							<iconify-icon icon="solar:pen-new-round-line-duotone" style="font-size: 20px"
							></iconify-icon>
							<p>Obtenez votre relevé</p>
						</button>
					</div>
				</div>
			</div>
		{/if}
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	{/if}
</dialog>
