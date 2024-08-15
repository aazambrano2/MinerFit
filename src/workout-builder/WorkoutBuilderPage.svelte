<script>
    import db from '../Firebase';
    import {doc, getDoc} from '../Firebase.js';
    import { collection, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
    import { push } from 'svelte-spa-router';
    import {userStore} from '../user-auth/user-store';
    import DurationSetUp from "./DurationSetUpPage.svelte";
    import ScheduleSetUp from "./ScheduleSetUpPage.svelte";

    let showScheduleSetUp = false;
    let isLoading = false;
    let weekAmount = 0;
    let daysPerWeekAmount = 0;
    let programName = "";
    let programDescription = "";
    let programSchedule = [];
    
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

    // render page to show program schedule and gather child components updated info
    function handleDurationSetUpSubmit(event) {
        event.preventDefault();
        const { detail } = event;
        showScheduleSetUp = true;
        programName = detail.programName;
        programDescription = detail.programDescription;
        weekAmount = detail.weekAmount;
        daysPerWeekAmount = detail.daysPerWeekAmount;
    }
    
    // upload exercise program to database
    async function handleExerciseSubmit(event) {
        event.preventDefault();
        const { detail } = event;
        programSchedule = detail.workoutSchedule;

        let programID;
        
        // upload exercise to database
        try {
            // show "loading" while upload completes
            isLoading = true;
            const docRef = await addDoc(collection(db, "programs"), {
                days_per_week: daysPerWeekAmount,
                description: programDescription,
                duration: weekAmount,
                name: programName,
                schedule: programSchedule
            })
            .then((programDoc) => {
                console.log("Program uploaded to database", programDoc)
                programID = programDoc.id
            })  
            .catch((e) => {
                console.log(e)
            });

            // Update user's programs to include the newly created program's document ID
            if (userID && programID) {
                const userRef = doc(db, 'users', userID);
                await updateDoc(userRef, {
                    active_programs: arrayUnion(programID)
                });
                console.log(`User enrolled in self-made program ${programID}`);
            }
            else { console.log(`Failed to enroll user in self-made program`); }
        } catch (error) {
            alert("Failed uploading new workout");
            console.log("Failed to upload new workout")
            console.error(error); 
            isLoading = false; 
        }finally {
            isLoading = false;
            // Redirect to workout plans
            push('/workout-plans');
        }
    }
</script>
{#if isLoading}
    <!-- Show loading indicator -->
    <div>Loading...</div> 
{:else}
    {#if !showScheduleSetUp}
        <!-- Gather name, description, weeks, and days per week from user -->
        <DurationSetUp on:submit={handleDurationSetUpSubmit} />
    {:else}
    <div class="main-section">
        <div class="content-wrapper">
            <h1><span>Your</span> Workout Program</h1>
            <p class="sub-paragraph">Review and customize your new workout program.</p>
            <h2>Program Details</h2>
            <div class="program-details-wrapper">
                <div>
                    <p>Description</p>
                    <p>{programDescription}</p>
                </div>
                <div>
                    <p>Duration</p>
                    <p>{weekAmount} weeks</p>
                </div>
                <div>
                    <p>Workour Days per Week</p>
                    <p>{daysPerWeekAmount} days</p>
                </div>
            </div>
            <h2>{programName}</h2>
            <ScheduleSetUp on:submit={handleExerciseSubmit} weekAmount={weekAmount} daysPerWeekAmount={daysPerWeekAmount} />
        </div>
    </div>
        <!-- <h3>
            {programName}
            <br>
            Description: {programDescription}
            <br>
            {weekAmount} weeks long
            <br>
            {daysPerWeekAmount} days per week
        </h3> -->
        <!-- Gather program schedule including workouts from user -->
    {/if}
{/if}
<style>
    .main-section {
        height: auto;
        min-height: calc(100vh - 75px);
        display: flex;
        align-items: center;
    }
    .content-wrapper {
        max-width:700px;
        width: 700px;
        margin: 0 auto;
        margin-bottom: 40px;
    }
    .content-wrapper h1 {
        font-size: 2.9rem;
        line-height: 1;
        margin-bottom: 0;
    }
    .content-wrapper h2 {
        font-size: 1.4rem;
        line-height: 1.75rem;
        margin-bottom: 0;
    }
    .sub-paragraph {
        color: #6b7280;
        font-weight: 100;
        font-size: 1.1rem;
        margin-bottom: 30px;
    }
    span {
        color: var(--orange-75);
    }
    .program-details-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .program-details-wrapper div {
        width: 47%;
    }
    .program-details-wrapper div p:first-of-type {
        color:#6b7280d4;
        margin-bottom: 6px;
    }
    .program-details-wrapper div p:not(:first-of-type) {
        margin-top: 6px;
        color: black;
    }
</style>