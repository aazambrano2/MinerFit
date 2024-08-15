<script>
	import { userStore } from './user-auth/user-store.js'
	import routes from './routes.js'
	import Router from 'svelte-spa-router'
	import Navbar from './Navbar.svelte'
	import UnAuthRoutes from './UnAuthRoutes.svelte';

	var authetincated = false;

	$: if ($userStore != null){
		authetincated = true
	}
</script>
{#if authetincated}
	<Navbar/>
	<Router {routes}/>
{:else}
	<Navbar/>
	<UnAuthRoutes/> 
{/if}