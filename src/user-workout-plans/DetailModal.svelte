<script>
    import { updateDoc, doc, getDoc } from 'firebase/firestore';
    import db from '../Firebase.js'; 
    import {userStore} from '../user-auth/user-store.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let showModalDetails = false;
    export let close;
    
    let unsubscribeUserStore;
    let userID;

    $: if (showModalDetails) {
        unsubscribeUserStore();
    }

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
            close();
        }
    })

</script>


<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: white;
        width: 600px;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

</style>

{#if showModalDetails}
    <div class="modal-backdrop">
        <div class="modal-content">
            <h2>Premium Plans</h2>
            <p>Upgrade to one of our premium plans to unlock exclusive features and take your fitness journey to the next level!</p>

            <!-- Tier options here -->
            <button class="close-button" on:click={close}>Close</button>
        </div>
    </div>
{/if}

