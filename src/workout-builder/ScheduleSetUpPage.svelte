<script>
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import WorkoutDay from './WorkoutDay.svelte';

  export let weekAmount = 0;
  export let daysPerWeekAmount = 0;

  let workoutSchedule = buildSchedule(weekAmount, daysPerWeekAmount);

  const dispatch = createEventDispatcher();
  // a writable store to control page rendering
  const renderSchedulePage = writable(false);
  
  // render component through store
  function reloadWorkoutComponent(page) {
    renderSchedulePage.set(!page);
  }
  
  // create a list of day structures that contain the day, week, and workouts in a day
  function buildSchedule(duration, daysPerWeek) {
    let schedule = [];
    let id = 0;

    for (let i = 1; i <= duration; i++) {
      for (let j = 1; j <= daysPerWeek; j++) {
        let daySchedule = {
          week: i,
          day: j,
          workouts: []
        };
        schedule.push(daySchedule);
        id += 1;
      }
    }
    return schedule;
  }

  // add a day to the program
  function addDay() {
    //TODO: check to not add more than 7 days per week
    let dayId = workoutSchedule.length+1;
    let week = Math.ceil(dayId / daysPerWeekAmount);
    let day = dayId % daysPerWeekAmount === 0 ? daysPerWeekAmount : dayId % daysPerWeekAmount;

    let daySchedule = {
      day: day,
      week: week,
      workouts: []
    };

    workoutSchedule.push(daySchedule);
    reloadWorkoutComponent($renderSchedulePage)
  }
  
  // auto fill program based on the first week
  function autoFillWeeks() {
    if (workoutSchedule.length < daysPerWeekAmount) {
      alert("Please complete the first week before autofilling.");
      return;
    }

    const firstWeek = workoutSchedule.slice(0, daysPerWeekAmount);
    for (let i = daysPerWeekAmount; i < workoutSchedule.length; i++) {
      let weekIndex = Math.floor(i / daysPerWeekAmount);
      workoutSchedule[i].workouts = JSON.parse(JSON.stringify(firstWeek[i % daysPerWeekAmount].workouts));
    }

    reloadWorkoutComponent($renderSchedulePage) // re-render the component to reflect updated workouts
  }
  
  // remove all the exercise a given day contains
  function removeExercisesInDay(index) {
    // can only clear the workouts for that day
    // needs further functionality to remove a (randomly chosen) day in the program
    workoutSchedule[index].workouts = []
  }

  // send parent component the completed program information
  function handleExerciseSubmit(event) {
    event.preventDefault()
    dispatch('submit', { workoutSchedule })
  }

</script>

<button class="btn-main" on:click={autoFillWeeks}>Autofill from Week 1</button>

<div class="workout-schedule">
  {#if ! $renderSchedulePage}
    <!-- render page when a day is added to program -->
    {#each workoutSchedule as daySchedule, index}
      <WorkoutDay 
        dayData={daySchedule} 
        renderSchedulePage={renderSchedulePage} />
      <!-- <button on:click={() => removeExercisesInDay(index)}>Remove Day's exercises</button> -->
    {/each}
  {:else}
    <!-- render page to show all days and exercises of program -->
    {#each workoutSchedule as daySchedule, index}
      <WorkoutDay 
        dayData={daySchedule} 
        renderSchedulePage={renderSchedulePage} />
      <!-- <button on:click={() => removeExercisesInDay(index)}>Remove Day's exercises</button> -->
    {/each}
  {/if}
</div>

<button class="btn-main" id="long-btn" on:click={addDay}>Add a day to your program</button>

<form on:submit={handleExerciseSubmit}>
  <input class="btn-main" id="submit" type="submit" value="Submit your new program">
</form>

<style>
  .workout-schedule {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 30%;
    overflow-y: scroll;
  }
  .btn-main {
    font-size: .895rem;
    margin: 0;
    margin-left: auto;
    border-radius: 6px;
    height: 35px;
    width: 250px;
    margin-top:8px;
  }
  #long-btn {
    display:block;
  }
  #submit {
    width: 100%;
    font-size: 0.925rem;
    line-height: 1.25rem;
    padding: 0.5rem 0.75rem;
    height: 50px;
    margin-top:8px;
  }
</style>