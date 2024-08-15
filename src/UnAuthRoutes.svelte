<script>
	import Router from 'svelte-spa-router';
	import Landingpage from './Landingpage.svelte';
	import Login from './user-auth/Login.svelte';
    import Register from './user-auth/Register.svelte';
  import AboutUs from './AboutUs.svelte'
    
    const routes = {
        '/': Landingpage,
        '/weekly-schedule': Login,
        '/nutrition': Login,
        '/community-forum': Login,
        '/about-us': AboutUs,
        '/workout-plans': Login,
        '/discover': Login,
        '/workout-builder': Login,
        '/login': Login,
        '/register': Register,
        '/*': Landingpage
	}
</script>
<!-- 
  @component 
  Sets the url routes for unauthorized users. 
  These routes are meant to be replaced when the user logs in.

  - Usage:
  ```tsx
  <UnAuthRoutes/>
  ``` 
-->
<Router {routes}/>