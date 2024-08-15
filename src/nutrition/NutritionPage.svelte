<!-- NutritionPage.svelte -->
<script>
  import db from "../Firebase";
  import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
  import { userStore } from "../user-auth/user-store";
  import { chart } from "svelte-apexcharts";
  import Modal from './Modal.svelte';
  import { getChosenStat } from '../getGraphData.js';

  let unsubscribeUserStore;
  let currentUser;
  let weightChartData;
  let user_weights;
  let goalWeight = 0;
  let newGoalWeight = goalWeight;
  let currentWeight = 0;
  let newCurrentWeight = 0;

  // Attempt to subscribe to current user
  unsubscribeUserStore = userStore.subscribe(user => {
      if (user) {
          currentUser = user.uid;
      } else {
          console.log("USER is not authenthicated!");
      }
  })

  let showModalCalorie = false; // Variable to show Calorie Goal update modal
  let showModalFood = false; // Variable to show Add Food modal
  let showModalWeight = false; //variable to control the display of the weight goal modal
  let showModalCurrentWeight = false;
  
  // Variables for food entry form
  let foodName = '';
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  
  // Variable for user goals and current weight
  let goalCalories = 2000;
  let newGoalCalories = goalCalories;
  
  // Declare variables to store food entries and nutrition totals
  let foodEntries = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  
  // Function to fetch the user's goal calories
  async function fetchGoalCalories() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
  
    if (userData && userData.calories) {
      goalCalories = userData.calories;
      newGoalCalories = userData.calories;
    } else {
      goalCalories = 2000;
      newGoalCalories = 2000;
      await updateDoc(userDocRef, { calories: 2000 });
    }
  }
  
  // Function to update the goal calories
  async function updateGoalCalories() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { calories: newGoalCalories });
    goalCalories = newGoalCalories;
    fetchFoodEntries();
  }
  
  // Function to add a new food entry
  async function addFoodEntry() {
    const foodEntry = {
        name: foodName,
        calories,
        protein,
        fat,
        carbs,
    };

    // Add the new food entry to the 'food_entries' collection
    const newFoodEntryRef = await addDoc(collection(db, 'food_entries'), foodEntry);

    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userData = (await getDoc(userDocRef)).data();
    const lastWeekRefId = userData.schedule[userData.schedule.length - 1];
    const lastWeekRef = doc(db, "week", lastWeekRefId);
    const lastWeek = await getDoc(lastWeekRef);
    const lastDayRefId = lastWeek.data().days[lastWeek.data().days.length - 1];
    const lastDayRef = doc(db, "day", lastDayRefId);

    // Update the 'food_entries' array in the last day's document with the new entry's ID
    await updateDoc(lastDayRef, {
        food_entries: arrayUnion(newFoodEntryRef.id),
    });

    fetchFoodEntries();
    resetFormFields();
}

  
  // Declare a reactive chartOptions variable
  $: chartOptions = {
    series: [0],
    colors: ['#f68c1e'],
    chart: {
      height: 285,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '55%',
        }
      },
    },
    labels: ['Total Cal'],
    title: {
      text: 'Calorie Overview',
      align: 'center'
    },
  };
  
  // Function to fetch the user's food entries
  async function fetchFoodEntries() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData.schedule || userData.schedule.length === 0) {
        console.error("No schedule found for the user.");
        return;
    }

    const lastWeekRefId = userData.schedule[userData.schedule.length - 1];
    const lastWeekRef = doc(db, "week", lastWeekRefId);
    const lastWeek = await getDoc(lastWeekRef);

    if (!lastWeek.exists() || !lastWeek.data().days || lastWeek.data().days.length === 0) {
        console.error("No days found in the last week.");
        return;
    }

    const lastDayRefId = lastWeek.data().days[lastWeek.data().days.length - 1];
    const lastDayRef = doc(db, "day", lastDayRefId);
    const lastDay = await getDoc(lastDayRef);

    if (lastDay.exists() && lastDay.data().food_entries) {
        const foodEntriesPromises = lastDay.data().food_entries.map(async (entryId) => {
            const entryDocRef = doc(db, 'food_entries', entryId);
            const entryDoc = await getDoc(entryDocRef);
            return entryDoc.data();
        });

        foodEntries = await Promise.all(foodEntriesPromises);
        totalCalories = foodEntries.reduce((acc, entry) => acc + entry.calories, 0);
        totalProtein = foodEntries.reduce((acc, entry) => acc + entry.protein, 0);
        totalFat = foodEntries.reduce((acc, entry) => acc + entry.fat, 0);
        totalCarbs = foodEntries.reduce((acc, entry) => acc + entry.carbs, 0);

        updateCalorieChart();
    } else {
        resetNutritionStats();
    }
}

  function resetNutritionStats() {
    foodEntries = [];
    totalCalories = 0;
    totalProtein = 0;
    totalFat = 0;
    totalCarbs = 0;
}

function resetFormFields() {
    foodName = '';
    calories = 0;
    protein = 0;
    fat = 0;
    carbs = 0;
}

function updateCalorieChart() {
    chartOptions = {
        series: [calculateCaloriePercentage()],
        colors: ['#f68c1e'],
        chart: {
            height: 285,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '55%',
                }
            },
        },
        labels: ['Total Cal'],
        title: {
      text: 'Calorie Overview',
      align: 'center'
    },
    };
}

  // Function to calculate the calorie percentage
  function calculateCaloriePercentage() {
    if (goalCalories === 0) {
      return 0; // Return 0 if goalCalories is 0
    }
  
    const percentage = Math.round((totalCalories / goalCalories) * 100);
    return percentage > 100 ? 100 : percentage; // Ensure the percentage doesn't exceed 100
  }
  async function setUpWeightChart(currentUser) {
    user_weights = await getChosenStat(currentUser, "user_weight", "max");

    weightChartData = {
      series: [	
      {
      name: "Weight (lbs)",
      data: user_weights.stats
      }
    ],
      chart: {
      height: 270,
      width: 390,
      type: 'line',
      dropShadow: {
      enabled: true,
      color: '#b6b9be',
      top: 10,
      left: 7,
      blur: 2,
      opacity: 0.3
      },
      toolbar: {
      show: false
      }
    },
    colors: ['#243b68'],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'smooth',
      width: 15
    },
    grid: {
      show: true,
      borderColor: '#e7e7e7',
      row: {
      colors: ['transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
      },
      xaxis: {
      lines: {
      show: true
      }
    }
    },
    title: {
      text: 'Weight Change',
      align: 'center'
    },
    markers: {
      size: 1
    },
    xaxis: {
      categories: user_weights.nums,
    },
    yaxis: {
      min: (Math.min(...user_weights.stats) - 10) ,
      max: (Math.max(...user_weights.stats) + 10)	
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
    };
  }
  // Function to fetch the user's goal weight
  async function fetchGoalWeight() {
    const userId = $userStore.uid;  // Ensure you're using the reactive user store correctly
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.goal_weight) {
      goalWeight = userData.goal_weight;
      newGoalWeight = userData.goal_weight;
    } else {
      // Initialize with default if not present
      goalWeight = 0;
      newGoalWeight = 0;
      await updateDoc(userDocRef, { goal_weight: 0 });
    }
  }

  // Function to update the user's goal weight
  async function updateGoalWeight() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { goal_weight: newGoalWeight });
    goalWeight = newGoalWeight;
  }
  async function fetchAndUpdateCurrentWeight() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData.schedule || userData.schedule.length === 0) {
      console.error("No schedule found for the user.");
      return;
    }

    const lastWeekRefId = userData.schedule[userData.schedule.length - 1];
    const lastWeekRef = doc(db, "week", lastWeekRefId);
    const lastWeek = await getDoc(lastWeekRef);

    if (!lastWeek.exists() || !lastWeek.data().days || lastWeek.data().days.length === 0) {
      console.error("No days found in the last week.");
      return;
    }

    const lastDayRefId = lastWeek.data().days[lastWeek.data().days.length - 1];
    const lastDayRef = doc(db, "day", lastDayRefId);
    const lastDay = await getDoc(lastDayRef);

    if (lastDay.exists()) {
      currentWeight = lastDay.data().user_weight || 0;
      newCurrentWeight = currentWeight;
    } else {
      console.error("The last day does not exist.");
      currentWeight = 0;
      newCurrentWeight = 0;
    }
  }

  async function updateCurrentWeight() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userData = (await getDoc(userDocRef)).data();
    const lastWeekRefId = userData.schedule[userData.schedule.length - 1];
    const lastWeekRef = doc(db, "week", lastWeekRefId);
    const lastWeek = await getDoc(lastWeekRef);
    const lastDayRefId = lastWeek.data().days[lastWeek.data().days.length - 1];
    const lastDayRef = doc(db, "day", lastDayRefId);

    await updateDoc(lastDayRef, { user_weight: newCurrentWeight });
    currentWeight = newCurrentWeight;

     // Re-fetch the chart data
     setUpWeightChart(userId);
  }
  // Fetch the user's food entries and goal calories whenever the userStore changes (e.g., user logs in)
  $: {
    fetchFoodEntries();
    fetchGoalCalories();
    unsubscribeUserStore();
    setUpWeightChart(currentUser);
    fetchGoalWeight();
    fetchAndUpdateCurrentWeight();
  }
  </script>
    <div class="page-body">
      <div class="content-wrapper">
        <div class="cards-wrapper">
          <div class="main-card" id="calorie-card">
            <div use:chart={chartOptions} />
            <div>
              <p>Calories Consumed</p>
              <h4>{totalCalories}</h4>
              <p>Calorie Goal</p>
              <h4>{goalCalories}</h4>
              <button class="btn-main" on:click={() => (showModalCalorie = true)}> Update Goal </button>
            </div>
          </div>
          <div class="main-card">
            {#if weightChartData}
              <div use:chart={weightChartData} />
            {:else}
              <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
            {/if}
            <div>
              <p>Weight Goal</p>
              <h4>{goalWeight} lbs</h4>
              <button class="btn-main" on:click={() => (showModalWeight = true)}> Update Goal </button>
              <p>Today's Weight</p>
  <h4>{currentWeight} lbs</h4>
  <button class="btn-main" on:click={() => (showModalCurrentWeight = true)}>Update Weight</button>
            </div>
          </div>
          <div class="macro-wrapper">
            <div class="macro-card" id="cal-goal">
              <div>
                <p>Remaining Cal</p>
                <h4>{goalCalories - totalCalories}</h4>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
              </svg>
            </div>
            <div class="macro-card">
              <div>
                <p>Total Protein</p>
                <h4>{totalProtein} g</h4>
              </div>
              <div class="macro-circle" style="background-color: #DD403A;">
                {totalProtein === 0 || totalCalories === 0 ? 0 : Math.round(totalProtein * 4 / totalCalories * 100)}%
              </div>
            </div>
            <div class="macro-card">
              <div>
                <p>Total Fat</p>
                <h4>{totalFat} g</h4>
              </div>
              <div class="macro-circle" style="background-color: #2892D7;">
                {totalFat === 0 || totalCalories === 0 ? 0 : Math.round(totalFat * 9 / totalCalories * 100)}%
              </div>
            </div>
            <div class="macro-card">
              <div>
                <p>Total Carbs</p>
                <h4>{totalCarbs} g</h4>
              </div>
              <div class="macro-circle" style="background-color: #E0BE36;">
                {totalCarbs === 0 || totalCalories === 0 ? 0 : Math.round(totalCarbs* 4 / totalCalories * 100)}%
              </div>
            </div>
          </div>
        </div>
        <div class="food-table-wrapper">
          <div class="table-header">
            <h3>Meal Tracker</h3>
            <button class="btn-main" on:click={() => (showModalFood  = true)}> Add Meal </button>
          </div>
          {#if foodEntries.length === 0}
            <p style="text-align:center;">Add a meal to start tracking your macros!</p>
          {:else}
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Fat</th>
                  <th>Carbs</th>
                </tr>
              </thead>
              <tbody>
                {#each foodEntries as entry}
                <tr>
                  <td id="name">{entry.name}</td>
                  <td>{entry.calories}</td>
                  <td><span id="protein">{entry.protein} g</span></td>
                  <td><span id="fat">{entry.fat} g</span></td>
                  <td><span id="carbs">{entry.carbs} g</span></td>
                </tr>
                {/each}
              </tbody>
            </table>
          {/if}
          <div class="table-footer"></div>
        </div>
      </div>
    </div>
    <Modal bind:showModal={showModalCalorie}>
      <div class="form-wrapper">
        <h1><span>Update</span> your goal.</h1> 
        <form on:submit|preventDefault={updateGoalCalories}>
          <div>
            <p>New Calorie Goal:</p>
            <input type="number" bind:value={newGoalCalories} />
          </div>
          <button class="btn-main" type="submit">Update</button>
        </form>
    </div>
    </Modal>
    <Modal bind:showModal={showModalFood}>
      <div class="form-wrapper">
        <h1 style="text-align:center;"><span>Add</span> your meal.</h1> 
        <form on:submit|preventDefault={addFoodEntry}>
          <div>
            <p>Name</p>
            <input type="text" bind:value={foodName} required />
          </div>
          <div>
            <p>Calories</p>
            <input type="number" bind:value={calories} required />
          </div>
          <div>
            <p>Protein</p>
            <input type="number" bind:value={protein} required />
          </div>
          <div>
            <p>Fat</p>
            <input type="number" bind:value={fat} required />
          </div>
          <div>
            <p>Carbs</p>
            <input type="number" bind:value={carbs} required />
          </div>
          <button class="btn-main"type="submit">Add</button>
            </form>  
      </div>
    </Modal>
    <!-- Weight Update Modal -->
  <Modal bind:showModal={showModalWeight}>
    <div class="form-wrapper">
      <h1><span>Update</span> your weight goal.</h1>
      <form on:submit|preventDefault={updateGoalWeight}>
        <div>
          <p>New Weight Goal:</p>
          <input type="number" bind:value={newGoalWeight} min=0/>
        </div>
        <button class="btn-main" type="submit">Update</button>
      </form>
    </div>
  </Modal>
  <Modal bind:showModal={showModalCurrentWeight}>
    <div class="form-wrapper">
      <h1><span>Update</span> your weight.</h1>
      <form on:submit|preventDefault={updateCurrentWeight}>
        <div>
          <p>Today's Weight:</p>
          <input type="number" bind:value={newCurrentWeight} min="0" />
        </div>
        <button class="btn-main" type="submit">Update</button>
      </form>
    </div>
  </Modal>
  <style>
  .page-body {
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    height: auto;
    min-height: 100vh;;
  }
  .content-wrapper {
    padding:20px;
  }
  .cards-wrapper {
    display: flex;
    height: auto;
    min-height: 350px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .main-card {
    height: auto;
    height: 350px;
    width: 49%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 35px 0 0;
  }
  #calorie-card {
    justify-content: space-around;
  }
  .main-card div {
    text-align: center;
  }
  .main-card, .macro-card, .food-table-wrapper {
    box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
  }
  #cal-goal {
    text-align: center;
  }
  #cal-goal h4 {
    margin: 5px 0;
  }
  .btn-main {
    height: 30px;
    width:150px;
    padding:0px;
    font-size: .90rem;;
    margin: 10px auto 10px auto;
  }
  .cards-wrapper p {
    font-weight: 500;
    font-size: .70rem;
    line-height: 2.5;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--paragraph-color);
    margin-bottom: 0;
  }
  .cards-wrapper h4 {
    font-weight: 500;
    font-size: 1.7rem;
    line-height: 1.2;
    margin: 10px 0 15px;
    color: #212636;
  }
  .macro-wrapper {
    display:flex;
    flex-wrap: wrap;
    height:auto;
    width:100%;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
  }
  .macro-card {
    width: 24%;
    height: 160px;
    display: flex;
    padding:10px;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-around;
  }
  .macro-card p {
    margin-top: 0;
  }
  .macro-card h4 {
    margin-bottom: 0;
  }
  .macro-wrapper svg {
    height: 55px;
    width: 55px;
    color: var(--orange-75);
  }
  .macro-circle {
    width:60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }
  .food-table-wrapper {
  margin-top: 20px;
  width: 100%;
  border-radius: 20px;
  height: auto;
  max-height: 400px; 
  overflow-y: auto; 
  position: relative; 
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky; 
  top: 0; 
  background-color: white; 
  z-index: 1; 
  border-bottom: 1px solid #dcdfe4;
}
.table-header h3 {
  margin-left: 20px;
  font-weight: 500;
  font-size: 1.2rem;
  line-height: 1.2;
  color: #212636;
}
.table-header .btn-main {
  margin: 0;
  margin-right: 40px;
}
.table-footer {
  height: 35px;
  position: sticky; 
  bottom: 0; 
  background-color: white; 
  z-index: 1;
  border-top: 1px solid #dcdfe4;
}
table {
  border-collapse: collapse;
  width: 100%;
}
thead {
  background-color: #f4f3f3;
}
th,
td {
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #dcdfe4;
  border-top: 1px solid #dcdfe4;
}
th {
  color: #667085;
  font-weight: 500;
  font-size: 0.975rem;
}
td {
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.57;
  color: #212636;
}
tr {
  transition: 0.2s ease-in-out;
}
tr:hover {
  background-color: #ececeb;
}
td span {
  color: #fff;
  padding: 5px 15px;
  border-radius: 10px;
}
#name {
  text-transform: capitalize;
}
#protein {
  background-color: #dd403a;
}
#fat {
  background-color: #2892d7;
}
#carbs {
  background-color: #e0be36;
}
  .form-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    margin: 0 auto;
  }
  .form-wrapper h1 {
      margin: 35px 0
  }
  .form-wrapper h1 span {
      color: var(--orange-75);
  }
  .form-wrapper p {
      color: var(--blue-50);
      margin-top:5px;
  }
  form {
      width: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
  }
  form div {
      margin: 5px 0;
      display: flex;
      flex-direction: column;
  }
  form div:last-child {
      justify-content: end;
  }
  form p {
      margin: 5px 0;
      font-weight: bold;
      color: var(--blue-75) !important;
  }
  form div span {
      margin-bottom: 10px;
  }
  input {
      padding: 10px 5px;
      border-radius: 5px;
      border: 1px solid var(--blue-25);
      width: 300px;
      color: var(--blue-50);
      font-weight: bold;
      transition: .1s ease-in-out;
  }
  input:focus {
      border: 1px solid var(--blue-100);
  }
  .form-wrapper button {
    margin: 15px auto;
  }
  :global(.apexcharts-yaxis) {
		display:none;
	}
  </style>