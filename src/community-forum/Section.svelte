<script>
  export let title;
  export let description;
  export let id;
  import {link, push} from 'svelte-spa-router';

</script>

<style>
hr {
    border: none; /* Removes default border */
    height: 2px; /* Set the height of the ruler */
    background-color:var(--silver-100) ; /* Color of the ruler */
    margin: 20px 0; /* Adjust margin as needed */
}

.card-main{
  margin: 4% auto;
  transition: .2s ease-in-out;
}
.card-main:hover{
  cursor: pointer;
  translate: 7px 7px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.4)
}
.card-main p{
  font-size: 23px;
  
}


/* :global(p){

} */

</style>


<div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class= "card-main" on:click={() => {push('/threads/'.concat(id))}}>
    <h1>{title}</h1>
     <hr>
    <p>{description}</p>
</div>
</div>
