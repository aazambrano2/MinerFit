<script>
  import { onSnapshot, addDoc, collection, doc, getDoc, deleteDoc, query } from 'firebase/firestore';
  import db from '../Firebase';
  import { onDestroy, onMount } from 'svelte';
  import {location, link, push} from 'svelte-spa-router'
  import {userStore} from '../user-auth/user-store.js';
  import ManagerSidebar from '../manager/ManagerSidebar.svelte';
  
  let unsubscribeUserStore;
  let userID;
  let userData;
  let threadData;

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

async function fetchData(userID){
  const response = await fetchUserData(userID)
  userData = await response
  if (userData){
      return JSON.stringify(userData)
    }
    else{
      console.error('No user data in thread page')
    }
  }

  onMount( async ()=> {
    await fetchData(userID)
  })
//Function to fetch the thread data selected
let id = $location.split('/')[2]
let threadNum = $location.split('/')[4]


async function fetchThreadData(id){
  const threadInfo = doc(db,`sections/${id}/threads/${threadNum}`)
  try {
    const docSnapshot = await getDoc(threadInfo);

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

async function fetchDataofThread(id){
  const response = await fetchThreadData(id)
  threadData = await response
}
let comments = []
  
let commentsCol = collection(db,`sections/${id}/threads/${threadNum}/comments`)
  const commentsSnapshot = onSnapshot(commentsCol, (querySnapshot)=>{
    comments = querySnapshot.docs.map(doc=>({id:doc.id, ...doc.data()}))
    comments.sort((a, b) => {
            const datetimeA = new Date(`${a.date_created} ${a.currentTime}`);
            const datetimeB = new Date(`${b.date_created} ${b.currentTime}`);
            return datetimeB - datetimeA; // Sort in descending order, change to datetimeA - datetimeB for ascending order

        });

})

async function addComment(){
    const userInfo = await fetchUserData(userID)
    const addCommentForm = document.querySelector('#addComment')
    addCommentForm.addEventListener("submit", (event)=>{
        event.preventDefault()
        const tempComment = {
            username: userInfo.data.username,
            comment: addCommentForm.comment.value,
            date_created: new Date().toJSON().slice(0,10),
            currentTime : new Date().toLocaleTimeString('en-US', { hour12: true })

            
        }

        
        addDoc(commentsCol, tempComment)
        .then((doc)=>{
            console.log(doc);})
            .catch((e)=>{
                console.log(e);
        })
    })
}


  // Deletes a thread given thread ID
  async function deleteComment(id){
    // console.log(threads)
 
    const commentRef = doc(commentsCol, id)

    deleteDoc(commentRef)
    .then(()=>{
        console.log("Document Deleted")
    }) .catch((e)=>{
        console.log(e)
    })
  }

onDestroy(()=>{
    commentsSnapshot();
})

onMount( async ()=> {
    await fetchDataofThread(id);
    await addComment();
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
      checkUserRole(userID);
  });



</script>





{#if isManager}
<ManagerSidebar>

    {#if threadData}
  <div class="thread">
    <h1>{threadData.title}</h1><br>
    <p>{threadData.message}</p><br>
    <p><span class="bold">Date Created:</span> {threadData.date_created}</p>
    <p><span class="bold">Time Created:</span> {threadData.currentTime}</p>
    <p><span class="bold">Posted by:</span> {threadData.username}</p>
  </div>
  {:else}
    <p>Loading...</p>
  {/if}
  <div class= "comments-holder">
    <h1>Comments</h1>
    {#each comments as comment}
    
      <div>
        <p><span class="bold">Comment:</span> {comment.comment}</p>
        <p class = "smaller"><span class="bold">Added by:</span> {comment.username}</p>
        <p class = "smaller"><span class="bold">Date Added:</span> {comment.date_created}</p>
        <p class = "smaller"><span class="bold">Time Created:</span> {comment.currentTime}</p>
        
          <!-- svelte-ignore empty-block -->
          
        <button class="btn-main" id= "#DeleteComment" type="submit" on:click={deleteComment(comment.id)}>
          Delete
        </button>
      </div>
    <br><br><br>
    {/each}
  </div>
    <div class = "form-holder">
      <head>Add a Comment</head>
      <form class="card-main custom-btn" id="addComment">
          <label for="comment">Add your comment: </label> <br>
          <input type="text" id="comment" name="comment" class="comment-input" required> 
          <br><br>
          <input class="btn-main" type="submit" value="Submit">
      </form>
    </div>
</ManagerSidebar>
{:else}

  {#if threadData}
  <div class="thread">
    <h1>{threadData.title}</h1><br>
    <p>{threadData.message}</p><br>
    <p><span class="bold">Date Created:</span> {threadData.date_created}</p>
    <p><span class="bold">Time Created:</span> {threadData.currentTime}</p>
    <p><span class="bold">Posted by:</span> {threadData.username}</p>
  </div>

  {:else}
    <p>Loading...</p>
  {/if}
  <div class = "comments-holder">
    <h1>Comments</h1>
    <hr class = "line">
    {#each comments as comment}
    <div class= "comment">
    <p><span class="bold">Comment:</span> {comment.comment}</p>
    <p class = "smaller"><span class="bold">Added by:</span> {comment.username}</p>
    <p class = "smaller" ><span class="bold">Date Added:</span> {comment.date_created}</p>
    <p class = "smaller" ><span class="bold">Time Created:</span> {comment.currentTime}</p>
    
      <!-- svelte-ignore empty-block -->
      {#if userData && comment.username == userData.data.username}
              <button class="btn-main" id= "#DeleteComment" type="submit" on:click={deleteComment(comment.id)}>
                Delete
              </button>
      {/if}
      <br><br><br>
    </div>
    <hr>
    {/each}
    <div class = "form-holder">
      <form class="form" id="addComment">
        <label for="comment">Add your comment: </label> <br>
        <textarea type="text" id="comment" name="comment" class="comment-input" required></textarea>
        <br><br>
        <input class="btn-main" type="submit" value="Submit">
    </form>
    </div>

  </div>
{/if}
<style>
  p {
    font-size: 18px;
    color: black;
  }
  .custom-btn {
        color: rgb(0, 0, 0);
        background-color: rgb(255, 255, 255);
        /* font-weight: bold;
        font-size: 28px; */
        font: bold 28px Arial, sans-serif;
        text-align: center;
  }
.thread{
  box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    padding: 5%;
    margin-bottom: 1%;
    margin: 2.5%;
}
.comment{
  padding: 2.5%;

}
.comments-holder{
  box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    padding: 5%;
    margin-bottom: 1%;
    margin: 2.5%;
}
h1 {
    text-align: center;
  }
.form-holder{
  padding-top: 2.5%;
}

.bold {
    font-weight: bold;
}
.smaller{
  font-size: smaller;
}
.form{
  padding: 2.5%;
}
.line{
  margin: 2%;
}
textarea{
 width: 100%;
 height: 200px;
 resize: none;
}
</style>