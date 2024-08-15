<script>
import {addDoc, getDoc, collection, deleteDoc, doc, onSnapshot, Timestamp} from 'firebase/firestore';
import db from '../Firebase';
import { location, push, link } from 'svelte-spa-router';
import { onMount } from 'svelte';
import {userStore} from '../user-auth/user-store.js';
import {onDestroy} from 'svelte';

    let unsubscribeUserStore;
    let userID;
    let threadID;

    //Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
        } else {
            console.log("User is not authenticated")
        }
    })
    
    onDestroy(() => {
        unsubscribeUserStore();
    })

    unsubscribeUserStore();


let id = $location.split('/')[2]
threadID = id;

let threadsCol = collection(db, `sections/${id}/threads`)

//Fetch user data from a user id
async function fetchUserData(userID){
    const userInfo = doc(db,`users/${userID}`)
    try {
      const docSnapshot = await getDoc(userInfo);

      if (docSnapshot.exists()) { // Makes sure that program does exist

        return {
          data: docSnapshot.data()
        };

      } else { // Document does not exist
        
        console.error('Program document does not exist');
        return null;
      }

    } catch (error) {
      console.error('Error fetching program data:', error);
      throw error;
    }
  }

//Adds a thread with associated username, title, message, and date`
async function addData(){
    const userInfo = await fetchUserData(userID)
    const addThreadForm = document.querySelector('#addThread')
    addThreadForm.addEventListener("submit", (event)=>{
        event.preventDefault()
        const tempThread = {
            username: userInfo.data.username,
            title: addThreadForm.threadTitle.value,
            message: addThreadForm.threadMessage.value,
            date_created: new Date().toJSON().slice(0,10),
            currentTime : new Date().toLocaleTimeString('en-US', { hour12: true })

        }

        console.log(tempThread.title)
        addDoc(threadsCol, tempThread)
        .then((doc)=>{
            console.log(doc);})
            .catch((e)=>{
                console.log(e);
        })
    })
}

onMount(async () => {
    await addData();
});
</script>


{#await addData}
    <p> loading...</p>
{:then id}

<div>
    <h1>Create a Forum Post</h1>
    <div class = 'form-holder'>
        <form class= "" id="addThread">
            <label for= "threadTitle">Discussion Title </label>
            <textarea class="thread-input" type="text" id="threadTitle" name= "threadTitle" required></textarea>
            <br><br>
            <label for= "threadMessage">Message </label>
            <textarea class="thread-input" type="text" id="threadMessage" name= "threadMessage" required></textarea>
            <br><br>
            <button class = 'btn-main' on:click={push(`/threads/${threadID}`)}>Back</button>
            <input class = "btn-main" type="submit" value= "Submit" on:click={push(`/threads/${threadID}`)} >
        </form>
    </div>
</div>
{/await}

<style>

textarea{
    resize: none;
    height: 100px;
    width: 100%;
    line-height: 1;
    font-size: large;
    border-radius: 5px;
    box-shadow: 1px 1px 1px #999;
}

.form-holder{
    box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    padding: 5%;
    margin: 2.5%;
}
h1{
    padding-left: 2.5%;
    margin-top: 2.5%;
    text-shadow: 1px 1px 1px #999;
}
label{
    color: var(--blue-100);
    font-weight: bold;
    font-size: 25px;
    text-align: left;
    margin-bottom: 5px;
}
</style>