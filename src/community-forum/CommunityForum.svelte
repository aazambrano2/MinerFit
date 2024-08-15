<script>
    import Section from './Section.svelte';
    import db from '../Firebase';
    import { onSnapshot, query, collection } from 'firebase/firestore';
    import {onDestroy} from 'svelte';
    import {location, link, push} from 'svelte-spa-router'
    import { userStore } from '../user-auth/user-store.js'
    import { onMount } from 'svelte';
    import { auth } from '../Firebase.js';
    import { getDoc, doc } from 'firebase/firestore';
    import ManagerSidebar from '../manager/ManagerSidebar.svelte';

  //Access to user store
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

    //Manager Section

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

  //
  
  const sectionQuery = query(collection(db, "sections"));

  let sections = []
  
  let sectionsCol = collection(db,'sections')
  const sectionSnapshot = onSnapshot(sectionsCol, (querySnapshot)=>{
    sections = querySnapshot.docs.map(doc=>({id:doc.id, ...doc.data()}))

  })

  onDestroy(()=>{
    sectionSnapshot();
  })

</script>
{#if isManager}
<ManagerSidebar>
  <h1>Manage Community Forum</h1>
  <div class="bottom">
    {#each sections as section}
    <Section
      title={section.title}
      description={section.description}
      id = {section.id}
    />
    {/each} 
  </div>
</ManagerSidebar>
{:else}
  <h1>Sections</h1>
  <div class="bottom">
    {#each sections as section}
    <Section
      title={section.title}
      description={section.description}
      id = {section.id}
    />
    {/each} 
  </div>
{/if}



<style>
  h1{
    text-align: center;
    font-size: 40px;
  }
  .bottom{
    margin-bottom: 10%;
  }

</style>