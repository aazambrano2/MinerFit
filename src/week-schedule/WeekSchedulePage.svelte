<script>
    import db from "../Firebase.js";
    import {getDoc, doc} from "../Firebase.js"
    import { onDestroy} from "svelte"
    import {currentWeek} from './week-store.js'
    import WeekBox from "./WeekBox.svelte";
    import { onMount } from "svelte";

    //gets program id
    export let params = {}
    const docid = params['id']
    //for reactivety
    let schedule = [] 
    let daysPerWeek = -1 
    let weekIndexes = []
    let slice = []
    onMount(() => {
        currentWeek.set(1)
    })

    //gets schedule and days per week
    async function getProgram(docid){
        const snap = await getDoc(doc(db, 'programs', docid))
        if (snap.exists()){
            const program = snap.data()
            const fetchedSchedule = program['schedule']
            const fetchedDaysPerWeek = program['days_per_week']
            if (Array.isArray(fetchedSchedule)) {
                schedule = fetchedSchedule
                daysPerWeek = fetchedDaysPerWeek
            } else {
                console.error('Schedule is not an array.')
            }
        }
    }

    //once promise resolves we set the slice and schedule
    getProgram(docid).then((doc) => {
        weekIndexes = getWeeksIndexInSchedule()
        slice = schedule.slice(0,daysPerWeek)
    })  
    .catch((e) => {
        console.log(e)
    });

    //used to change week using the change week button modifies current week-store
    function changeWeek(direction){
        currentWeek.update(week => {
            const newWeek = week + direction;
            if (newWeek >= 1 && newWeek <= Math.ceil(schedule.length / daysPerWeek)){
                return newWeek;
            } else {
                return week;
            }
        });
    }

    //used to calculate the indexes for each week given the amount of days per week and total length of schedule
    function getWeeksIndexInSchedule(){
        let weekIndexes = [];
        for (let i = 0; i < schedule.length; i++) {
            if (schedule[i].day === 1) {
                weekIndexes.push(i);
            }
        }
        return weekIndexes
    }

    //when the week changes we update the slice object
    currentWeek.subscribe( (val)=>{
        slice = schedule.slice(weekIndexes[val-1], weekIndexes[val])
    })

    onDestroy(()=>{
        // TODO: clean up subscription when component is unmounted
    })
</script>

<!-- 
  @component 
  The main page of the Week Scheudle that contains information of the user's workout exercises for each week
  and its associated workouts for each day of a week.
-->

<main>
    <div class="pair-container">
        <div>
                <button class="last-week-button" on:click={() => changeWeek(-1)}></button>
        </div>
        <div>
            <div class= "week-number-container">
                <h1>Week {$currentWeek}</h1>
            </div>
        </div>
        <div>
                <button class="next-week-button" on:click={() => changeWeek(1)}></button>
        </div>
    </div>
    <div>
        {#if Array.isArray(schedule) && schedule.length > 0}
            <WeekBox id = {docid} days = {daysPerWeek} week = {$currentWeek} slice = {slice}/>
        {:else}
            <p>No schedule available</p>
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: center; /* Center vertically */
        align-items: center; /* Center horizontally */
    }
    .pair-container{
        display: flex;
        flex-direction: row;
        align-items: center; /* Align items vertically */
        justify-content: space space-around;
        margin-bottom: 1px; /* Space between pairs */
        /* margin-top: 100px; */
    }
    .pair-container > * {
        margin: 0;
    }
    .week-number-container{
        padding: 10px;
    }
    .next-week-button {
        width: 100px;
        height: 50px;
        border-top: 25px solid transparent; /* top border */
        border-bottom: 25px solid transparent; /* bottom border */
        border-left: 50px solid; /* left border (colored) */
        border-right: 0 solid transparent; /* right border */
        outline: none;
        background: none;
        cursor: pointer;
        transition: box-shadow 0.3 ease;
    }
    .next-week-button:hover::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        border-top: 25px solid transparent;
        border-bottom: 25px solid transparent;
        border-left: 50px solid rgba(0,0,0,0.5); /* Shadow color */
        z-index: -1; /* Place the shadow behind the button */
        transform: translateX(-5px) translateY(5px); /* Adjust shadow position */
        transition: all 0.3s ease; /* Smooth transition for shadow */
    }
    .last-week-button {
        width: 100px;
        height: 50px;
        border-top: 25px solid transparent; /* top border */
        border-bottom: 25px solid transparent; /* bottom border */
        border-right: 50px solid; /* right border (colored) */
        border-left: 0 solid transparent; /* left border */
        outline: none;
        background: none;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
    }
    .last-week-button:hover::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        border-top: 25px solid transparent;
        border-bottom: 25px solid transparent;
        border-right: 50px solid rgba(0,0,0,0.5); /* Shadow color */
        z-index: -1; /* Place the shadow behind the button */
        transform: translateX(5px) translateY(5px); /* Adjust shadow position */
        transition: all 0.3s ease; /* Smooth transition for shadow */
    }
    .last-week-button {
        margin-right: 50px;
    }
    .next-week-button {
        margin-left: 50px;
    }
    .last-week-button, .next-week-button {
        color: var(--orange-50);
        transition: .1s ease-in-out;
    }
    .last-week-button:hover, .next-week-button:hover {
        color: var(--orange-100);
    }
</style>