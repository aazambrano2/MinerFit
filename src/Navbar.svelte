<!-- Navbar.svelte -->
<script>
    import {link, push} from 'svelte-spa-router'
    import { userStore } from './user-auth/user-store.js'
    import { onMount } from 'svelte';
    import { auth } from './Firebase.js';
    import db from './Firebase.js';
    import { getDoc, doc } from 'firebase/firestore';

    var authetincated = false;

	$: if ($userStore != null){
		console.log($userStore)
		authetincated = true
	}

    let unsubscribeUserStore;
    let userID;
    let username = '';

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    async function signOut() {
        try {
            await auth.signOut(); // Sign out using Firebase Authentication
            userStore.set(null); // Update userStore after successful sign-out
            push('/'); // Redirect to the home page or any other appropriate page
        } catch (error) {
            console.error('Error signing out:', error.message);
            // Handle sign-out error if needed
        }
    }

    let isManager; // Default type is Customer

    // Checks what the role of the currently signed-in user is
    async function checkUserRole(userID) {
        if (!userID) {return}

        const userRef = doc(db, 'users', userID);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            isManager = userSnap.data().type === 'Manager';
            username = userSnap.data().username;
        } else {
            console.log("No user document found");
        }
    }

    // Makes sure all data is loaded along with the svelte component
	onMount(() => {
        unsubscribeUserStore();
        checkUserRole(userID);
    });
    

</script>
<nav>
    {#if isManager}
            <a href="/home-manager" use:link>
                <img src='images/minerfit-logo.png' alt="MinerFit Logo"/>
            </a>
            <a href="/" on:click={signOut}>Sign Out</a>
    {:else}
        {#if authetincated}
            <a href="/home" use:link>
                <img src='images/minerfit-logo.png' alt="MinerFit Logo"/>
            </a>
            <a href="/home" use:link>Home</a>
        {:else}
            <a href="/" use:link>
                <img src='images/minerfit-logo.png' alt="MinerFit Logo"/>
            </a>
            <a href="/" use:link>Home</a>
        {/if}
            <a href="/nutrition" use:link>Nutrition</a>
            <a href="/workout-plans" use:link>Workout Plans</a>
            <a href="/community-forum" use:link>Community Forum</a>
            <a href="/about-us" use:link>About Us</a>
        {#if authetincated}
            <a id="sign-out" href="/" on:click={signOut}>Sign Out</a>
        {:else}
            <a id="sign-out" href="/login" use:link>Sign In</a>
        {/if}
        {#if authetincated}
            <a class="profile-link" href="/profile" use:link>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-square" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                  </svg>
                {username}
            </a>
        {/if}
    {/if}
</nav>
<style>
    #sign-out {
        margin-left: auto;
    }
    .profile-link {
        display: flex;
        align-items: center;
        padding:8px;
        border-radius: 10px;
        border: 1px solid var(--silver-50);
        transition: .2s ease-in-out;
        letter-spacing: 1px;
        overflow: hidden;
        margin-bottom: 5px;
    }
    .profile-link svg {
        height: 22px;
        width: auto;
        margin-right: 15px;
    }
    .profile-link:hover {
        box-shadow: 0px 9px 8px rgba(0, 0, 0, 0.8);
        transform: translateY(-1px);
    }
    .profile-link:active {
        transform: translateY(1px);
    }
    img {
        height: 35px;
        width:auto;
    }
    nav {
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 5px 5px rgba(0,0,0,0.1);
        display:flex;
        height: 75px;
        width:auto;
        padding-left:30px;
        background-color: var(--blue-75);
        align-items: center;
    }
    a {
        color: white;
        letter-spacing: 2px;
        text-transform: uppercase;
        transition: 0.15s ease-in-out;
        position: relative;
        padding-bottom: 5px;
        font-family: var(--font-title);
        text-decoration: none;
    }
    a{
        margin-right: 20px;
    }
    a:first-child {
        margin-right: 40px;
        padding:0;
    }
    a:last-child {
        margin-right: 40px;
    }
    a:not(.profile-link):hover {
        color:var(--orange-50);
    }
    a:not(.profile-link)::before {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 2px;
        background-color: var(--orange-75);
        transition: width 0.3s ease;
    }
    a:hover::before {
        width: 100%;
    }
    a:first-child::before {
        height: 0px; /* Removes underline from logo */
    } 
</style>
