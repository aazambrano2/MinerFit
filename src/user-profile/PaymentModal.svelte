<script>
    import { updateDoc, doc, getDoc, getDocs, orderBy, collection, query, limit } from 'firebase/firestore';
    import db from '../Firebase.js'; 
    import {userStore} from '../user-auth/user-store.js';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    // Modal variables
    const dispatch = createEventDispatcher();

    export let showPayment = false;
    export let close;
    
    let unsubscribeUserStore;
    let userID;
    let userType;

    // Selected Tier
    export let selectedTier;
    export let selectedPrice;

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    // Gets the current user's type
    async function getUserInfo(userID) {

        const userRef = doc(db, 'users', userID);
        const userSnap = await getDoc(userRef);

        userType = userSnap.data().type;
    }

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

    // Allows the selectPlan to run upon form submission
    function planPurchaseEvent(event) {
        event.preventDefault();
        incrementRevenue(selectedTier);
        selectPlan(selectedTier);
    }

    // Increments the websites revenue
    async function incrementRevenue(selectedTier) {

        let price;
        if (selectedTier === 'Coach') {
            price = 5;
        } else { // Trainer
            price = 10;
        }

        const revenueRef = collection(db, 'revenue');

        const filtered = query(revenueRef, orderBy('weekNum', 'desc'), limit(1));

        const querySnapshot = await getDocs(filtered);
        if (!querySnapshot.empty) {
            const highestWeekDoc = querySnapshot.docs[0];
            const docRef = doc(db, 'revenue', highestWeekDoc.id);
            await updateDoc(docRef, {
                earnings: highestWeekDoc.data().earnings + price
            })
            console.log("Incremented earnings for week", highestWeekDoc.data().earnings);
        } else {
            console.log("No revenue document found!");
        }
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
        flex-direction: row;
        justify-content: center;
        background: white;
        width: 600px;
        height: 500px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .payment-form {
        flex: 3;
        background: white;
        border-radius: 8px;
        width: 100% !important;
        height: 100%;
        justify-content: center;
        align-content: center;
        padding: 20px;
    }

    .payment-cart {
        display: flex;
        flex: 2;
        flex-direction: column;
        background-color: #DCDCDC;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }

    .payment-group {
        margin-bottom: 15px;
        width: 100% !important;
    }

    .payment-horizontal {
        display: flex;
        display: row;
        gap: 20px;
    }

    .payment-label {
        display: block;
        margin-bottom: 5px;
        color: gray;
        font-family: Ro;
    }

    .payment-input {
        width: 100% !important;
        height: 40px;
        padding: 8px;
        border-radius: 1px;
        border: 1px solid #ccc;
        text-align: center;
    }

    .payment-input::-webkit-outer-spin-button,
    .payment-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .section-title {
        margin: 0px !important;
        padding-bottom: 20px;
    }

    .payment-button {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        background-color: #e65c7b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    
    .payment-button:hover {
        background-color: #cc405e;
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
        margin-left: auto;    
    }

    .payment-title {
        display: flex;
        flex-direction: row;
        gap: 5px;
        height: 25px;
        margin-bottom: 25px;
        justify-content: center;
        opacity: 80%;
        filter: grayscale(100%);
    }

    .balance-title {
        display: flex;
        flex-direction: row;
        gap: 5px;
        height: 25px;
        justify-content: center;
        opacity: 80%;
        filter: grayscale(100%);
        margin: 0px;
    }

</style>

{#if showPayment}
    <div class="modal-backdrop">
        <div class="modal-content">

            <div class="payment-form">

                <div class="payment-title">
                    <img src="\images\lock.png" alt="..." style="height:100%">
                    <h2 class="section-title">Payment</h2>
                </div>

                <form on:submit={planPurchaseEvent}>
                    <div class="payment-group">
                        <label class="payment-label" for="cardholder">Cardholder's Name:</label>
                        <input class="payment-input" type="text" id="cardholder" name="cardholder" required>
                    </div>
                    <div class="payment-group">
                        <label class="payment-label" for="cardnumber">Card Number:</label>
                        <input class="payment-input" type="text" id="cardnumber" name="cardnumber" minlength="16" maxlength="16" placeholder="- - - -  - - - -  - - - -  - - - -" required>
                    </div>
                    <div class="payment-horizontal">
                        <div class="payment-group">
                            <label class="payment-label" for="expmonth">Expiry Month:</label>
                            <input class="payment-input" type="text" id="expmonth" name="expmonth" minlength="2" maxlength="2" placeholder="MM" required>
                        </div>
                        <div class="payment-group">
                            <label class="payment-label" for="expyear">Expiry Year:</label>
                            <input class="payment-input" type="text" id="expyear" name="expyear" minlength="2" maxlength="2" placeholder="YY" required>
                        </div>
                        <div class="payment-group">
                            <label class="payment-label" for="cvv">CVV:</label>
                            <input class="payment-input" type="text" id="cvv" name="cvv" minlength="3" maxlength="3" required>
                        </div>
                    </div>    
                    <button class="payment-button" type="submit">Pay Now</button>
                </form>
                <button class="close-button" on:click={close}>Close</button>  
            </div>

            <div class="payment-cart">
                <h4 class="balance-title">Tier</h4> 
                <h1 class="balance-title" style="margin-bottom: 50px;"> {selectedTier} </h1>

                <h4 class="balance-title">Balance</h4>
                <h1 class="balance-title">{selectedPrice}</h1>              
            </div>



        </div>
    </div>
{/if}