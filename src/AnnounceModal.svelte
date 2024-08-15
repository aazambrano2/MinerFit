<script>
    import { collection, doc, query, getDocs, orderBy, limit } from "firebase/firestore";
    import {userStore, showModalAnnounce} from './user-auth/user-store.js';
    import db from './Firebase.js'


    // User Data
    let unsubscribeUserStore;
    let userID;
    let latestMessage = "";

    // Toggles the TierModal
    function toggleModalAnnounce() {
        showModalAnnounce.set(false);
    }

    $: if (showModalAnnounce) {
        unsubscribeUserStore();
        getLatestAnnouncement();
    }

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    // Function to fetch the latest announcement's message
    async function getLatestAnnouncement() {
        try {
            // Order by 'created_date' descending
            const q = query(collection(db, "announcements"), orderBy("created_date", "desc"), limit(1));

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.log('No announcements found.');
                close();
            }

            // Extract the message of the latest announcement
            const latestAnnouncement = querySnapshot.docs[0];

            latestMessage = latestAnnouncement.data().message

        } catch (error) {
            console.error('Error fetching the latest announcement:', error);
            close();
        }
    }


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
        background: rgb(243, 251, 255);
        width: 600px;
        height: 150px;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .image-container {
        display: flex;
        flex: 3;
        height: 100%;
    }

    .content-container {
        display: flex;
        flex-direction: column;
        flex: 9;
        margin: 0px;
    }

    .content-container h2 {
        margin: 0px;
        color: black;
    }

    .content-container h4 {
        margin: 0px;
        margin-top: 5px;
        color: black;
        opacity: 70%;
    }

</style>



{#if $showModalAnnounce}
    <div class="modal-backdrop">
        <div class="modal-content" on:click={toggleModalAnnounce} role="button" tabindex="0" on:keydown={close}>

            <div class="image-container">
                <img src='\images\important.png' alt="">
            </div>

            <div class="content-container">
                <h2>Announcement</h2>
                <h4>{latestMessage}</h4>
            </div>
        </div>
    </div>
{/if}

