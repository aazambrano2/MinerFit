// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {collection, getFirestore, getDoc, addDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot} from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDilyzMdeCklvBIczO0c4sK6eXq0HEO-2E",
  authDomain: "team-s-6-fitness-system.firebaseapp.com",
  projectId: "team-s-6-fitness-system",
  storageBucket: "team-s-6-fitness-system.appspot.com",
  messagingSenderId: "1010898588817",
  appId: "1:1010898588817:web:af510d4ac6beb70db2db30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//Gets the db from FireStore Project
const db = getFirestore(app)
const auth = getAuth(app)
export default db

export {collection, getFirestore, getDoc, addDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, auth}
