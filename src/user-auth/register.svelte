<script>
    import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
    import { registerVersion } from 'firebase/app';
    import {link, push} from 'svelte-spa-router';
    import {doc, setDoc, Timestamp} from 'firebase/firestore';
    import db from '../Firebase.js';
    import { fillInDates, ensureRevenueDocs, incrementNewUsers } from './setUserSchedule.js';

    const auth = getAuth();


    function onSubmit(e) {
		// get the form fields data 
		const formData = new FormData(e.target)

        const data = {};
        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }

        
        if (data['confirm-password'] != data['password']){
            //check passwords
            alert('PASSWORDS DO NOT MATCH')
            
        }else{
            const password = data['password']
            const email = data['email']
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                alert('Account created successfully');

                const userID = user.uid;

                // Stores blank attributes for creating a user doc
                const newUser = {
                    active_programs: [],
                    inactive_programs: [],
                    food_entries: [],
                    username: data['username'],
                    schedule: [],
                    total_sets: 0,
                    total_reps: 0,
                    total_weight:0,
                    type: 'Customer', // Default type for new users
                    dateCreated: Timestamp.fromDate(new Date()) // Gets the date user was created
                
                }

                // Adds a new user to the user collection
                const userDocRef = doc(db, 'users', userID);
                setDoc(userDocRef, newUser)
                .then(() => {
                    console.log("New User Added to Firebase");
                })
                .catch((e) => {
                    console.log(e);
                })

                // Add the first week to the user's schedule
                fillInDates(userID);
                ensureRevenueDocs();
                incrementNewUsers();

                // Redirect to home page upon successful account creation
                push('/home');
            })
            .catch((error) => {
                console.error('Account creation error:', error.message);
                // Display alert for failed account creation attempts
                alert('Failed to create account. Please try again.');
            });
            
        }
	}


    
</script>
<div class="content-wrapper">
    <div class="form-wrapper">
        <h1><span>Create</span> an account</h1> 
        <p>Already have an account? <a href="/login" use:link >Log in here.</a></p>
        
    <form on:submit|preventDefault={onSubmit}>
        <div>
            <p>Username <span>(required)</span></p>
            <input type="text" name="username" placeholder="Username" required />
        </div>  
        <div>
            <p>Email <span>(required)</span></p>
            <input type="email" name="email" placeholder="name@company.com" required />
        </div>  
        <div>
            <p>Password <span>(required)</span></p>
            <input type="password" name="password" placeholder="•••••" required />

        </div>
        <div>
            <p>Confirm Password <span>(required)</span></p>
            <input type="password" name="confirm-password" placeholder="•••••" required />
        </div>
        <div>
            <button class="btn-main" type = "submit">Create account</button>
        </div>
    </form>
    </div>
</div>
<style>
    .content-wrapper {
        height: calc(100vh - 75px);
        width: 100%;
        max-width: 1800px;
        margin: 0 auto;
        display: flex;
        align-items: center;
    }
    .form-wrapper {
        display: flex;
        flex-direction: column;
        height: calc(100% - 70px);
        width: 50%;
        margin: 0 auto;
        justify-content: center;
    }
    .form-wrapper h1 {
        margin: 0 0 10px 0;
    }
    .form-wrapper h1 span {
        color: var(--orange-75);
    }
    .form-wrapper p {
        color: var(--blue-50);
        margin-top:5px;
    }
    .form-wrapper a {
        color: var(--blue-50);
        border-bottom: 1px solid var(--blue-25);
        padding-bottom: 1px;
        transition: .1s ease-in-out;
    }
    .form-wrapper a:hover {
        color: var(--orange-100);
        border-color: var(--orange-50);
    }
    form {
        width: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    form div {
        margin: 25px 0;
        display: flex;
        flex-direction: column;
    }
    form div:last-child {
        justify-content: end;
    }
    form p {
        margin: 10px 0;
        font-weight: bold;
        color: var(--blue-75) !important;
    }
    form p span {
        color: var(--blue-50);
        font-weight: normal;
        font-size:15px;
    }
    form div span {
        margin-bottom: 10px;
    }
    input {
        padding: 20px 10px;
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
    .btn-main {
        width: 322px;
        font-size: 17px;
        height:auto;
        padding:20px;
        margin: 0;
    }
</style>