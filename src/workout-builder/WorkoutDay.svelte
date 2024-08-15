<script>
  import Exercise from "./Exercise.svelte";
  
  export let dayData = { workouts: [] };
  export let renderSchedulePage;

  function reloadWorkoutComponent(page) {
    // render parent component through store
    renderSchedulePage.set(!page);
  }

  function addExercise() {
    // Add an exercise to the day
    let newExercise = {
      exercise: "New exercise",
      reps: 0,
      sets: 0,
      weight: "--% 1RM"
    };
    dayData.workouts.push(newExercise); 
    reloadWorkoutComponent($renderSchedulePage)
  }

  function removeExercise(index) {
    // remove the exercise at the specified index from dayData
    dayData.workouts.splice(index, 1);
    reloadWorkoutComponent($renderSchedulePage)
  }
</script>

<div class="week-day-wrapper">
  <h2>Week {dayData.week}, Day {dayData.day}</h2>
  <div class="week-day-information">
  <!-- render page again if currentWorkoutComponent has an exercise added -->
  {#if ! $renderSchedulePage}
    {#if dayData.workouts.length > 0}
      {#each dayData.workouts as workout, index}
        <div class="exercise-box">
          <Exercise
            exerciseData={workout}
            on:updateExerciseName={(event) => { workout.exercise = event.detail; }}
            on:updateReps={(event) => { workout.reps = event.detail; }}
            on:updateSets={(event) => { workout.sets = event.detail; }}
            on:updateWeight={(event) => { workout.weight = event.detail; }}
            removeExercise={() => removeExercise(index)}
          />
        </div>
      {/each}
      {:else}
      <p>No exercises added yet.</p>
    {/if}
  {:else}
    <!-- render page with current exercises -->
    {#if dayData.workouts.length > 0}
      {#each dayData.workouts as workout, index}
        <div class="exercise-box">
          <Exercise
            exerciseData={workout}
            on:updateExerciseName={(event) => { workout.exercise = event.detail; }}
            on:updateReps={(event) => { workout.reps = event.detail; }}
            on:updateSets={(event) => { workout.sets = event.detail; }}
            on:updateWeight={(event) => { workout.weight = event.detail; }}
            removeExercise={() => removeExercise(index)}
          />
        </div>
      {/each}
    {:else}
      <p>No exercises added yet.</p>
    {/if}
  {/if}
  <button class="btn-main"on:click={addExercise}>Add Exercise</button>
</div>
</div>
<style>
  .week-day-wrapper {
    width: 100%;
  }
  .week-day-wrapper h2 {
    font-size: 1.1rem;
    line-height: 1.75rem;
    margin-top: 12px;
    margin-bottom: 2px;
  }
  .week-day-information {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .week-day-information p {
    color: #6b7280;
    margin: 0;
  }
  .exercise-box {
    border: 1px solid #e6e5e5; /* Set the border style for the input field */
    border-radius: 5px;
    padding: 15px;
    margin: 6px 0 8px;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    justify-items: center;
    width: 100%;
  }
  .btn-main {
    font-size: .895rem;
    margin: 0;
    margin-left: auto;
    border-radius: 6px;
    height: 35px;
    width: 120px;
  }
</style>