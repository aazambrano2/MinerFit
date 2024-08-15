<script>
    import { get } from 'svelte/store';
    import {userStore} from '../user-auth/user-store.js'
    import {link, push} from 'svelte-spa-router';
    import { onMount } from 'svelte';
    import db from '../Firebase';
    import {collection, addDoc, doc, getDoc, query, where, getDocs, onSnapshot, updateDoc, limit} from 'firebase/firestore';
    import {totalReps, totalSets, totalWeight, max3Lifts, getSetsRepsWeight} from './tracking.js'

    //get params from url
    export let params = {}
    //ref to workouts collection
    const workoutsRef = collection(db, 'user_workouts')

    //for reactively building ui
    let exercisesDB = []
    let schedule = []
    let workouts = []
    let completed_workout
    let completed = false
    let name = ""
    let daysPerWeek = -1 
    let total_reps = 0
    let total_sets = 0
    let total_weight = 0

    //read params
    const  programid = params['id']
    const day = params['day']
    const week = params['week']

    //create a query for if a workout exist already
    const q = query(workoutsRef, 
    where("program" ,"==" , programid), 
    where("day","==",day),
    where("week","==",week),
    where("user", "==", get(userStore).uid),
    limit(1))

    //use onSnapshot to deal with async functions not working
    const unsub = onSnapshot(q, (querySnapshot) =>{
        querySnapshot.forEach((doc) =>{
            //if we have a doc set completed = true
            // and get the data
            completed_workout = doc.data()
            completed = true
        })
    })

    onMount(async () => {
        const querySnapshot = await getDocs(collection(db, 'excercises'))
        exercisesDB = querySnapshot.docs.map(doc => doc.data())
    });

    async function fetchWeightStats(){
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    //adding in users stats
    if (userData && userData.total_reps){
      total_reps = userData.total_reps
      total_sets = userData.total_sets
      total_weight = userData.total_weight
    }
  }

  fetchWeightStats()

  async function updateWeightStats(total_sets, total_reps, total_weight){
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {total_sets: total_sets, total_reps: total_reps, total_weight:total_weight});
  }

    //function for getting doc from firestore
    async function getProgram(docid){
        const snap = await getDoc(doc(db, 'programs', docid))
        if(snap.exists()){
            const program = snap.data()
            schedule = program['schedule']
            daysPerWeek = program['days_per_week']
            name = program['name']
        }
    }
    //once promise resolves
    getProgram(programid).then(() =>{
        // index = (week-1) * daysPerWeek + (day-1)
        const scheduleIndex = (week-1)*daysPerWeek + (day-1)
        const daily_schedule = schedule[scheduleIndex]
        workouts = daily_schedule['workouts']
    })

    //function for handling form
    function onSubmit(e) {
		// get the form fields data 
		const formData = new FormData(e.target)

        //assign data based on params
        const data = {};
        //from userstore
        data['user'] = get(userStore).uid
        data['program'] = programid
        data['week'] = week
        data['day'] = day
        data['date'] = new Date().toString();

        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }
        fetchWeightStats()

        const todays_reps = totalReps(data)
        const todays_sets = totalSets(data)
        const todays_weight = totalWeight(data)
        //getting excercise data
        console.log('getting excercise data')
        total_reps = total_reps +  todays_reps
        total_sets = total_sets + todays_sets
        total_weight = total_weight + todays_weight
        //update user stats
        updateWeightStats(total_sets, total_reps, total_weight)
        //get data for the day
        const maxes = max3Lifts(data)
        const bench_stats = getSetsRepsWeight(data, 'Bench')
        const squat_stats = getSetsRepsWeight(data, 'Squat')
        const dl_stats = getSetsRepsWeight(data, 'Deadlift')
        //build out userdata
        let user_data = {total_reps: todays_reps, 
            total_sets: todays_sets, 
            lifted_pounds:todays_weight, 
            bench_stats: bench_stats, 
            squat_stats:squat_stats, 
            dl_stats:dl_stats,
            squat_max: maxes['squat'],
            deadlift_max: maxes['deadlift'],
            bench_max:maxes['bench'],
        }

        //normalize todays date
        let date = new Date()
        date.setHours(0, 0, 0, 0);

        //find current day document
        const dayRef = collection(db, "day")
        const day_query = query(dayRef,
        where("date","==", date),
        where("userID", "==", get(userStore).uid,
        limit(1))
        )

        //async funtion for doing the query
        async function doQuery(q){
            //doing query
            const qsnap = await getDocs(q)
            //update day
            qsnap.forEach((d) => {
                updateDoc(doc(db, 'day' , d.id), user_data)
                .then(() =>{
                    console.log('day sucesfully updated')
                })
                .catch(e =>{
                    console.log(e)
                })
            })
        }
        //do the query
        doQuery(day_query)
        
        //Adds a completed workout to the user_workouts collection
        addDoc(workoutsRef, data)
        .then(() => {
            console.log("Added new workout to firebase");
        })
        .catch((e) => {
            console.log(e);
        })
        //goes back to weekly schedule
        push('/weekly-schedule'.concat('/', programid))
    }
</script>
<div class="main-section">
    <div class="table-wrapper">
        {#if completed != true}
            <h1>{name}</h1>
            <h1>Week {week}: Day {day}</h1>
            <form on:submit|preventDefault={onSubmit}>
                <table>
                    {#each workouts as workout}
                        <!-- show description to exercises saved in database -->
                        {#if exercisesDB.find(exercise => exercise.name === workout['exercise'])}
                            {#each exercisesDB.filter(exercise => exercise.name === workout['exercise']) as exercise}
                                <tr class="workout-row">
                                    <td class="exercise-column">
                                        <h2>{workout['exercise']}</h2>
                                        <h5 class="tooltip">
                                            
                                            <h2><span class="tooltiptext">
                                                <strong>Category:</strong> {exercise.category}<br><br>
                                                <strong>Description:</strong> {exercise.description}<br><br>
                                                <img src="{exercise.image}" alt="" style="max-width:100%; height:auto;" /><br>
                                            </span></h2>
                                            <h3><span role="img" aria-label="question">need help❓</span></h3>
                                        </h5>
                                    </td>
                                    <td>
                                        <table>
                                            <tr>
                                                <th>Set</th>
                                                <th>Reps</th>
                                                <th>Weight</th>
                                                <th>Lifted Weight</th>
                                                <th>Lifted Reps</th>
                                            </tr>
                                            {#each Array(workout['sets']) as _, ind}
                                            <tr style="border-bottom:1px solid black">
                                                <td>{ind+1 }</td>
                                                <td>{workout['reps']}</td>
                                                <td>{workout['weight']}</td>
                                                <td><input type="number" name="{workout['exercise']}:Set {ind+ 1} weight" placeholder="{workout['weight']}"></td>
                                                <td><input type="number" name="{workout['exercise']}:Set {ind+ 1} reps" placeholder="{workout['reps']}"></td>
                                            </tr>
                                            {/each}
                                            <tr>
                                                <td>Notes<input type="text" name="{workout['exercise']} notes" id=""></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            {/each}
                        <!-- exercise does not have a category nor a description. exercise has a unique, user-made name -->
                        {:else}
                            <tr class="workout-row">
                                <td class="exercise-column">
                                    <h2>{workout['exercise']} </h2>
                                    <h5 class="tooltip">
                                        <span class="tooltiptext">
                                            <strong>Category:</strong> UNDEFINED<br><br>
                                            <strong>Description:</strong> UNDEFINED<br><br>
                                            <strong>Encouragement:</strong> GOOD LUCK !
                                        </span>
                                        <h3><span role="img" aria-label="question">need help❓</span></h3>
                                    </h5>
                                </td>
                                <td>
                                    <table>
                                        <tr>
                                            <th>Set</th>
                                            <th>Reps</th>
                                            <th>Weight</th>
                                            <th>Lifted Weight</th>
                                            <th>Lifted Reps</th>
                                        </tr>
                                        {#each Array(workout['sets']) as _, ind}
                                        <tr style="border-bottom:1px solid black">
                                            <td>{ind+1 }</td>
                                            <td>{workout['reps']} </td>
                                            <td>{workout['weight']}</td>
                                            <td><input type="number" name = "{workout['exercise']}:Set {ind+ 1} weight" placeholder = "{workout['weight']}"></td>
                                            <td><input type="number" name = "{workout['exercise']}:Set {ind+ 1} reps" placeholder="{workout['reps']}"></td>
                                        </tr>
                                        {/each}
                                        <tr>
                                            <td>Notes<input type="text" name="{workout['exercise']} notes" id=""></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        {/if}

                    {/each} 
                </table>
                <button type="submit" class = 'btn-main'> submit workout</button>
                <button type= "button" on:click={()=> push('/weekly-schedule/'.concat(programid))} class = 'btn-main'> Go Back</button>
            </form>
        {:else}
            <h1>{name}</h1>
            <h1>Week {week}: Day {day}</h1>
            <table>
                {#each workouts as workout}
                    <h2>{workout['exercise']}</h2>
                    <tr>
                        <th>Set</th>
                        <th>Reps</th>
                        <th>Weight</th>
                        <th>Lifted Weight</th>
                        <th>Lifted Reps</th>
                    </tr>
                    {#each Array(workout['sets']) as _, ind}
                        <tr style="border-bottom:1px solid black">
                            <td>{ind+1 }</td>
                            <td>{workout['reps']} </td>
                            <td>{workout['weight']}</td>
                            <td>{completed_workout[workout['exercise'].concat(':Set ', ind+1 , ' weight')]}</td>
                            <td>{completed_workout[workout['exercise'].concat(':Set ', ind+1 , ' reps')]}</td>
                        </tr>
                    {/each}
                    <tr>
                        <td>Notes: {completed_workout[workout['exercise'].concat(' notes')]}</td>
                    </tr>
                {/each} 
            </table>
            <button on:click={()=> push('/weekly-schedule/'.concat(programid))} class = 'btn-main'> Go Back</button>
        {/if}
    </div>
</div>
<style>
.main-section {
    width: 100%;
    height: auto;
    max-width: 2000px;
    margin: 0 auto;
}
h1 {
    text-align: center;
}
.table-wrapper {
    width: 85%;
    margin: 0 auto;
}
table {
  width: 100%;
  padding: 20px;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  background-color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  max-width: 1000px;
  margin: 0 auto;
}
table h2 {
    margin-left: 20px;
}
th, td {
  padding: 10px 20px;
  text-align: left;
}

th {
  background-color: var(--blue-75);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
}
tr {
    transition: .1s ease-in-out;
    border-bottom: 1px solid black;
}
tr:last-of-type {
    border-bottom: none;
    margin-bottom: 15px;
}
tr:hover {
  background-color: var(--silver-25);
}
.btn-main {
    display: block;
    margin: 40px auto 0 auto;
}
input {
    margin-left: 10px;
}
/* Tooltip container */
.tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black; /* dots under the hoverable text */
}
/* Tooltip text */
.tooltip .tooltiptext {
    visibility: hidden;
    width: 80%;
    max-width: 400px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 10px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s;
}
/* Tooltip arrow */
.tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}
/* Show the tooltip text when hovering */
.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}
</style>