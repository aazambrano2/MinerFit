<script>
	import db from "./Firebase";
	import {link} from 'svelte-spa-router'
	import { chart } from "svelte-apexcharts";
	import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
  import { userStore, showModalAnnounce } from "./user-auth/user-store";
  import AnnounceModal from './AnnounceModal.svelte';
  import { getChosenStat } from './getGraphData.js';

  let unsubscribeUserStore;
  let currentUser;
  let currentProgramName = "";
  let lastWeekNumber = '1';

  // Attempt to subscribe to current user
  unsubscribeUserStore = userStore.subscribe(user => {
      if (user) {
          currentUser = user.uid;
      } else {
          console.log("USER is not authenthicated!");
      }
  })

  let bench_max, deadlift_max, squat_max;
  let user_weights;
  let strengthChartData, deadliftChartData, squatChartData;
  let weightChartData;
  let goalWeight = 0;

  // Function to calculate the calorie percentage
  function calculateCaloriePercentage() {
    if (goalCalories === 0) {
      return 0; // Return 0 if goalCalories is 0
    }
  
    const percentage = Math.round((totalCalories / goalCalories) * 100);
    return percentage > 100 ? 100 : percentage; // Ensure the percentage doesn't exceed 100
  }
  let currentWeight = 0;
  let goalCalories = 2000;
  let foodEntries = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  async function setUpCharts(currentUser) {
    bench_max = await getChosenStat(currentUser, "bench_max", "max");
    deadlift_max = await getChosenStat(currentUser, "deadlift_max", "max");
    squat_max = await getChosenStat(currentUser, "squat_max", "max");

    // Setting the min/max stats for bench presses
    let benchMinStat;
    let benchMaxStat;

    if (!bench_max || !bench_max.stats) {
      benchMinStat = 0;
      benchMaxStat = 100;

    } else {
      benchMinStat = Math.min(...bench_max.stats);
      benchMaxStat = Math.max(...bench_max.stats);
    }

    // Setting the min/max stats for deadlifts
    let deadMinStat;
    let deadMaxStat;

    if (!deadlift_max || !deadlift_max.stats) {
      deadMinStat = 0;
      deadMaxStat = 100;

    } else {
      deadMinStat = Math.min(...deadlift_max.stats);
      deadMaxStat = Math.max(...deadlift_max.stats);
    }

    // Setting the min/max stats for squats
    let squatMinStat;
    let squatMaxStat;

    if (!squat_max || !squat_max.stats) {
      squatMinStat = 0;
      squatMaxStat = 100;

    } else {
      squatMinStat = Math.min(...squat_max.stats);
      squatMaxStat = Math.max(...squat_max.stats);
    }
  
	  strengthChartData = {
          series: [	
          {
            name: "1 RPM (lbs)",
            data: bench_max.stats
          }
        ],
          chart: {
          height: 270,
		  width: 420,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#b6b9be',
            top: 7,
            left: 7,
            blur: 2,
            opacity: 0.3
          },
          toolbar: {
            show: false
          }
        },
        colors: ['#DD403A'],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth',
		  width: 15
        },
        title: {
          text: 'Bench Press (Est.) Max Lifted',
          align: 'center'
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
        markers: {
          size: 1
        },
        xaxis: {
          categories: bench_max.nums,
        },
        yaxis: {
          min: benchMinStat - 10,
          max: benchMaxStat + 10	
        },
        legend: {
          position: 'top',
          horizontalAlign: 'center',
          floating: true,
          offsetY: -25,
          offsetX: -5
        }
    };
    deadliftChartData = {
          series: [	
          {
            name: "1 RPM (lbs)",
            data: deadlift_max.stats
          }
        ],
          chart: {
          height: 270,
		  width: 420,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#b6b9be',
            top: 7,
            left: 7,
            blur: 2,
            opacity: 0.3
          },
          toolbar: {
            show: false
          }
        },
        colors: ['#2892D7'],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth',
		  width: 15
        },
        title: {
          text: 'Deadlift (Est.) Max Lifted',
          align: 'center'
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
        markers: {
          size: 1
        },
        xaxis: {
          categories: deadlift_max.nums,
        },
        yaxis: {
          min: (deadMinStat - 10),
          max: (deadMaxStat + 10)	
        },
        legend: {
          position: 'top',
          horizontalAlign: 'center',
          floating: true,
          offsetY: -25,
          offsetX: -5
        }
    };
    squatChartData = {
          series: [	
          {
            name: "1 RPM (lbs)",
            data: squat_max.stats
          }
        ],
          chart: {
          height: 270,
		  width: 420,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#b6b9be',
            top: 7,
            left: 7,
            blur: 2,
            opacity: 0.3
          },
          toolbar: {
            show: false
          }
        },
        colors: ['#E0BE36'],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth',
		  width: 15
        },
        title: {
          text: 'Squat (Est.) Max Lifted',
          align: 'center'
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
        markers: {
          size: 1
        },
        xaxis: {
          categories: squat_max.nums,
        },
        yaxis: {
          min: (squatMinStat - 10),
          max: (squatMaxStat + 10)	
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

  async function setUpWeightChart(currentUser) {
    user_weights = await getChosenStat(currentUser, "user_weight", "max");

      let minStat;
      let maxStat;
    if (!bench_max || !user_weights.stats) {
      minStat = 0;
      maxStat = 100;
    } else {
      minStat = Math.min(...user_weights.stats);
      maxStat = Math.max(...user_weights.stats);
    }

    weightChartData = {
      series: [	
      {
      name: "Weight (lbs)",
      data: user_weights.stats
      }
    ],
      chart: {
      height: 270,
      width: 420,
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
    title: {
      text: 'Weight Change',
      align: 'center'
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
    markers: {
      size: 1
    },
    xaxis: {
      categories: user_weights.nums,
    },
    yaxis: {
      min: minStat - 10,
      max: maxStat + 10	
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
  
  let total_reps = 0
  let total_sets = 0
  let total_weight = 0
  
  // Function to fetch the user's goal calories
  async function fetchGoalCalories() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.calories) {
      goalCalories = userData.calories;
    } else {
      goalCalories = 2000;
      await updateDoc(userDocRef, { calories: 2000 });
    }
  }

  async function fetchWeightStats() {
    const userId = $userStore.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    console.log(userData)
    //adding in users stats
    if (userData && userData.total_reps){
      total_reps = userData.total_reps
      total_sets = userData.total_sets
      total_weight = userData.total_weight
    }
  }
  fetchWeightStats()

  async function fetchGoalWeight() {
    const userId = $userStore.uid;  // Ensure you're using the reactive user store correctly
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.goal_weight) {
      goalWeight = userData.goal_weight;
    } else {
      // Initialize with default if not present
      goalWeight = 0;
      await updateDoc(userDocRef, { goal_weight: 0 });
    }
  }
  async function fetchCurrentWeight() {
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
    } else {
      console.error("The last day does not exist.");
      currentWeight = 0;
    }
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
async function fetchLatestProgramName() {
    const userId = $userStore.uid;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.active_programs && userData.active_programs.length > 0) {
      const lastProgramId = userData.active_programs[userData.active_programs.length - 1]; // Last program ID
      const programRef = doc(db, "programs", lastProgramId);
      const programSnap = await getDoc(programRef);

      if (programSnap.exists()) {
        currentProgramName = programSnap.data().name; // Set the program name
      } else {
        console.error('Program document does not exist');
      }
    }
  }
  async function fetchScheduleData() {
    const userId = $userStore.uid;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.schedule && userData.schedule.length > 0) {
      const lastWeekRefId = userData.schedule[userData.schedule.length - 1];
      const lastWeekRef = doc(db, "week", lastWeekRefId);
      const lastWeek = await getDoc(lastWeekRef);
      
      if (lastWeek.exists()) {
        lastWeekNumber = lastWeek.data().week_number; // Assuming you store week numbers
      }
    }
  }
  // Fetch the user's food entries and goal calories whenever the userStore changes (e.g., user logs in)
  $: {
    fetchFoodEntries();
    fetchGoalCalories();
    unsubscribeUserStore();
    fetchGoalWeight();
    fetchCurrentWeight();
    fetchLatestProgramName();
    fetchScheduleData();
    setUpCharts(currentUser);
    setUpWeightChart(currentUser);
}
</script>
<div class="content-wrapper">
	<div class="card-main" id="workout-plan">
    {#if currentProgramName }
      <h1>{currentProgramName}</h1>
    {:else}
      <h1>Discover Your Program Today</h1>
    {/if}
		<div style="border:1px solid var(--silver-100); width:100%;"></div>
		<div style="display:flex;height:30%;justify-content:space-between;align-items:center;;width:100%;">
			<div class="card-stats">
				<div>
					<p>Week</p>
					<p>{lastWeekNumber}</p>
				</div>
				<!-- <div class="vr"></div> -->
			</div>
      {#if currentProgramName}
      <a href="/workout-plans" use:link class="btn-main">Continue</a>
      {:else}
      <a href="/workout-plans" use:link class="btn-main">Explore</a>
      {/if}
		</div>
	</div>
  <div class="macro-wrapper">
    <div class="macro-card" id="cal-goal">
      <div>
        <p>Total Reps Completed</p>
        <h4>{total_reps} Reps</h4>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve">
        <defs>
        </defs>
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
          <path d="M 26.237 63.739 c -0.25 0 -0.49 -0.093 -0.675 -0.262 l -6.572 -6.011 c -0.408 -0.373 -0.436 -1.006 -0.063 -1.413 L 46.47 25.935 c 0.373 -0.409 1.008 -0.436 1.413 -0.063 l 6.573 6.01 c 0.195 0.179 0.313 0.428 0.324 0.693 c 0.012 0.265 -0.082 0.523 -0.261 0.719 l -27.544 30.12 c -0.179 0.195 -0.428 0.313 -0.693 0.324 C 26.267 63.739 26.252 63.739 26.237 63.739 z M 21.078 56.665 l 5.097 4.661 l 26.194 -28.644 l -5.097 -4.661 L 21.078 56.665 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 32 81.078 c -0.241 0 -0.482 -0.087 -0.674 -0.262 L 1.206 53.272 c -0.196 -0.18 -0.313 -0.429 -0.324 -0.693 c -0.012 -0.266 0.082 -0.524 0.261 -0.72 l 6.011 -6.572 c 0.372 -0.407 1.004 -0.437 1.413 -0.063 l 30.119 27.543 c 0.196 0.18 0.313 0.429 0.324 0.693 c 0.012 0.266 -0.082 0.524 -0.261 0.72 l -6.011 6.572 C 32.541 80.969 32.271 81.078 32 81.078 z M 3.293 52.471 l 28.644 26.194 l 4.661 -5.096 L 7.955 47.375 L 3.293 52.471 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 20.859 82.96 c -0.241 0 -0.482 -0.087 -0.674 -0.262 L 0.325 64.536 c -0.196 -0.18 -0.313 -0.429 -0.324 -0.693 c -0.012 -0.266 0.082 -0.524 0.261 -0.72 l 6.011 -6.572 c 0.373 -0.407 1.004 -0.436 1.413 -0.063 l 19.86 18.162 c 0.196 0.18 0.313 0.429 0.324 0.693 c 0.012 0.266 -0.082 0.524 -0.261 0.72 l -6.011 6.572 C 21.4 82.851 21.13 82.96 20.859 82.96 z M 2.413 63.734 l 18.384 16.813 l 4.661 -5.096 L 7.074 58.639 L 2.413 63.734 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 65.555 44.386 c -0.249 0 -0.49 -0.093 -0.675 -0.262 L 34.76 16.581 c -0.196 -0.179 -0.313 -0.428 -0.324 -0.693 c -0.012 -0.265 0.082 -0.523 0.261 -0.719 l 6.011 -6.573 c 0.179 -0.196 0.428 -0.313 0.693 -0.324 c 0.269 -0.008 0.524 0.083 0.719 0.261 l 30.119 27.543 c 0.407 0.373 0.436 1.005 0.063 1.413 l -6.01 6.573 c -0.18 0.196 -0.429 0.313 -0.693 0.324 C 65.584 44.386 65.569 44.386 65.555 44.386 z M 36.848 15.78 l 28.644 26.193 l 4.66 -5.097 L 41.509 10.683 L 36.848 15.78 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 66.436 33.123 c -0.241 0 -0.483 -0.086 -0.675 -0.262 L 45.9 14.699 c -0.196 -0.179 -0.313 -0.428 -0.324 -0.693 c -0.012 -0.265 0.082 -0.523 0.261 -0.719 l 6.01 -6.573 c 0.373 -0.408 1.007 -0.436 1.413 -0.063 l 19.86 18.162 c 0.195 0.179 0.313 0.428 0.324 0.693 c 0.012 0.265 -0.082 0.523 -0.261 0.719 l -6.011 6.572 C 66.977 33.013 66.706 33.123 66.436 33.123 z M 47.988 13.898 L 66.372 30.71 l 4.661 -5.097 L 52.649 8.801 L 47.988 13.898 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 9.518 82.022 c -0.25 0 -0.49 -0.093 -0.675 -0.262 L 2.271 75.75 c -0.408 -0.373 -0.436 -1.006 -0.063 -1.413 l 4.698 -5.138 c 0.179 -0.195 0.428 -0.313 0.693 -0.324 c 0.268 -0.014 0.524 0.082 0.719 0.261 l 6.573 6.011 c 0.408 0.373 0.436 1.006 0.063 1.413 l -4.698 5.138 c -0.179 0.195 -0.428 0.313 -0.693 0.324 C 9.548 82.022 9.533 82.022 9.518 82.022 z M 4.358 74.948 l 5.097 4.661 l 3.349 -3.661 l -5.097 -4.661 L 4.358 74.948 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 65.802 20.475 c -0.241 0 -0.483 -0.086 -0.675 -0.262 l -6.572 -6.011 c -0.407 -0.373 -0.436 -1.005 -0.063 -1.413 l 4.698 -5.138 c 0.373 -0.408 1.007 -0.437 1.413 -0.063 l 6.573 6.01 c 0.195 0.179 0.313 0.428 0.324 0.693 c 0.012 0.265 -0.082 0.523 -0.261 0.719 l -4.699 5.138 C 66.343 20.365 66.072 20.475 65.802 20.475 z M 60.643 13.401 l 5.096 4.661 l 3.35 -3.663 l -5.097 -4.661 L 60.643 13.401 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 69.583 83.611 c -11.258 0 -20.417 -9.159 -20.417 -20.417 s 9.159 -20.417 20.417 -20.417 S 90 51.937 90 63.194 S 80.841 83.611 69.583 83.611 z M 69.583 44.777 c -10.155 0 -18.417 8.262 -18.417 18.417 s 8.262 18.417 18.417 18.417 S 88 73.35 88 63.194 S 79.738 44.777 69.583 44.777 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 69.583 76.998 c -7.611 0 -13.804 -6.192 -13.804 -13.804 s 6.192 -13.803 13.804 -13.803 s 13.803 6.191 13.803 13.803 S 77.194 76.998 69.583 76.998 z M 69.583 51.392 c -6.509 0 -11.804 5.295 -11.804 11.803 c 0 6.509 5.295 11.804 11.804 11.804 c 6.508 0 11.803 -5.295 11.803 -11.804 C 81.386 56.687 76.091 51.392 69.583 51.392 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 69.583 68.432 c -2.888 0 -5.237 -2.35 -5.237 -5.237 s 2.35 -5.237 5.237 -5.237 s 5.237 2.35 5.237 5.237 S 72.471 68.432 69.583 68.432 z M 69.583 59.957 c -1.785 0 -3.237 1.452 -3.237 3.237 s 1.452 3.237 3.237 3.237 s 3.237 -1.452 3.237 -3.237 S 71.368 59.957 69.583 59.957 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        </g>
        </svg>
    </div>
    <div class="macro-card">
      <div>
        <p>Total Sets Completed</p>
        <h4>{total_sets} Sets</h4>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve">

        <defs>
        </defs>
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
          <path d="M 25.948 90 c -0.34 0 -0.682 -0.009 -1.024 -0.024 c -11.138 -0.532 -20.531 -9.572 -20.94 -20.152 C 3.774 64.355 5.85 59.065 9.831 54.926 c 4.242 -4.409 10.117 -6.937 16.12 -6.937 c 3.403 0 6.736 0.82 9.725 2.383 c 3.63 -2.992 8.278 -4.791 13.339 -4.791 c 2.327 0 4.584 0.37 6.739 1.102 l 0.934 -17.239 c 0.139 -1.709 -0.658 -3.27 -2.077 -4.13 l -3.133 -1.898 c -1.855 -1.123 -4.094 -1.363 -6.143 -0.66 c -0.098 0.034 -0.19 0.082 -0.28 0.133 c -1.775 1.004 -3.9 1.036 -5.695 0.09 c -1.795 -0.946 -2.97 -2.719 -3.143 -4.74 c -0.02 -0.231 -0.081 -0.454 -0.183 -0.663 c -2.514 -5.19 -0.715 -11.404 4.185 -14.453 l 2.587 -1.61 c 3.254 -2.027 7.464 -2.016 10.72 0.027 c 20.243 12.694 32.697 38.063 32.503 66.206 c -0.004 0.497 -0.191 0.974 -0.527 1.34 C 72.819 82.884 57.155 88.397 38.949 85.498 C 35.24 88.424 30.688 90 25.948 90 z M 25.951 51.99 c -4.921 0 -9.745 2.081 -13.237 5.711 c -3.22 3.347 -4.9 7.598 -4.732 11.969 c 0.325 8.413 8.17 15.882 17.132 16.31 c 4.402 0.219 8.643 -1.252 11.956 -4.118 c 0.454 -0.393 1.061 -0.561 1.652 -0.458 c 17.165 2.993 31.339 -1.742 43.307 -14.459 C 81.985 40.488 70.293 16.777 51.4 4.929 c -1.97 -1.236 -4.515 -1.245 -6.481 -0.021 l -2.587 1.61 c -3.158 1.966 -4.318 5.97 -2.698 9.314 c 0.315 0.651 0.506 1.346 0.568 2.066 c 0.057 0.668 0.43 1.23 1.023 1.542 c 0.592 0.313 1.267 0.302 1.849 -0.028 c 0.332 -0.188 0.646 -0.332 0.962 -0.44 c 3.175 -1.089 6.642 -0.717 9.514 1.023 l 3.133 1.897 c 2.725 1.651 4.255 4.649 3.996 7.823 l -1.083 20.019 c -0.036 0.675 -0.411 1.285 -0.997 1.624 c -0.584 0.337 -1.303 0.356 -1.905 0.052 c -2.392 -1.213 -4.975 -1.828 -7.679 -1.828 c -9.376 0 -17.004 7.629 -17.004 17.005 c 0 1.105 -0.896 2 -2 2 s -2 -0.896 -2 -2 c 0 -5.001 1.756 -9.598 4.684 -13.209 C 30.577 52.465 28.286 51.99 25.951 51.99 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        </g>
        </svg>
    </div>
    <div class="macro-card">
      <div>
        <p>Total Weight Lifted</p>
        <h4>{total_weight} lbs</h4>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve">

        <defs>
        </defs>
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
          <path d="M 45 90 c -18.321 0 -33.226 -14.905 -33.226 -33.227 c 0 -18.321 14.905 -33.226 33.226 -33.226 c 18.321 0 33.227 14.905 33.227 33.226 C 78.227 75.095 63.321 90 45 90 z M 45 27.548 c -16.115 0 -29.226 13.11 -29.226 29.226 S 28.885 86 45 86 s 29.227 -13.111 29.227 -29.227 S 61.115 27.548 45 27.548 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 23.088 36.533 c -0.87 0 -1.67 -0.572 -1.922 -1.45 l -4.05 -14.145 c -1.432 -5 -0.458 -10.25 2.673 -14.403 S 27.699 0 32.9 0 h 24.2 c 5.201 0 9.979 2.382 13.11 6.535 c 3.131 4.153 4.105 9.403 2.674 14.403 l -4.05 14.145 c -0.305 1.062 -1.411 1.676 -2.474 1.373 c -1.062 -0.304 -1.676 -1.412 -1.372 -2.473 l 4.05 -14.145 c 1.083 -3.782 0.346 -7.753 -2.022 -10.894 S 61.033 4 57.1 4 H 32.9 c -3.934 0 -7.548 1.802 -9.916 4.943 c -2.368 3.142 -3.105 7.112 -2.022 10.894 l 4.05 14.145 c 0.304 1.062 -0.311 2.169 -1.372 2.474 C 23.456 36.508 23.271 36.533 23.088 36.533 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 31.808 67.781 c -1.104 0 -2 -0.896 -2 -2 V 49.434 c 0 -1.104 0.896 -2 2 -2 s 2 0.896 2 2 v 16.348 C 33.808 66.886 32.913 67.781 31.808 67.781 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 39.635 67.781 c -0.527 0 -1.052 -0.207 -1.445 -0.617 l -7.827 -8.174 c -0.741 -0.773 -0.741 -1.992 0 -2.766 l 7.827 -8.174 c 0.763 -0.798 2.03 -0.825 2.828 -0.062 s 0.825 2.029 0.061 2.827 l -6.502 6.791 l 6.502 6.791 c 0.764 0.798 0.737 2.063 -0.061 2.827 C 40.63 67.597 40.132 67.781 39.635 67.781 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          <path d="M 53.465 67.781 c -4.7 0 -8.523 -4.563 -8.523 -10.174 s 3.823 -10.174 8.523 -10.174 c 1.725 0 3.385 0.609 4.801 1.762 c 0.856 0.697 0.985 1.957 0.288 2.813 c -0.696 0.856 -1.957 0.986 -2.813 0.288 c -0.694 -0.564 -1.48 -0.863 -2.275 -0.863 c -2.452 0 -4.523 2.827 -4.523 6.174 s 2.071 6.174 4.523 6.174 c 0.985 0 1.936 -0.45 2.727 -1.281 v -1.463 h -1.979 c -1.104 0 -2 -0.896 -2 -2 s 0.896 -2 2 -2 h 3.979 c 1.104 0 2 0.896 2 2 v 4.192 c 0 0.437 -0.143 0.86 -0.406 1.208 C 58.175 66.563 55.871 67.781 53.465 67.781 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        </g>
        </svg>
    </div>
  </div>
  
	<div class="card-main" id="strength-card">

    {#if strengthChartData}
		  <div use:chart={strengthChartData} />
    {:else}
      <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
    {/if}
    {#if deadliftChartData}
		  <div use:chart={deadliftChartData} />
    {:else}
      <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
    {/if}
    {#if squatChartData}
		  <div use:chart={squatChartData} />
    {:else}
      <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
    {/if}
		<!-- <div class="card-stats">
			  <p>Est. 1RM</p>
              <h4>150 lbs</h4>
              <p>Variation</p>
              <h4>+ 15%</h4>
		</div> -->
	</div>

	<div class="card-main" id="weight-card">
    {#if weightChartData}
		  <div use:chart={weightChartData} />
    {:else}
      <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
    {/if}

		<div class="card-stats">
			  <p>GOAL</p>
        <h4>{goalWeight}</h4>
        <p>TODAY'S WEIGHT</p>
        <h4>{currentWeight}</h4>
        <a class="btn-main" href="/nutrition" use:link> Update Weight </a>
		</div>
	</div>
	<div class="card-main" id="calorie-card">
		<div use:chart={chartOptions} />
		<div class="card-stats">
			<p>Calories Consumed</p>
		<h4>{totalCalories}</h4>
		<p>Calorie Goal</p>
		<h4>{goalCalories}</h4>
		<a class="btn-main" href="/nutrition" use:link> Explore Macros </a>
		</div>
	</div>
	<div class="card-main" id="meal-card">
		<div class="table-header">
            <h3>Your Meals Today</h3>
            <a class="btn-main" href="/nutrition" use:link> View More </a>
          </div>
          {#if foodEntries.length === 0}
            <p style="text-align:center;margin-top:100px;">Add a meal to start tracking your macros!</p>
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
                {#each foodEntries.slice(-4) as entry}
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

  <AnnounceModal/>

</div>
<style>
	.content-wrapper {
		height: auto;
		display: flex;
		flex-wrap: wrap;
		width: auto;
		max-width: 1360px;
		margin: 0 auto;
		padding: 10px 20px;
		justify-content: space-between;
		align-items: center;
    	}
	.card-main {
		box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
		width:100%;
		height: 350px;
		padding: 0;
		margin: 10px 0;
		flex-direction: row;
		align-items: center;
		overflow: hidden;
		text-align: center;
    border: none;
	}
	.card-stats {
		margin: 0 auto;
	}
	.card-main p {
		font-weight: 500;
		font-size: .70rem;
		line-height: 2.5;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--paragraph-color);
		margin-bottom: 0;
  	}
	.card-main h4 {
		font-weight: 500;
		font-size: 1.7rem;
		line-height: 1.2;
		margin: 10px 0 25px;
		color: #212636;
	}

  .macro-wrapper {
    display:flex;
    flex-wrap: wrap;
    height:auto;
    min-height: 160px;
    width:100%;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0;
  }
  .macro-card {
    box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    width: 32%;
    height: 160px;
    display: flex;
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
	:global(.apexcharts-title-text) {
		font-weight: 500;
		font-size: 1rem;
		line-height: 1.2;
		color: #212636;
	}
	#workout-plan {
		background-image: url("/images/workout-banner-1.svg");
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		flex-direction: column;
		justify-content: end;
	}
	#workout-plan h1 {
		color: white;
		letter-spacing: 2px;
		font-size: 2.5em;
		align-self: start;
		margin: 0 0 25px 30px;
	}
	#workout-plan p {
		color: white !important;
		font-size: 22px;
		letter-spacing: 2px;
		font-weight: bold;
		text-transform: capitalize;
	}
	#workout-plan .card-stats {
		display:flex;
		align-items: center;
		height: 100%;
		margin-left:60px;
		justify-content: space-around;
	}
	#workout-plan .card-stats div {
		display: flex;
	}
	#workout-plan .card-stats p:first-of-type {
		margin-right:10px;
	}
	/* #workout-plan .vr {
		height: 55%;
	} */
	#workout-plan .btn-main {
		height:50px;
		width: 180px;
		margin-right:60px;
		background-color: white;
		color: var(--blue-75);
		font-weight: bold;
		letter-spacing: normal;
		display: flex;
		justify-content: center;
		align-items: center;
    font-size: 1.2rem;
	}
	#workout-plan .btn-main:hover {
		background-color: var(--orange-75) !important;
	}
	#weight-card, #calorie-card, #meal-card {
		width: 49%;
	}
  #strength-card {
    width: 100%;
  }
	/* .vr {
		border: 1px solid var(--silver-75);
		margin:0 20px;
	} */
	:global(.apexcharts-yaxis) {
		display:none;
	}
	.btn-main {
    height: 30px;
    width:150px;
    padding:0px;
    font-size: .90rem;
    display:flex;
    align-items: center;
    justify-content: center;
	}
	#meal-card {
		flex-direction: column;
    width: 100%;
    height: auto;
	}
	/* TODO: Abstract CSS to global */
	.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 15px 0 15px 0;
    border-bottom: 1px solid #dcdfe4;
  }
  .table-header h3 {
    margin-left: 20px;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 500;
		font-size: 1rem;
		line-height: 1.2;
		color: #212636;
    letter-spacing: 0;
  }
  .table-header .btn-main {
    margin: 0;
    margin-right: 40px;
  }
  .table-footer{
    height: 35px;
    border-top: 1px solid #dcdfe4;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    overflow-y: scroll;
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
    transition: .2s ease-in-out;
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
  #protein{
    background-color: #DD403A;
  }
  #fat {
    background-color: #2892D7;
  }
  #carbs {
    background-color: #E0BE36;
  }
</style>