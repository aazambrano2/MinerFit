<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

<script>

    import {doc, getDoc} from '../Firebase.js';
    import db from '../Firebase.js'
    import { onMount, onDestroy } from 'svelte';
    import { link, push } from 'svelte-spa-router';
    import {userStore} from '../user-auth/user-store';
    import { arrayRemove, updateDoc, arrayUnion } from 'firebase/firestore';
    import DetailModal from './DetailModal.svelte';

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

    // Attribute for making the details modal appear
    let showModalDetails = false;
    let selectedProgram = "";

    function toggleModal(programID) {
        selectedProgram = programID;
        showModalDetails = !showModalDetails;
    }

    // If page is destroyed, subscribe/unsubscribe again
    onDestroy(() => {
        unsubscribeUserStore();
    })

    // Run whenever the page loads
    unsubscribeUserStore();

    let enrolledProgramInfos = [];
    let dataLoaded = false;
    let numOfPrograms = 0;
    let userType = "Customer";
    let userActivePrograms = [];


    // Function to fetch data for a specific user document
    async function fetchUserData(userId) {

        const userInfo = doc(db, 'users', userId);

        try {
        const docSnapshot = await getDoc(userInfo);

        if (docSnapshot.exists()) { // The user was found

            userType = docSnapshot.data().type;
            
            return {
            id: docSnapshot.id,
            data: docSnapshot.data().active_programs
            };

        } else {
            // User does not exist
            console.error('User document does not exist');
            return null;
        }
        } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
        }
    }

    // Function to fetch data for a specific program document
    async function fetchProgramData(programID) {

        const programInfo = doc(db, 'programs', programID);

        try {
        const docSnapshot = await getDoc(programInfo);

        if (docSnapshot.exists()) {

            return {
            id: docSnapshot.id,
            data: docSnapshot.data()
            };

        } else {
            // Document does not exist
            console.error('Program document does not exist');
            return null;
        }

        } catch (error) {
        console.error('Error fetching program data:', error);
        throw error;
        }
    }

    // Currently uses a hard-coded user to get corresponding enrolled programs (needs auth to work for getting correct user)
    async function loadData() {
        try {
            const userData = await fetchUserData(userID);
            userActivePrograms = userData.data;

            const userPrograms = userData.data;
            numOfPrograms = 0;

            for (const program of userPrograms) {
                numOfPrograms += 1;
                const programInfo = await fetchProgramData(program);
                enrolledProgramInfos.push(programInfo);
            }

            dataLoaded = true;
            return userData;

        } catch (error) {
        console.error('Error loading user data:', error);
        }
    }

    // Calculates how many programs are remaining based on the user's tier
    function remainingPrograms(userType, numOfPrograms) {

        switch(userType) {

            case 'Customer':
                if(1 - numOfPrograms < 0) { return `Exceeded Limit (${1 - numOfPrograms})` }
                return `Remaining Programs: ${1 - numOfPrograms}`;

            case 'Coach':
                if(3 - numOfPrograms < 0) { return `Exceeded Limit (${3 - numOfPrograms})` }
                return `Remaining Programs: ${3 - numOfPrograms}`;

            case 'Trainer':
                return ""; // No message since unlimited programs

            default:
                return "User type not recognized!";
        }
    }


    // Removes the specified program from the user's active-programs
    async function removeProgram(programID) {

        const userRef = doc(db, 'users', userID);

        try {
            await updateDoc(userRef, {
                active_programs: arrayRemove(programID)
            });
            numOfPrograms -= 1;

            // Update the local state to reflect the removal
            enrolledProgramInfos = enrolledProgramInfos.filter(program => program.id !== programID);
            userActivePrograms = userActivePrograms.filter(id => id !== programID);

        } catch (error) {
            console.error("Error removing program: ", error);
        }
    }

    async function enrollInProgram(programID) {
        const userRef = doc(db, 'users', userID);

        try {
            await updateDoc(userRef, {
                active_programs: arrayUnion(programID)
            });

            numOfPrograms += 1;
            // Fetch the newly added program's details
            const newProgramInfo = await fetchProgramData(programID);
            if (newProgramInfo) {
                enrolledProgramInfos = [...enrolledProgramInfos, newProgramInfo];
                userActivePrograms = [...userActivePrograms, programID];
            }

        } catch (error) {
            console.error("Error enrolling in program: ", error);
        }
    }

    // Loads the weekly schedule page and sends the corresponding programID
    function goToWeeklySchedule(programID) {
        push(`/weekly-schedule/${programID}`);
    }


    // Makes sure all data is loaded along with the svelte component
    onMount(() => {
        loadData();
    });

    // Computed property to determine if the button should be disabled for creating programs
    $: disabled = (userType === 'Customer' && numOfPrograms >= 1) ||
                    (userType === 'Coach' && numOfPrograms >= 3) ||
                    (userType === 'Trainer' && false); // Assuming trainers have no limit

    // Computed property to determine if the button should be disabled for seeing more programs
    $: disabledDiscovery = (userType === 'Customer') ||
                (userType === 'Coach'); // Assuming trainers have access

</script>


<style>

    .user-programs-body {
        background-color: #eaeaec;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .create-program-container {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 50%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    }



    h3.section-title {
        color: var(--blue-75);
        font-weight: bold;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.17em;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px; 
    }

    .blue-schedule-button {
        background-color: var(--blue-75);
        color: white;        
        width: auto; 
        height: 50px;
        padding: 0 20px;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif; 
        text-transform: uppercase; 
        border-width: 0px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .blue-schedule-button:hover {
        background-color: var(--blue-50);
    }
    
    .see-schedule-button {
        background-color: white;
        color: var(--blue-75) !important;      
        width: auto; 
        height: 50px;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif; 
        text-transform: uppercase; 
        border-width: 0px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    }

    .see-schedule-button:hover {
        background-color: #eaeaec !important;
    }

    /* CSS for the Enrolled Program section */
    /* ------------------------------------ */
    .enrolled-program-container {
        background-color: white;
        width: 50%;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 50px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }   

    .enrolled-card {
        display: flex;
        background-color: var(--blue-75);
        box-shadow: #222 1px 0 10px;
        height: 75px;
        width: 100%;
        margin-top: 10px;
        margin-bottom: 10px;
        overflow: hidden;
    }

    .enrolled-section {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .enrolled-icon {
        flex: 1;
        display: flex;
        align-items: center;
    }

    .enrolled-text {
        flex: 4;
        display: flex;
        flex-direction: column;
    }

    .enrolled-text h5, .enrolled-text p {
        margin-top: 0;
        margin-bottom: 0px; /* Adjust this value as needed */
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .enrolled-buttons {
        flex: 2;
    }    
    
    p.program-duration {
        color: var(--silver-50); 
        font-family: 'Montserrat', sans-serif;
        font-size: 1.0em; 
        margin-bottom: 0px; 
    }

    h5.program-name {
        color: white;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.15em;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
    }

    /* CSS for the Discover Programs section */
    /* ------------------------------------ */    
    
    .program-card-container {
        background-color: white;
        width: 50%;
        margin: 50px;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        margin-bottom: 50px;
        justify-content: space-between;        
    }

    .program-card-group {
        display: flex;
        flex-direction: row;
    }

    .program-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: white;
        box-shadow: 4px 4px 4px 5px rgba(0, 0, 0, 0.1); 
        border-radius: 10px;
        margin: 1%;
        border: solid gray;
        border-width: 2px;
        justify-content: space-between;
        
    }

    .program-card img {
        width: 100%;
        border: solid silver;
        border-width: 1px;
        border-radius: 10px 10px 0px 0px;
    }

    .program-card-body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        
    }

    .program-card-body h5 {
        color: black;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.15em;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0px;
        padding: 10px;
        background-color: rgba(250, 213, 178, 0.904);
        border: solid silver;
        border-width: 1px;
    }

    .program-card-body h6 {
        color: black;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.10em;
        letter-spacing: 1px;       
        margin: 0px;
        padding: 10px;
        background-color: rgba(255, 233, 212, 0.904);
        border: solid silver;
        border-width: 1px;
    }

    .program-card-body p {
        color: black;
        font-family: 'Montserrat', sans-serif;
        font-size: 1.0em;
        margin: 10px;
        text-align: justify;
    }

    .program-card-buttons {
        display: flex;
        justify-content: space-around;
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
        margin: 0px;
        background-color: rgba(255, 233, 212, 0.904);
        border: solid silver;
        border-width: 1px;
        border: solid silver;
        border-width: 1px;
        border-radius: 0px 0px 10px 10px;
    }

    .program-card-buttons button {
        background-color: var(--blue-75);
        color: white !important;      
        width: auto; 
        height: 50px;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        font-family: 'Montserrat', sans-serif; 
        text-transform: uppercase; 
        border-width: 0px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        margin: 1px;
        padding-left: 20px;
        padding-right: 20px;
    }

    .program-card-buttons button:hover {
        background-color: var(--blue-50) !important;
        color: white !important;      
    }

    .spinner-border {
        margin: 50px;
    }

</style>


<div class="user-programs-body"> 

    <!-- Creates enrolledcards if all the program data has been loaded-->
    {#if dataLoaded}

    <div class="enrolled-program-container">
    
        <h3 class="section-title">Continue Program</h3>
        <p>Here we list the workout programs you are currently enrolled in.</p>

        <!-- If the user has more than 0 programs they are enrolled in -->
        {#if enrolledProgramInfos.length > 0}
            
            <!-- Get data from all programs enrolled in by the user-->
            {#each enrolledProgramInfos as programInfo}

                <div class="enrolled-card">
                    <div class="enrolled-section enrolled-icon">
                        <img src="https://cdn-icons-png.flaticon.com/512/249/249236.png" alt="..." style="height: 90%;">
                    </div>
                    <div class="enrolled-section enrolled-text">
                        <h5 class="program-name">{programInfo.data.name}</h5>
                        <p class="program-duration"><b>Duration: </b>{programInfo.data.duration} Weeks</p>
                    </div>
                    <div class="enrolled-section enrolled-buttons">
                        <button type="button" class="see-schedule-button" on:click={() => goToWeeklySchedule(programInfo.id)}>See Schedule</button>
                        <button type="button" class="see-schedule-button" style="padding: 5px; margin: 5px;" on:click="{() => removeProgram(programInfo.id)}">Remove</button>
                    </div>
                </div>

            {/each}

        {:else}
            <b>You are currently not enrolled in any workout programs.</b>
            <p>You can create your own program by using our Workout Builder <b>OR</b> by enrolling in a pre-made program below!</p>
        {/if}

        {#if userType != "Trainer"}
            <div style="display: flex; flex-direction: row; gap: 10px; align-items: center; justify-content: right; margin-top: 10px;">
                <h4 style="margin: 0px;"> {remainingPrograms(userType, numOfPrograms)} </h4>
                <i class="fas fa-info-circle" style="cursor: help;" title="Upgrade your tier to enroll on more workout programs!"></i>
            </div>
        {/if}

    </div>

    {:else}
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    {/if}
  
    <!-- Container for the create program option-->
    <div class="create-program-container">
        <div class="text-content">
            <h3 class="section-title">Create New Workout Program</h3>
            <p>Get started on building a custom fitness plan tailored to your goals.</p>
        </div>
        <a href="/workout-builder" use:link>
            <button type="submit" class="blue-schedule-button" style="background-color: {disabled ? 'gray' : 'var(--blue-75)'};" disabled={disabled}>Create Program</button>
        </a>
    </div>



    <div class="program-card-container">

        <div class="text-content">
            <h3 class="section-title">Discover Workout Programs</h3>
            <p>Find available user-created programs.</p>
        </div>
        <!-- Render ProgramCard component for each featured program -->
        <!-- Currently stores 4 hard-coded program information. Need to decide which 4 programs will be featured here -->
        <!-- Program information is stored in cards -->

        <div class="program-card-group">

            <div class="program-card">
                <img src="\images\equipment1.png" alt="...">
                <div class="program-card-body">
                    <h5>Full-Body Fitness</h5>
                    <h6>Duration: 3 Weeks</h6>
                    <p>This comprehensive 3-week program is designed for those looking to enhance their fitness across all levels. "Full Body Fitness Program" combines strength training, cardio, and flexibility workouts with a focus on improving overall body strength, cardiovascular health, and mobility.</p>
                </div>
                <small>
                    <div class="program-card-buttons">
                        <!--<button type="button" class="see-schedule-button" on:click={toggleModal('doMLScaMCLy3QPtq7NKP')}>See Details</button>-->

                        {#if userActivePrograms.includes('doMLScaMCLy3QPtq7NKP')}
                            <button type="button" class="see-schedule-button" style="background-color: gray !important;" disabled>Enrolled</button>
                        {:else}    
                            <button type="button" class="see-schedule-button" style="background-color: {disabled ? 'gray' : 'var(--blue-75)'};" disabled={disabled} on:click="{() => enrollInProgram('doMLScaMCLy3QPtq7NKP')}">Quick Enroll</button>
                        {/if}
                        
                    </div>
                </small>  
            </div>

            <div class="program-card">
                <img src="\images\equipment2.png" alt="...">
                <div class="program-card-body">
                    <h5>Core Strength</h5>
                    <h6>Duration: 2 Weeks</h6>
                    <p>Target your midsection with the "Core Strength Training" 2-week program. This specialized regimen focuses on building core strength and toning abdominal muscles through a series of dynamic planks, crunches, and pilates exercises. Ideal for those who want to develop a stronger, more sculpted core.</p>
                </div>
                <small>
                    <div class="program-card-buttons">
                        <!--<button type="button" class="see-schedule-button" on:click={toggleModal('4yTKlzMC0sYw6pjcFjw5')}>See Details</button>-->

                        {#if userActivePrograms.includes('4yTKlzMC0sYw6pjcFjw5')}
                            <button type="button" class="see-schedule-button" style="background-color: gray !important;" disabled>Enrolled</button>
                        {:else}    
                            <button type="button" class="see-schedule-button" style="background-color: {disabled ? 'gray' : 'var(--blue-75)'};" disabled={disabled} on:click="{() => enrollInProgram('4yTKlzMC0sYw6pjcFjw5')}">Quick Enroll</button>
                        {/if}
                        
                    </div>
                </small>  
            </div>

            <div class="program-card">
                <img src="\images\equipment3.png" alt="...">
                <div class="program-card-body">
                    <h5>Basic Running</h5>
                    <h6>Duration: 2 Weeks</h6>
                    <p>Elevate your endurance with "Basic Running Training," a 2-week program tailored for runners looking to increase their distance, speed, and running efficiency. This program blends interval training, long slow runs, and strength workouts specifically designed to boost stamina and reduce injury risk.</p>
                </div>
                <small>
                    <div class="program-card-buttons">
                        <!--<button type="button" class="see-schedule-button" on:click={toggleModal('GNtQ9uJidk9T8Ay6MsuT')}>See Details</button>-->

                        {#if userActivePrograms.includes('GNtQ9uJidk9T8Ay6MsuT')}
                            <button type="button" class="see-schedule-button" style="background-color: gray !important;" disabled>Enrolled</button>
                        {:else}    
                            <button type="button" class="see-schedule-button" style="background-color: {disabled ? 'gray' : 'var(--blue-75)'};" disabled={disabled} on:click="{() => enrollInProgram('GNtQ9uJidk9T8Ay6MsuT')}">Quick Enroll</button>
                        {/if}
                        
                    </div>
                </small>  
            </div>
        </div>

        <a href="/discover" use:link>
            <button type="submit" class="blue-schedule-button" style="background-color: {disabledDiscovery ? 'gray' : 'var(--blue-75)'};" disabled={disabledDiscovery}>See More Programs</button>
        </a>

    </div>
    <DetailModal {showModalDetails} close={toggleModal} programID={selectedProgram}/>
</div>
