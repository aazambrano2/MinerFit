
import db from '../Firebase.js';
import { getDoc, doc, Timestamp, collection, setDoc, updateDoc, arrayUnion, query, getDocs, addDoc, limit, orderBy} from 'firebase/firestore';


// Fills in missing weeks and days (assumes that the initial week was added upon user registration)
export async function fillInDates(userID){

      // Get the correct user doc
      const userDocRef = doc(db, "users", userID);
      const userDoc = await getDoc(userDocRef);

      // Normalize date user was created
      const dateCreatedTimestamp = userDoc.data().dateCreated;
      const dateCreated = dateCreatedTimestamp.toDate();
      dateCreated.setHours(0, 0, 0, 0);

      // Normalize today's date
      const dateToday = new Date();
      dateToday.setHours(0, 0, 0, 0);

      const diff = dateToday - dateCreated;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(days / 7) + 1;

      // Cycle through each week number
      for (let weekIndex = 1; weekIndex <= weekNum; weekIndex++) {
          const weekExists = await checkWeekNumExists(userID, weekIndex);            

          if (!weekExists) { // If the week does not exist, create a new week and add to schedule
              const weekStartDate = new Date(dateCreated.getTime() + (weekIndex - 1) * 7 * 24 * 60 * 60 * 1000);
              const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

              const weekDocRef = doc(collection(db, "week"));
              const newWeekData = {
                  week_number: weekIndex,
                  week_start: weekStartDate,
                  week_end: weekEndDate, 
                  days: [],
                  total_lifted_pounds: 0,
                  total_calories: 0,
                  userID: userID
              }
              await setDoc(weekDocRef, newWeekData);

              await updateDoc(userDocRef, {
                  schedule: arrayUnion(weekDocRef.id)
              })

              fillWeekWithDays(userID, weekDocRef.id, weekStartDate, weekEndDate);
          }
      }
  }

  // Searches for a specific week inside a user's schedule
  export async function checkWeekNumExists(userID, targetWeek) {
      const userDocRef = doc(db, "users", userID);
      const userDoc = await getDoc(userDocRef);
      const schedule = userDoc.data().schedule;

      // Schedule is empty or does not exist
      if (!schedule || schedule.length === 0) {
          return false;
      } 

      // Loop through all of the weeks
      for (const weekID of schedule) {
          const weekDocRef = doc(db, "week", weekID);
          const weekDoc = await getDoc(weekDocRef);

          if (weekDoc.exists()) {
              const weekNum = weekDoc.data().week_number;

              if(weekNum === targetWeek) {
                  return true;
              }
          }
      }
      // The targetWeek was not found
      return false;
  }

  // Create a new document in Days collection
  export async function createDayDoc(userID, weekID, date) {
      const dayDocRef = doc(collection(db, "day")); 
      const dayData = {
          calories: 0,
          carbs: 0,
          date: Timestamp.fromDate(date),
          fats: 0,
          lifted_pounds: 0,
          performance_tracker: [],
          protein: 0,
          user_weight: 0,
          week_ID: weekID,
          total_reps: 0,
          total_sets: 0,
          bench_max: 0,
          squat_max: 0,
          deadlift_max: 0,
          userID: userID
      };

      await setDoc(dayDocRef, dayData);
      return dayDocRef.id;       
  }

  // Adds the days in array dayIDs into the corresponding week
  export async function addDaysToWeek(weekID, dayIDs) {
      const weekDocRef = doc(db, "week", weekID);
      await updateDoc(weekDocRef, {
          days: arrayUnion(...dayIDs) 
      });
  }

  // Fill in a week with all the corresponding days based on today's date
  export async function fillWeekWithDays(userID, weekID, weekStartDate, currentDate) {
      let dayIDs = [];
      let date = new Date(weekStartDate);

      while (date <= currentDate) {
          const dayID = await createDayDoc(userID, weekID, date);
          dayIDs.push(dayID);
          date.setDate(date.getDate() + 1);
      }

      await addDaysToWeek(weekID, dayIDs);
  }



  export function getWeeksBetween(startDate, endDate) {
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffInMilli = end - start;
    return Math.floor(diffInMilli / oneWeek) + 1;
  }

  export async function ensureRevenueDocs() {
    const startDate = '2024-04-11'; // Date of official website creation
    const today = new Date(); // Use current date
    const weeksCount = getWeeksBetween(startDate, today);

    const revenueRef = collection(db, 'revenue');
    const revenueQuery = query(revenueRef);
    const querySnapshot = await getDocs(revenueQuery);
    const numberOfRevenueDocs = querySnapshot.size;

    if (weeksCount > numberOfRevenueDocs) {
        // Add new revenue doc if weeks are greater than docs
        const newRevenueData = {
            weekNum: numberOfRevenueDocs + 1,
            earnings: 0,
            newUsers: 0,
            createdAt: new Date() // Current timestamp
        };

        await addDoc(revenueRef, newRevenueData);
        console.log("New revenue document added for week", numberOfRevenueDocs + 1);

    } else {
        console.log("Sufficient revenue documents present.");
    }
}

export async function incrementNewUsers() {
    const revenueRef = collection(db, 'revenue');

    const filtered = query(revenueRef, orderBy('weekNum', 'desc'), limit(1));

    const querySnapshot = await getDocs(filtered);
    if (!querySnapshot.empty) {
        const highestWeekDoc = querySnapshot.docs[0];
        const docRef = doc(db, 'revenue', highestWeekDoc.id);
        await updateDoc(docRef, {
            newUsers: highestWeekDoc.data().newUsers + 1
        })
        console.log("Incremented newUsers for week", highestWeekDoc.data().weekNum);
    } else {
        console.log("No revenue document found!");
    }
}