<script>
    import { updateDoc, doc, getDoc } from 'firebase/firestore';
    import db from '../Firebase.js'; 
    import {userStore} from '../user-auth/user-store.js';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    // Modal variables
    const dispatch = createEventDispatcher();
    export let showModal = false;
    export let close;
    export let switchModalCoach;
    export let switchModalTrainer;
    export let switchModalCustomer;

    // User Data
    let unsubscribeUserStore;
    let userID;
    let userType;

    $: if (showModal) {
        unsubscribeUserStore();
        getUserInfo(userID);
    }

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    // Allows the user to change to a different type
    async function selectPlan(plan) {

        const userRef = doc(db, 'users', userID);
        await updateDoc(userRef, {
            type: plan // Update the type field with the selected plan
        });

        alert(`Successfully upgraded to ${plan}`);


        dispatch('planChanged');
        close();
    }

    // Gets the current user's type
    async function getUserInfo(userID) {

        const userRef = doc(db, 'users', userID);
        const userSnap = await getDoc(userRef);

        userType = userSnap.data().type;
    }

    // On page mount, gets the user's type
    onMount(() => {
        getUserInfo(userID);
    });

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
        height: 500px;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-content p {
        margin: 0px;
        margin-bottom: 20px;
    }

    .tier-group {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }

    .tier-box {
        width: 30%;
        margin-bottom: 20px;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .tier-box h3 {
        margin-bottom: 0px;
        margin-top: 20px;
        color: black;
    }

    .tier-box h4 {
        margin-bottom: 20px;
        margin-top: 20px;
        color: black;
    }

    .tier-box h5 {
        margin-bottom: 0px;
        margin-top: 0px;
        color: gray;
    }

    .tier-box button {
        height: 36px;
        width: 100px;        
        display: inline-block;
        outline: 0;
        padding: 0px 12px;
        border-radius: 20px;
        cursor: pointer;
        background-color: #e65c7b;       
        border: 0px solid #ccc;
        color: white;
        text-transform: capitalize;
        font-size: 14px;
        font-weight: 400;
        margin-top: 20px;
        margin-bottom: 20px;
        transition: all 150ms ease-in-out 0s;    
    }
    

    .tier-box button:hover {
        background-color: #cc405e;
        border: 0px solid #ccc;
    }

    .close-button {
        height: 36px;
        width: 100px;        
        display: inline-block;
        outline: 0;
        padding: 0px 12px;
        border-radius: 4px;
        cursor: pointer;
        background-color: rgb(249, 251, 250);
        box-shadow: rgb(24, 34, 122 / 30%) 0px 1px 2px;        
        border: 1px solid #ccc;
        color: rgb(61, 79, 88);
        font-size: 14px;
        font-weight: 400;
        margin: 0 auto;
        margin-top: 20px;
        transition: all 150ms ease-in-out 0s;      
    }

    .selected-tier-box {
        transform: scale(1.1);
        background-color: #f0f0f0; 
    }

</style>



{#if showModal}
    <div class="modal-backdrop">
        <div class="modal-content">
            <h2>Premium Plans</h2>
            <p>Upgrade to one of our premium plans to unlock exclusive features and take your fitness journey to the next level!</p>

                <div class="tier-group">
                    <div class="tier-box {userType === 'Customer' ? 'selected-tier-box' : ''}">
                        <h3>Basic</h3>
                        <h4>Free</h4>
                        <h5>Workout Limit: 1</h5>
                        <h5>Track Progress</h5>
                        {#if userType === 'Customer'}
                            <br><p><b>Active</b></p>
                        {:else}
                            <button on:click={switchModalCustomer}>Change Plan</button>
                        {/if}
                    </div>

                    <div class="tier-box {userType === 'Coach' ? 'selected-tier-box' : ''}">
                        <h3>Coach</h3>
                        <h4>$5.00</h4>
                        <h5>Workout Limit: 3</h5>

                        {#if userType === 'Coach'}
                            <br><p><b>Active</b></p>
                        {:else}
                            <button on:click={switchModalCoach}>Change Plan</button>
                        {/if}
                    </div>

                    <div class="tier-box {userType === 'Trainer' ? 'selected-tier-box' : ''}">
                        <h3>Trainer</h3>
                        <h4>$10.00</h4>
                        <h5>Unlimited Workouts</h5>
                        <h5>See Shared Programs</h5>
                        {#if userType === 'Trainer'}
                            <br><p><b>Active</b></p>
                        {:else}
                            <button on:click={switchModalTrainer}>Change Plan</button>
                        {/if}
                    </div>
                </div>

            <!-- Tier options here -->
            <button class="close-button" on:click={close}>Close</button>
        </div>
    </div>
{/if}

