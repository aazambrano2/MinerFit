<script>
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import db from '../Firebase';
import { onMount, onDestroy } from 'svelte';
import ManagerSidebar from "./ManagerSidebar.svelte";

let exerciseName = "";
let category = "";
let description = "";
let image = "";
let exerciseData = []

const exerciseCol = collection(db, "excercises");

const exerciseSnapshot = onSnapshot(exerciseCol, (querySnapshot) => {
        exerciseData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    });

onDestroy(() => {
    exerciseSnapshot();
});

  // Deletes a exercise given an exercise ID
  async function deleteExcercise(id){
 
    const exerciseRef = doc(exerciseCol, id)

    deleteDoc(exerciseRef)
    .then(()=>{
        console.log("Document Deleted")
    }) .catch((e)=>{
        console.log(e)
    })
  }

onMount(() => {
    const addExerciseForm = document.querySelector("#addExercise");

    addExerciseForm.addEventListener("submit", handleSubmit);

    return () => {
    addExerciseForm.removeEventListener("submit", handleSubmit);
    };
});

const handleSubmit = (event) => {
    event.preventDefault();

    const tempExercise = {
    name: exerciseName,
    category: category,
    description: description,
    image: image
    };

    addDoc(exerciseCol, tempExercise)
    .then((doc) => {
        alert("Exercise Added!")
        console.log(doc);
        document.getElementById("addExercise").reset()
    })
    .catch((e) => {
        console.log(e);
    });
};
</script>


<style>
    img {
    width: 70px; 
    height: 70px; 
}
textarea {
      padding: 10px 5px;
      border-radius: 5px;
      border: 1px solid var(--blue-25);
      width: 300px;
      color: var(--blue-50);
      font-weight: bold;
      transition: .1s ease-in-out;
      margin:15px auto;
  }
  textarea {
    width: 400px;
    height: 30px;
  }
</style>
<ManagerSidebar>
    <br><br><br>
    <h1>Add Exercise</h1>
    <form id="addExercise">
        <label for="exerciseName">Exercise Name</label>
        <br>
        <textarea bind:value={exerciseName} type="text" id="exerciseName" name="Exercise Name" required></textarea>
        <br>
        <label for="category">Category</label>
        <br>
        <textarea bind:value={category} type="text" id="category" name="category" required></textarea>
        <br>
        <label for="description">Description</label>
        <br>
        <textarea bind:value={description} type="text" id="description" name="description" required></textarea>
        <br>
        <label for="image">Image Associated</label>
        <br>
        <textarea bind:value={image} type="text" id="image" name="image" required></textarea>
        <br>
        <input type="submit" value="Submit">
    <br><br><br>
    </form>

    <table>
        <thead>
            <tr>
                <th>Manage</th>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Image</th>
            </tr>
        </thead>
        <tbody>
        {#each exerciseData as excerciseInfo }

            <tr>
                <td>
                    <button id= "#DeleteExercise" type="submit" on:click={deleteExcercise(excerciseInfo.id)}>
                        Delete Exercise
                    </button>
                </td>
                <td>{excerciseInfo.id}</td>
                <td>{excerciseInfo.name}</td>
                <td>{excerciseInfo.category}</td>
                <td>{excerciseInfo.description}</td>
                <td>
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img src="{excerciseInfo.image}" alt="Image">
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</ManagerSidebar>