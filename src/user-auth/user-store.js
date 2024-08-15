
import { writable } from "svelte/store";
import { auth } from "../Firebase.js";

export const userStore = writable(null);

auth.onAuthStateChanged((user) => {
  userStore.set(user);
});

// Allows the Announcement modal to appear only once
export const showModalAnnounce = writable(true);