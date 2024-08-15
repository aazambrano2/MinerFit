<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import { collection, getDocs, doc } from 'firebase/firestore';
  import db from '../Firebase';

  export let exerciseData;
  export let removeExercise;

  let exerciseName = exerciseData.exercise;
  let reps = exerciseData.reps;
  let sets = exerciseData.sets;
  let weight = exerciseData.weight;
  let exercisesDB = []

  const dispatch = createEventDispatcher();

  onMount(async () => {
    const querySnapshot = await getDocs(collection(db, 'excercises'))
    exercisesDB = querySnapshot.docs.map(doc => doc.data())
  });

  function saveExercise(){
    // give info to the parent component
    const updatedExercise = {
      ...exerciseData,
      exercise: exerciseName,
      reps: reps,
      sets: sets,
      weight: weight
    };
    // emit an event with the updated exercise data
    dispatch('updateExercise', updatedExercise);
  }
  function updateExerciseName(event) {
    exerciseName = event.target.value;
  }

  function updateReps(event) {
    reps = event.target.value;
  }

  function updateSets(event) {
    sets = event.target.value;
  }

  function updateWeight(event) {
    weight = event.target.value;
  }

  function handleRemoveExercise() {
    if (window.confirm("Are you sure you want to remove this exercise?")) {
      removeExercise();
    }
  }
</script>
<div class="form-wrapper">
  <label>
    Exercise Name:
    <select bind:value={exerciseData.exercise} on:change={saveExercise}>
      {#each exercisesDB as exercise}
        <option value={exercise.name}>{exercise.name}</option>
      {/each}
    </select>
  </label>
  <label>
      Reps:
      <input type="number" bind:value={exerciseData.reps} on:blur={saveExercise} />
  </label>
  <label>
      Sets:
      <input type="number" bind:value={exerciseData.sets} on:blur={saveExercise} />
  </label>
  <label>
      Weight (lbs):
      <input type="text" bind:value={exerciseData.weight} on:blur={saveExercise} />
  </label>
  <button class="btn-main" on:click={handleRemoveExercise}><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
  </svg></button>
</div>  
<style>
  .form-wrapper {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  label {
    margin-right: 10px;
    display:flex;
    flex-direction: column;
    width: 17%;
  }
  label select,
  label input {
    margin-top:6px;
    border: 1px solid #e6e5e5;
    padding: 5px;
    color:#575555;
  }
  .btn-main {
    font-size: 1.125rem;
    margin: 0;
    margin-top: auto;
    border-radius: 6px;
    height: 40px;
    width: 40px;
    background-color: #ef4444;
    color: white;
  }
  .btn-main:hover {
    background-color: #c11d1df1 !important;
  }
  .btn-main svg {
    height: 20px;
  }
</style>