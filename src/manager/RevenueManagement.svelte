<script>
    import { collection, query, where, getDocs, doc, orderBy, limit } from "firebase/firestore";
    import db from '../Firebase';
    import { onMount } from 'svelte';
    import ManagerSidebar from "./ManagerSidebar.svelte";
    import { chart } from "svelte-apexcharts";

    // User stats
    let customerCount = 0;
    let coachCount = 0;
    let trainerCount = 0;
    let totalCount = 0;

    // Revenue stats
    let revenueChartData;
    let usersChartData;
    let weeks = [];
    let earnings = [];
    let users = [];
    let percentChange = 0;
    let totalEarnings = 0;
    let userChange = 0;

    // Gets the count of specified type of user
    async function countUserType(type) {
        const usersRef = collection(db, 'users');
        const filtered = query(usersRef, where('type', '==', type));

        try {
            const querySnapshot = await getDocs(filtered);
            return querySnapshot.size;

        } catch (error) {
            console.error('Error fetching customer data: ', error);
            return 0;
        }
    }

    // Sets the counts for each user type
    async function setTypeCounts() {
        customerCount = await countUserType('Customer');
        coachCount = await countUserType('Coach');
        trainerCount = await countUserType('Trainer');
        totalCount = customerCount + coachCount + trainerCount;       
    }

    // Get the total Earnings
    async function getTotalEarnings() {

        const revenueRef = collection(db, 'revenue');

        const querySnapshot = await getDocs(revenueRef);

        querySnapshot.forEach((doc) => {
            totalEarnings += doc.data().earnings;
        });
    }

    // Sets the weeks and earnings arrays with data from last 4 weeks.
    async function getLastFourEarnings() {

        // Clear the arrays
        weeks = [];
        earnings = [];
        users = [];

        const revenueRef = collection(db, 'revenue');
        const filtered = query(revenueRef, orderBy('weekNum', 'desc'), limit(4));

        try {
            const querySnapshot = await getDocs(filtered);

            querySnapshot.forEach((doc) => {
                weeks.push(`Week ${doc.data().weekNum}`);
                earnings.push(doc.data().earnings);
                users.push(doc.data().newUsers);
                console.log(doc.data());
            });

            weeks = weeks.reverse();
            earnings = earnings.reverse();
            users = users.reverse();

        } catch (error) {
            console.error('Error getting the revenue data: ', error);
        }

        console.log(weeks);
        console.log(earnings);

        calculatePercentChange();
        await getTotalEarnings();
    }

    // Get the percent change from last weeks earnings to this week
    function calculatePercentChange() {
        if( earnings.length > 1) {
            const currentEarnings = earnings[3];
            const previousEarnings = earnings[2];
            if (previousEarnings != 0) {
                percentChange = ((currentEarnings  - previousEarnings) / previousEarnings) * 100;
            }
        }
        if( users.length > 1) {
            const currentUsers = users[3];
            const previousUsers = users[2];
            if (previousUsers != 0) {
                userChange = ((currentUsers  - previousUsers) / previousUsers) * 100;
            }
        }
    }

    async function setUpCharts() {

        await getLastFourEarnings();
  
	    revenueChartData = {
            series: [	
            {
                name: "Earnings",
                data: earnings
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
            colors: ['#f68c1e'],
            dataLabels: {
            enabled: true,
            },
            stroke: {
            curve: 'smooth',
            width: 15
            },
            title: {
            text: 'Weekly Revenue from Premium Tiers',
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
                categories: weeks,
                title: {
                    text: 'Week Number'
                }
            },
            yaxis: {
                min: Math.ceil((Math.min(...earnings) - 5)),
                max: Math.ceil((Math.max(...earnings) + 5)),
                tickAmount: 5, 
                title: {
                    text: 'Revenue ($)'
                }
            },
            legend: {
            position: 'top',
            horizontalAlign: 'center',
            floating: true,
            offsetY: -25,
            offsetX: -5
            }
        };

	    usersChartData = {
            series: [	
            {
                name: "New Users",
                data: users
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
            colors: ['#243b68'],
            dataLabels: {
            enabled: true,
            },
            stroke: {
            curve: 'smooth',
            width: 15
            },
            title: {
            text: 'New Users by Week',
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
                categories: weeks,
                title: {
                        text: 'Week Number'
                    }
            },
            yaxis: {
                min: 0,
                max: (Math.max(...users) + 5),
                title: {
                    text: 'Number of Users'
                }
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

    // Makes sure all data is loaded along with the svelte component
    onMount(() => {
        setTypeCounts();      
        setUpCharts();
        calculatePercentChange();
    });

</script>


<style>
    .revenue-group {
        display: flex;
        flex-direction: row;
        gap: 20px;
        margin-top: 30px;
    }

    .revenue-card {
        box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
        border-radius: 20px;
        width: 33%;
        height: 160px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        text-align: center;
        overflow: hidden;
    }

    .revenue-card p {
        margin-top: 0;
        font-weight: bold;
    }

    .revenue-card h2 {
        margin-bottom: 0;
    }

    .graph-group {
        display: flex;
        flex-direction: row;
        gap: 30px;
        margin-top: 30px;
    }

	.graph-card {
		box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
        border-radius: 20px;
		width:50%;
		height: 350px;
		padding: 0;
        padding-left: 80px;
		margin: 10px 0;
        display: flex;
		flex-direction: row;
		align-items: center;
		overflow: hidden;
		text-align: center;
	}
	.graph-stats {
		margin: 0 auto;
	}
	.graph-card p {
		font-weight: 500;
		font-size: .70rem;
		line-height: 2.5;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--paragraph-color);
		margin-bottom: 0;
  	}
	.graph-card h4 {
		font-weight: 500;
		font-size: 1.7rem;
		line-height: 1.2;
		margin: 10px 0 25px;
		color: #212636;
	}

</style>

<ManagerSidebar>
    <h2>Revenue Management</h2>
    <div class="revenue-group">
        <div class="revenue-card">
            <div>
                <p>Basic Tier Count</p>
                <h2>{customerCount}</h2>
            </div>
        </div>
        <div class="revenue-card">
            <div>
                <p>Coach Tier Count</p>
                <h2>{coachCount}</h2>
            </div>
        </div>
        <div class="revenue-card">
            <div>
                <p>Trainer Tier Count</p>
                <h2>{trainerCount}</h2>
            </div>
        </div>
    </div>

    <div class="graph-group">
        <div class="graph-card">
            <div class="graph-element">
                {#if revenueChartData}
                    <div use:chart={revenueChartData}/>
                {:else}
                    <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
                {/if}
            </div>
            <div class="graph-stats">
                <p>Total Earnings</p>
                <h4>${totalEarnings}</h4>
                <p>Current Week % Change</p>
                <h4>{percentChange.toFixed(1)}%</h4>
            </div>
        </div>
        <div class="graph-card">
            <div class="graph-element">
                {#if usersChartData}
                    <div use:chart={usersChartData}/>
                {:else}
                    <p style="display: block; text-align: center; width: 70%;">Loading chart...</p>
                {/if}
            </div>
            <div class="graph-stats">
                <p>Total Users</p>
                <h4>{totalCount}</h4>
                <p>Current Week % Change</p>
                <h4>{userChange.toFixed(1)}%</h4>
            </div>
        </div>
    </div>

</ManagerSidebar>