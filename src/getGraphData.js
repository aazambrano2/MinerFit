
import db from './Firebase.js';
import { getDoc, doc } from 'firebase/firestore';

// Performs a calculation based on the selected operation (sum, max, average) for the latest 4 weeks
// Returns an object { nums: <array of week numbers>, stats: <array of week stats> }
export async function getChosenStat (userID, attributeName, operation) {

    // Getting schedule of authorized user
    const userDocRef = doc(db, "users", userID);
    const userDoc = await getDoc(userDocRef);
    const schedule = userDoc.data().schedule;

    // Schedule is empty or does not exist
    if (!schedule || schedule.length === 0) {
        console.log("No weeks in the user's schedule!");
        return false;
    } 
    const lastFourWeeks = await getLastFourWeeks(schedule);
    const weeks = lastFourWeeks.map(week => week.id) // Gets only the IDs
    const weekNums = lastFourWeeks.map(num => `Week ${num.weekNum}`);

    // Stores the chosen statistic for latest 4 weeks (default = 0)
    const weekStats = [0, 0, 0, 0]; 

    let tempHolder = []; // For calculating averages

    // Iterate through all the four weeks
    for (let i = 0; i < weeks.length; i++) {
        const weekRef = doc(db, "week", weeks[i]);
        const weekSnap = await getDoc(weekRef);  
        const weekData = weekSnap.data();     
        const days = weekData.days;

        tempHolder = []; // Resetting the holder

        // Iterate through the days in the week
        for (const day of days) {
            const dayRef = doc(db, "day", day);
            const daySnap = await getDoc(dayRef);
            const dayData = daySnap.data();
            
            if (dayData.hasOwnProperty(attributeName) && typeof dayData[attributeName] === 'number') {
                
                // Perform selected operation
                if (operation === "sum") {
                    weekStats[i] += weekStats[i] + dayData[attributeName];

                } else if (operation === "max") {
                    if (weekStats[i] < dayData[attributeName]) {weekStats[i] = dayData[attributeName]} 

                } else if (operation === "average") {
                    tempHolder.push(dayData[attributeName]);

                } else {
                    return null; // Operation invalid
                }
            }
        }

        if (operation === "average") {weekStats[i] = tempHolder.reduce((acc, curr) => acc + curr, 0) / tempHolder.length}
    }

    console.log(weekNums);
    console.log(weekStats);
    return { nums: weekNums, stats: weekStats };
}

// Get week numbers for each week and then sort. Returns sorted array of weekIDs
export async function getLastFourWeeks(weekIDs) {
    const weeks = [];

    // Iterate through each week to get the week_numbers
    for (const weekID of weekIDs) {
        const weekRef = doc(db, "week", weekID);
        const weekSnap = await getDoc(weekRef);

        if (weekSnap.exists()) {
            const weekData = weekSnap.data();
            weeks.push({ id: weekID, weekNum: weekData.week_number });

        } else {
            console.error('Week does not exist!');
        }
    }
    // Sort based on increasing weekNum
    weeks.sort((a, b) => a.weekNum - b.weekNum); 
    
    const lastFourWeeks = weeks.slice(-4);
    return lastFourWeeks;
}
