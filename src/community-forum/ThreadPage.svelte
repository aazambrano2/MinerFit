<script>
    import { onSnapshot, collection, doc, getDoc, deleteDoc, query } from 'firebase/firestore';
    import db from '../Firebase';
    import { onDestroy, onMount } from 'svelte';
    import {location, link, push} from 'svelte-spa-router'
    import {userStore} from '../user-auth/user-store.js';
    import ManagerSidebar from '../manager/ManagerSidebar.svelte';

    //get params from url
    export let params = {}
  
    let unsubscribeUserStore;
    let userID;
    let userData;
    let section = 'LOADING'
    let desc = ''

    var authenticated = false;

    $: if ($userStore != null){
      authenticated = true
    }

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

    //Fetch user data from a user id
async function fetchUserData(userID){
    const userInfo = doc(db,`users/${userID}`)
    try {
      const docSnapshot = await getDoc(userInfo);

      if (docSnapshot.exists()) { // Makes sure that program does exist

        return docSnapshot.data()

      } else { // Document does not exist
        
        console.error('Program document does not exist');
        return null;
      }

    } catch (error) {
      console.error('Error fetching program data:', error);
      throw error;
    }
  }

  async function fetchData(userID){
    const response = await fetchUserData(userID)
    userData = await response
    if (userData){
      return userData
    }
    else{
      console.error('No user data in thread page')
    }
  }
    
    

    let id = params['id']
    let threads = [];

  
    let threadsCol = collection(db, `sections/${id}/threads`);
    //Collect all threads information
    const threadsSnapshot = onSnapshot(threadsCol, (querySnapshot) => {
        threads = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort threads based on date and time
        threads.sort((a, b) => {
            const datetimeA = new Date(`${a.date_created} ${a.currentTime}`);
            const datetimeB = new Date(`${b.date_created} ${b.currentTime}`);
            return datetimeB - datetimeA; // Sort in descending order, change to datetimeA - datetimeB for ascending order

        });
    });
      
    onDestroy(() => {
      threadsSnapshot();
    });

  // Deletes a thread given thread ID
  async function deleteThread(id){
 
    const threadRef = doc(threadsCol, id)

    deleteDoc(threadRef)
    .then(()=>{
        console.log("Document Deleted")
    }) .catch((e)=>{
        console.log(e)
    })
  }

      // Function to fetch data for a specific program document
  async function fetchSectionData(id) {
    const sectionInfo = doc(db, 'sections', id);
    try {
      const docSnapshot = await getDoc(sectionInfo);
      if (docSnapshot.exists()) { // Makes sure that program does exist
        return {
          id: docSnapshot.id,
          data: docSnapshot.data()
        };
      } else 
      { // Document does not exist
        console.error('section could not be found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching program data:', error);
      throw error;
    }
  }

    fetchSectionData(id).then((object) =>{
      section = object['data']['title']
      desc = object['data']['description']
    })

  onMount( async ()=> {
      await fetchData(userID);
    })
  

  //Manager Section
  let isManager; // Default type is Customer

  // Checks what the role of the currently signed-in user is
  async function checkUserRole(userID) {
      if (!userID) {return}

      const userRef = doc(db, 'users', userID);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
          isManager = userSnap.data().type === 'Manager';
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

{#if isManager}
<ManagerSidebar>
  <h1 class="section-header">{section}</h1>
  <h3 class = "section-desc">{desc}</h3>
  <div class = "section-main">
  {#each threads as thread}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class = "thread-section" on:click={() => {push(`/sections/${id}/threads/${thread.id}`)}}>    
      <h1>{thread.title}</h1>
      <p>{thread.message.slice(0,20)} ...</p>
      <p><span class="bold">Date Created:</span> {thread.date_created}</p>
      <p><span class="bold">Time Created:</span> {thread.currentTime}</p>
      <p><span class="bold">Posted by:</span> {thread.username}</p>
    </div>
  <!-- svelte-ignore empty-block -->
  <button class="btn-main delete-button" id= "#DeleteThread" type="submit" on:click={deleteThread(thread.id)}>
    Delete
  </button>
  {/each}
  <div class = 'manager-btn-div'>
    <a href="/#/community-forum" class = 'btn-main custom-btn'>Back</a>
    <a class= "btn-main custom-btn" href="/createThread/{id}" use:link >Create Post</a>
  </div>
</div>
</ManagerSidebar>
{:else}
<h1 class = 'section-header'>{section}</h1>
<h3 class = 'section-desc'>{desc}</h3>
  <div class = "section-main">
    {#each threads as thread}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class = "thread-section" on:click={() => {push(`/sections/${id}/threads/${thread.id}`)}}>    
        <h1>{thread.title}</h1>
        <p>{thread.message.slice(0,20)} ...</p>
        <p><span class="bold">Date Created:</span> {thread.date_created}</p>
        <p><span class="bold">Time Created:</span> {thread.currentTime}</p>
        <p><span class="bold">Posted by:</span> <span class = 'username'>{thread.username}</span></p>
      </div>
      <!-- svelte-ignore empty-block -->
      {#await userData}
      {:then data}
      {#if data && thread.username == data.username}
        <button class="btn-main delete-button" id= "#DeleteThread" type="submit" on:click={deleteThread(thread.id)}>
          Delete
        </button>
      {/if}
      {/await}
    {/each}
    <div class = 'btn-div'>
      <a href="/#/community-forum" class = 'btn-main custom-btn'>Back</a>
      <a class= "btn-main custom-btn" href="/createThread/{id}" use:link >Create Post</a>
    </div>
  </div>
{/if}


<style>
  h1 , h3{
    text-align: center;
  }
  
  .custom-btn {
    text-align: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
}
.btn-div{
  padding-bottom: 5%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

  p{
    font-size: 18px;
    color: black;
  }
  .section-header{
    text-align: left;
    padding-left: 2.5%;
    margin-top: 2.5%;
    font-size: 50px;

  }
  .section-desc{
    text-align: left;
    padding-left: 2.5%;
  }
  .thread-section{
    box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    padding: 5%;
    margin-bottom: 1%;
  
  }
  .thread-section h1{
    text-align: left;
  }
  .thread-section:hover{
    cursor: pointer;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.4)
}
.delete-button{
  justify-content: center;

}
.bold {
    font-weight: bold;
}

.username{
  color:var(--orange-100);
}
.manager-btn-div{
  display: flex;
  justify-content: space-between;
  padding-top: 2%;
  padding-bottom: 5%;
  margin-bottom: 5%;
}

.manager-btn-div a{
  margin-left: auto;
}
</style>