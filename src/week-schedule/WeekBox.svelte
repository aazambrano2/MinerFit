<script>
  import {link, push} from 'svelte-spa-router';

  //used to create the week boxes
  export let id;
  export let week;
  export let days;
  export let slice;

  //navigates to the correct workout
  function onclick(id, week, day){
    let nav = '/workout/'
    nav = nav.concat(id,'/',week,'/',day)
    push(nav)
  }

</script>

<!---
  TODO: Update Documentation
  @component 
  A week box card that contains workout cards for a user's weekly workout routine.

  Events:
  - 'click' : Adds a Workout card with associated week day and date
-->

<div>
    <div>
      {#each Array(days) as _, index}
        <div class= "card-main">
          <h2>Week: {week}</h2>
          <h2>Day: {index+1}</h2>
          {#if Object.keys(slice).length > 0}
          <h2>workouts for this day:</h2>
          <ul>
            {#each slice[index]['workouts'] as workout}
            <li>{workout['exercise']}</li>
            {/each}
          </ul>
          {/if}
          <button on:click={()=> onclick(id, week, index+1)} class = 'btn-main'>Start Workout</button>

        </div>
      {/each}
    </div>
</div>


<style>
  .card-main {
        margin-bottom: 40px;
        height: auto;
    }
  ul {
    margin: 10px auto;
  }
  li {
    color: var(--paragraph-color);
  }
  li::marker {
    color: var(--orange-75);
  }
</style>