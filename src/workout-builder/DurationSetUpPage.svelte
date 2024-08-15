<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let weekAmount = "";
    let daysPerWeekAmount = 0;
    let programName = "";
    let programDescription = ""

    // send parent component the program information
    function handleSubmit(event) {
        event.preventDefault()
        // extra validation to ensure info is submitted as expectede
        if (weekAmount < 1 || daysPerWeekAmount < 1 || daysPerWeekAmount > 7 || !programName.trim() || !programDescription.trim()) {
            alert("Please fill in all fields and ensure week and days per week amounts are valid.");
            return;
        }
        // send information to parent container
        dispatch('submit', { programName, programDescription, weekAmount, daysPerWeekAmount })
    }
</script>
<div class="main-section">
    <div class="content-wrapper">
        <h1><span>Build</span> Your Workout Program</h1>
        <p>Create a custom workout plan tailored to your fitness goals.</p>
        <form on:submit={handleSubmit}>
            <div>
                <label for="programName">Program Name</label>
                <input placeholder="Enter Program Name" type="text" id="programName" name="programName" maxlength="30" bind:value={programName} required>
            </div>
            <div>
                <label for="weekAmount">Program Duration </label>
                <input placeholder="Enter # of Weeks" type="number" id="weekAmount" name="weekAmount" min="1" bind:value={weekAmount} required>
            </div>
            <div id="description-container">
                <label for="programDescription">Program Description</label>
                <input placeholder="Enter a short description of your program"type="text" id="programDescription" name="programDescription" maxlength="300" bind:value={programDescription} required>
            </div>
            <div id="days-per-week-container">
                <label for="day1">Workout Days Per Week</label>
                <div>
                    <input type="radio" id="day1" name="daysPerWeek" value="1" bind:group={daysPerWeekAmount}>
                    <label for="day1">1 Day</label>

                    <input type="radio" id="day2" name="daysPerWeek" value="2" bind:group={daysPerWeekAmount}>
                    <label for="day2">2 Days</label>

                    <input type="radio" id="day3" name="daysPerWeek" value="3" bind:group={daysPerWeekAmount}>
                    <label for="day3">3 Days</label>

                    <input type="radio" id="day4" name="daysPerWeek" value="4" bind:group={daysPerWeekAmount}>
                    <label for="day4">4 Days</label>

                    <input type="radio" id="day5" name="daysPerWeek" value="5" bind:group={daysPerWeekAmount}>
                    <label for="day5">5 Days</label>

                    <input type="radio" id="day6" name="daysPerWeek" value="6" bind:group={daysPerWeekAmount}>
                    <label for="day6">6 Days</label>

                    <input type="radio" id="day7" name="daysPerWeek" value="7" bind:group={daysPerWeekAmount}>
                    <label for="day7">7 Days</label>
                </div>
            </div>
            <p id="rest-tip">
                Remember to account for rest days in your weekly schedule.
            </p>
            <input class="btn-main" type="submit" value="Create Program">
        </form>
    </div>
</div>
<style>
    .main-section {
        height: auto;
        min-height: calc(100vh - 75px);
        display: flex;
        align-items: center;
    }
    .content-wrapper {
        width: 700px;
        margin: 0 auto;
    }
    .content-wrapper h1 {
        font-size: 2.9rem;
        line-height: 1;
        margin-bottom: 0;
    }
    .content-wrapper p {
        color: #6b7280;
        font-weight: 100;
        font-size: 1.1rem;
    }
    h1 span {
        color: var(--orange-75);
    }
    form {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top:40px;
    }
    form div {
        display: flex;
        flex-direction: column;
        width: 48%;
    }
    #description-container {
        width:100%;
        margin-top: 26px;
    }
    #description-container input {
        height:125px;
    }
    #days-per-week-container {
        width: 100%;
        margin-top: 26px;
    }
    #days-per-week-container div {
        display: flex;
        flex-direction: row;
        margin-top: 16px;
        width: 100%;
        align-items: center;
        justify-content: space-between;
    }
    label {
        color: #171717;
        font-size: 0.9rem;
        line-height: 1;
        font-weight: 100;
    }
    input {
        padding: 0.5rem 0.75rem;
        margin-top:6px;
        border: 1px solid #e6e5e5; /* Set the border style for the input field */
        border-radius: 5px;
    }
    input[type="radio"] {
        /* appearance: none; */
        border-radius: 50%;
        width: 17px;
        height: 17px;
        border: 2px solid #ccc;
        transition: 0.2s all linear;
        margin-right: 6px;
        margin-top: 0;
        position: relative;
        /* top: 4px; */
    }
    #rest-tip {
        color: #6b7280;
        font-size: 0.975rem;
        line-height: 1.25rem;
        margin-top:16px;
    }
    .btn-main {
        width: 100%;
        font-size: 0.925rem;
        line-height: 1.25rem;
        margin-top: 0;
    }

    /* input[type="radio"]:checked {
    border: 6px solid #2c3e50;
    } */
</style>