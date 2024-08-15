<script>

    import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
    import db from '../Firebase.js'
    import { onMount } from 'svelte';
    import {userStore} from '../user-auth/user-store';
    import {onDestroy} from 'svelte';

    let unsubscribeUserStore;
    let userID;

    // Attempt to subscribe to current user
    unsubscribeUserStore = userStore.subscribe(user => {
        if (user) {
            userID = user.uid;
            console.log(userID);
        } else {
            console.log("USER is not authenthicated!");
        }
    })

    // If page is destroyed, subscribe/unsubscribe again
    onDestroy(() => {
        unsubscribeUserStore();
    })

    let programIDs = [];
    let programInfo = [];
    let userPrograms = [];
    let dataLoaded = false;


    // Function to truncate the string to avoid characters leaving card boundary
    function truncateString(str, num) {

    if (str.length <= num) {
        return str;
    }
        return str.slice(0, num) + '...';
    }


    // Fetches all program IDs for programs that need to be displayed on the page
    async function getAllProgramIDs() {

        const querySnapshot = await getDocs(collection(db, 'programs'));

        querySnapshot.forEach((doc) => {       
        programIDs.push(doc.id); // Push each program ID to the array
        });

    }


    // Function to fetch data for a specific program document
    async function fetchProgramData(programID) {

        const programInfo = doc(db, 'programs', programID);

        try {
        const docSnapshot = await getDoc(programInfo);

        if (docSnapshot.exists()) { // Makes sure that program does exist

            return {
            id: docSnapshot.id,
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

    // Function to load the data for each program and store the data in an array
    async function loadData() {
        await getAllProgramIDs();

        for (const program of programIDs) {
        const programData =  await fetchProgramData(program)
        programInfo.push(programData)
        }
        dataLoaded = true;
        window.scrollTo(0, 0);
    }

    // Gets all the workout programs a user is enrolled in
    async function loadUserData() {
        if (!userID) return;

        const userRef = doc(db, 'users', userID);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            userPrograms = userSnap.data().active_programs || [];

        } else {
            console.log("No user data found");
        }
    }

    // Function to allow a user to enroll on a program if Enroll button is clicked
    async function enrollInProgram(programID) {
        const userRef = doc(db, 'users', userID);
        
        try {
            await updateDoc(userRef, {
                active_programs: arrayUnion(programID)
            });
            userPrograms = [...userPrograms, programID];
            console.log("User enrolled in program ${programID}");

       }  catch (error) {
            console.error("Error enrolling in program: ", error);
       }
    }

    // Making sure that data is loaded along with the svelte component
    onMount(() => {
        loadData();
        unsubscribeUserStore();
        loadUserData();        
    });


</script>

<style>


    .discover-workout-body {
        background-color: #eaeaec;
        width: 100%;
        height: 100%;
    }

    .all-programs-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .discover-card-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        flex-direction: wrap;
        justify-content: space-around;
        gap: 20px;
    }

    .discover-card {
        display: flex;
        flex-direction: column;
        background-color: var(--blue-75);
        border-radius: 10px;
        margin: 1%;
        width: 300px;
        height: 650px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Added a subtle shadow for depth */
    }

    .discover-card img {
        width: 100%
    }

    .discover-card-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;
    }

    .card-column {
        flex: 1 1 0px;
    }

    .discover-card-header {
        flex: 5;        
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        padding: 10px;
        background-color: var(--blue-50);
    }

    .discover-card-info {
        flex: 2;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

    .discover-card-buttons {
        flex: 1;
        margin-bottom: 10px;
        justify-content: center;
        display: flex;
    }
    
    .discover-card-body h5 {
        color: white;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.15em;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 10px;
        margin-bottom: 5px;
    }


    .discover-card-body p {
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.95em;
        letter-spacing: 1px;
        margin: 10px;
    }
    
    .see-schedule-button {
        background-color: white !important;
        color: var(--blue-75) !important;      
        width: auto; /* Changed from fixed width to auto for flexibility */
        height: 50px;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif; /* To match the text style */
        text-transform: uppercase; /* Consistency with the heading's text style */
        border-width: 0px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Added a subtle shadow for depth */
        margin-left: 5px;
        margin-right: 5px;
        padding-left: 20px;
        padding-right: 20px;
    }

    .see-schedule-button:hover {
        background-color: #eaeaec !important;
    }

</style>

<div class="discover-workout-body">

    <br>
    <!-- Loading of the discover container which contains all workout program cards-->
    <!-- Runs if data from programs has been stored in corresponding array-->
    {#if dataLoaded}

        <div class="all-programs-container">
        
            <div class = "all-programs-text">
                <h3>All Available Workout Programs</h3>
            </div>

            <!-- Checks that there are programs in the database -->
            {#if programInfo.length > 0}
                
                <!-- Creates a discover card for each program in the database -->
                <div class="discover-card-group">
                {#each programInfo as program}

                    <!-- Card containing workout program information-->
                    <div class="discover-card">
                        <img src="\images\equipment1.png" alt="...">

                        <div class="card-column discover-card-body">
                            <div class="discover-card-header">
                                <h5>{truncateString(program.data.name, 50)}</h5>
                                <p>{truncateString(program.data.description, 150)}</p>
                            </div>
                            <div class="card-column discover-card-info">
                                <p><b>Duration:</b> {program.data.duration} Weeks</p>
                                <p><b>Days/Week:</b> {program.data.days_per_week} Days</p>
                            </div>
                            <div class="card-column discover-card-buttons">
                                <!--<button type="button" class="see-schedule-button">See More Details</button>-->

                                {#if userPrograms.includes(program.id)}
                                    <button type="button" class="see-schedule-button" disabled>Enrolled</button>
                                {:else}    
                                    <button type="button" class="see-schedule-button" on:click="{() => enrollInProgram(program.id)}">Enroll</button>
                                {/if}

                            </div>
                        </div>
                    </div>
                    
                {/each}
                </div>

            {:else} <!-- If there are no programs in the database -->
                <p>No available programs found.</p>
            {/if}

        </div>
    
    <!-- Displays loading disc if the program data has not been loaded in yet -->
    {:else}
        <div class="loader"style="display: flex; align-items:center; justify-content: center;">
            <div class="spinner-border"  role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    {/if}

    <br>

    </div>