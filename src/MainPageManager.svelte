
<script>
	import db from './Firebase.js';
    import { doc, getDoc } from './Firebase.js';
    import { onMount } from 'svelte';
    import { link, push } from 'svelte-spa-router';
    import { userStore } from './user-auth/user-store';
    import { addDoc, collection, Timestamp } from 'firebase/firestore';
    import ManagerSidebar from './manager/ManagerSidebar.svelte';

	let unsubscribeUserStore;
    let userID;

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    let message = '';
    let expirationDate = '';

	// Adds a new announcement to the corresponding collection
    async function submitAnnouncement() {
        if (!message || !expirationDate) {
            console.error('All fields are required.');
            return;
        }

        try {
            await addDoc(collection(db, 'announcements'), {
                message: message,
                expiration_date: Timestamp.fromDate(new Date(expirationDate)),
				created_by: userID,
                created_date: Timestamp.fromDate(new Date())
            });
            console.log('Announcement added successfully');

            // Clear the form fields after submission
            message = '';
            expirationDate = '';
        } catch (error) {
            console.error('Error adding announcement:', error);
        }
    }

	// Makes sure all data is loaded along with the svelte component
	onMount(() => {
        unsubscribeUserStore();
    });


</script>
<ManagerSidebar>
    <div class="form-wrapper">
        <h1>Make an announcement</h1>
        <form on:submit|preventDefault={submitAnnouncement}>
            <div>
                <label for="message">Message</label>
            </div>
            <textarea id="message" bind:value={message} required></textarea>
            <div>
                <label for="expirationDate">Expiration date</label>
            </div>
            <input type="date" id="expirationDate" bind:value={expirationDate} required>
            <hrule class="line"></hrule>
            <button class="btn-main" type="submit">Submit</button>
        </form>
    </div> 
</ManagerSidebar>
<style>
.form-wrapper {
    display: flex;
    flex-direction: column;
    width: 80%;
    margin: 0 auto;
    box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding:20px 0;
  }
  .form-wrapper h1 {
    margin-left: 20px;
    font-weight: 500;
    font-size: 1.2rem;
    line-height: 1.2;
    color: #212636;
  }
  .form-wrapper div {
    border-bottom: 1px solid #dcdfe4;
    border-top: 1px solid #dcdfe4;
    background-color: #f4f3f3;
    padding:16px;
  }
  .form-wrapper label {
    color: #667085;
    font-weight: 500;
    font-size: 0.975rem;
  }
  form {
      width: auto;
      display: flex;
      flex-direction: column;
  }
  input, 
  textarea {
      padding: 10px 5px;
      border-radius: 5px;
      border: 1px solid var(--blue-25);
      width: 300px;
      color: var(--blue-50);
      font-weight: bold;
      transition: .1s ease-in-out;
      margin:15px auto;
  }
  textarea {
    width: 600px;
    height: 175px;
  }
  input:focus {
      border: 1px solid var(--blue-100);
  }
  .form-wrapper button {
    font-size: 15px;
    width: 230px;
    height: 35px;
    margin: 15px auto;
  }
  hrule {
    width: 100%;
    height: 1px;
    background-color: #dcdfe4
  }
</style>