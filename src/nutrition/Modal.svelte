<script>
	export let showModal; // boolean

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div style="height:90%;" on:click|stopPropagation>
			<slot />
        <div class="line"></div>
		<!-- svelte-ignore a11y-autofocus -->
		<button autofocus on:click={() => dialog.close()}>CLOSE</button>
	</div>
</dialog>

<style>
	dialog {
		border-radius: 20px;
		border: none;
		padding: 20px;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
		height:30px;
        width:200px;
        font-size: 15px;
        padding: 0;
		margin: 0 auto;
		background-color: transparent;
		border: none;
		font-size: 1rem;
		color: var(--blue-50);
		font-weight: bold;
		transition: .2s ease-in-out;
	}
	button:hover {
		cursor: pointer;
		color: var(--orange-50);
	}
	.line {
		width: 100%;
		background-color: var(--blue-25);
		opacity: .4;
		height: 1px;
		margin: 35px 0 5px 0;
	}
</style>