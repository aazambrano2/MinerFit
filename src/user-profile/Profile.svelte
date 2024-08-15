<script>
    import {doc, getDoc, auth} from '../Firebase.js';
    import db from '../Firebase.js'
    import { reauthenticateWithCredential, EmailAuthProvider, updatePassword as updateFirebasePassword } from "firebase/auth";
    import { onMount } from 'svelte';
    import {userStore} from '../user-auth/user-store.js';
    import { updateDoc } from 'firebase/firestore';
    import TierModal from './TierModal.svelte';
    import PaymentModal from './PaymentModal.svelte';
    import { createEventDispatcher } from 'svelte';

    // Modal variables
    const dispatch = createEventDispatcher();
    
    let showModal = false;
    let showPayment = false;

    // Selected Tier
    export let selectedTier;
    export let selectedPrice;

    // Toggles the TierModal
    function toggleModal() {
        showModal = !showModal;
    }

    function togglePayment() {
        showPayment = !showPayment;
    }

    function switchToPayment() {
        showModal = false;
        showPayment = true;
    }


    let unsubscribeUserStore;
    let userID;

    // User attributes
    let username = '';
    let email = '';
    let type = '';
    let dateCreated = '';
    let currPassword = '';
    let newPassword = '';

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
            email = user.email;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    async function updatePassword() {
        try {
            if (!currPassword.trim()) {
                alert("Please enter your current password.");
                return;
            }
            if (!newPassword.trim()) {
                alert("Please enter your new password");
                return;
            }

            // Reauthenticate using the current password provided
            const credential = EmailAuthProvider.credential(
                email, currPassword
            );


            await reauthenticateWithCredential(auth.currentUser, credential);

            await updateFirebasePassword(auth.currentUser, newPassword);

            currPassword = '';
            newPassword = '';

            alert("Password updated successfully.");
        } catch (error) {
            console.error("Error updating password: ", error);
            alert("Failed to update password. Please ensure your current password is correct.");
        }
    }

    // Checks what the role of the currently signed-in user is
    async function getUserInfo(userID) {
        if (!userID) {return}

        const userRef = doc(db, 'users', userID);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            type = userSnap.data().type;
            username = userSnap.data().username;
            dateCreated = userSnap.data().dateCreated ? userSnap.data().dateCreated.toDate().toLocaleDateString() : 'Unknown';
        } else {
            console.log("No user document found");
        }
    }

    // Currently only updates the username
    async function updateUser() {

        try {
            const userRef = doc(db, 'users', userID);
            await updateDoc(userRef, {
                username: username
            });
            alert('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user.');
        }
    }

    // Makes sure all data is loaded along with the svelte component
	onMount(() => {
        unsubscribeUserStore();
        getUserInfo(userID);
    });

    // Allows the user to change to a different type
    async function selectPlan(plan) {

        const userRef = doc(db, 'users', userID);
        await updateDoc(userRef, {
            type: plan // Update the type field with the selected plan
        });

        alert(`Successfully upgraded to ${plan}`);
        console.log(`Plan updated to ${plan} successfully!`);

        dispatch('planChanged');
        close();
    }

    
    function selectCustomerTier() {

        if (type === 'Coach' || type === 'Trainer') {
            const confirmUpdate = confirm("Are you sure you want to demote your tier?");
            if (confirmUpdate) {
                selectPlan('Customer');
                toggleModal();
                type = 'Customer';
            }
        }
    }


    function selectCoachTier() {

        if (type === 'Trainer') {
            const confirmUpdate = confirm("Are you sure you want to demote your tier?");
            if (confirmUpdate) {
                selectPlan('Coach');
                toggleModal();
                type='Coach';
            }
        } else {
            selectedTier = 'Coach';
            selectedPrice = "$5.00";
            switchToPayment();            
        }
    }

    function selectTrainerTier() {
        selectedTier = 'Trainer';
        selectedPrice = "$10.00";
        switchToPayment();
    }


</script>


<style>
    
    .user-profile-body {
        background-color: #eaeaec;        
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .profile-section {
        background-color: white;     
        margin-top: 50px;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: left;
    }

    .account-settings {
        display: flex;
        flex-direction: column;
    }

    .password-group {
        display: flex;
        flex-direction: row;
        gap: 15px;
    }

    .password-item {
        display: flex;
        flex-direction: column;
    }

    .password-item input {
        width: 145px !important;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 15px;
        padding: 10px;
        color: #555;
    }

    .account-settings label {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 15px;
    }

    .account-settings input {
        width: 300px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 15px;
        padding: 10px;
        color: #555;
    }

    .account-settings button {
        height: 36px;
        width: 100px;        
        display: inline-block;
        outline: 0;
        padding: 0px 12px;
        border-radius: 4px;
        cursor: pointer;
        background-color: white;
        box-shadow: rgb(24, 34, 122 / 30%) 0px 1px 2px;        
        border: 1px solid #ccc;
        color: rgb(61, 79, 88);
        font-size: 14px;
        font-weight: bold;
        margin-left: auto;
        margin-top: 10px;
        transition: all 150ms ease-in-out 0s;     
    }

    .account-settings button:hover {
        color: rgb(24, 34, 122);
        background-color: whitesmoke;
        border: 1px solid #ccc;
        box-shadow: rgb(0 0 0 / 30%) 0px 4px 4px, rgb(232, 231, 238) 0px 0px 0px 3px;
    }

    .member-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }

    .member-group input {
        width: 100px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 15px;
        padding: 10px;
        color: #555;
    }

    .member-group input, .member-group label, .member-group button {
        margin: 0px;
    }

</style>


<div class="user-profile-body"> 

    <div class="profile-section">
        {#if userID}
            <div class="account-settings">
                <h2>Account Settings</h2>
                <label for="account-username">Username:</label>
                <input id="account-username" type="text" bind:value={username} />

                <label for="account-email">Email:</label>
                <input id="account-email" type="email" bind:value={email} disabled/>

                <label for="account-type">Type:</label>
                <input id="account-type" type="text" bind:value={type} disabled/>

                <label for="account-created">Date Created:</label>
                <input id="account-created" type="text" bind:value={dateCreated} disabled/>

                <button on:click={updateUser}>Save</button>
            </div>
        {:else}
            <p>User is not authenticated.</p>
        {/if}
    </div>     

    <div class="profile-section">
            <div class="account-settings">
                <h2>Change Password</h2>
                <div class="password-group">
                    <div class="password-item">
                        <label for="account-curr-password">Current Password:</label>
                        <input id="account-curr-password" type="text" bind:value={currPassword} />
                    </div>

                    <div class="password-item">
                        <label for="account-new-password">New password:</label>
                        <input id="account-new-password" type="text" bind:value={newPassword} />
                    </div>
                </div>
                <button on:click={updatePassword}>Update</button>
            </div>
    </div>   

    <div class="profile-section">
        <div class="account-settings">
            <h2>Membership</h2>
            <div class="member-group">
                <label for="membership-tier">Current Tier:</label>
                <input id="membership-tier" type="text" bind:value={type} disabled/>
                <button on:click={toggleModal}>Upgrade Tier</button>   
            </div>     
        </div>
    </div>
    
    <TierModal {showModal} {selectedPrice} {selectedTier} close={toggleModal} switchModalCustomer={selectCustomerTier} switchModalCoach={selectCoachTier} switchModalTrainer={selectTrainerTier} userType={type} on:planChanged={() => getUserInfo(userID)}/>
    <PaymentModal {showPayment} {selectedPrice} {selectedTier} close={togglePayment} userType={type} on:planChanged={() => getUserInfo(userID)}/>
</div>
