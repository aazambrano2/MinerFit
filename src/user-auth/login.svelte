<script>
    import {auth} from '../Firebase.js'
    import db from '../Firebase.js'
    import { signInWithEmailAndPassword } from "firebase/auth";
    import {link, push} from 'svelte-spa-router'
    import {userStore, showModalAnnounce } from './user-store.js'
    import { getDoc, doc, Timestamp, collection, setDoc, updateDoc, arrayUnion} from 'firebase/firestore';
    import { fillInDates, ensureRevenueDocs } from './setUserSchedule.js';


    async function onSubmit(e) {
		// get the form fields data 
		const formData = new FormData(e.target)

        const data = {};
        for (let field of formData) {
            const [key, value] = field;
            data[key] = value;
        }

        const password = data['password']
        const email = data['email']

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                userStore.set(user);
                fillInDates(user.uid);
                ensureRevenueDocs();
                checkUserTypeAndRedirect(user.uid);

            })
            .catch((error) => {
                // Display alert for failed login attempts
                alert('Failed to login. Please check your credentials.');
                console.error('Login error:', error.message);
            });
	}

    // Checks if user is a Customer or Manager and redirects accordingly
    async function checkUserTypeAndRedirect(userID) {
        try {
            const userInfoSnap = await getDoc(doc(db, "users", userID));
            if (userInfoSnap.exists()) {
                const userInfo = userInfoSnap.data();

                showModalAnnounce.set(true); // Will display the announcement modal upon login

                if (userInfo.type === "Manager") {
                    push('/home-manager');
                } else {
                    push('/home');
                }
            } else {
                console.log("No such user document!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }


</script>
<div class="content-wrapper">
    <div class="form-wrapper">
        <h1><span>Login</span></h1> 
        <p>New? <a href="/register" use:link >Register in here.</a></p>
        <form on:submit|preventDefault={onSubmit}>
            <div>
                <p>Email</p>
                <input type="email" name="email" placeholder="name@company.com" required />
            </div>
            <div>
                <p>Password</p>
                <input type="password" name="password" placeholder="•••••" required />
    
            </div>
            <div>
                <button class="btn-main" type = "submit">Login</button>
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