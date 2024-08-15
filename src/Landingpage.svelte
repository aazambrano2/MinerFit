<script>
    import {link} from 'svelte-spa-router'
    import { userStore } from './user-auth/user-store.js';
    import { push } from 'svelte-spa-router';

    let authenticated = false;

    $: {
        authenticated = $userStore !== null;
        if (authenticated) {
            // Redirect to home page if authenticated
            push('/home', { replaceState: true });
        }
    }
</script>
<div class="hero">
    <div class="banner-wrapper">
        <h1 class="main-heading">Unlock your <span>potential</span></h1>
        <p class="main-caption">Begin the transformation you have always dreamed of.</p>
        <a class="btn" href="/register" use:link>GET STARTED</a>
    </div>
    <div class="line"></div>
    <div id="section1">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pie-chart-fill" viewBox="0 0 16 16">
                <path d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778zM8.5.015V7.5h7.485A8 8 0 0 0 8.5.015"/>
              </svg>
            <h3>Nutrition tracker</h3>
            <container>
                <p>Input your daily intake.</p>
                <p>Monitor your macros.</p>
                <p>Balance your meals.</p>
            </container >
        </div>
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-wide-connected" viewBox="0 0 16 16">
                <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"/>
              </svg>
            <h3>Customized workouts</h3>
            <container>
                <p>Create a routine for you.</p>
                <p>Customizable schedules.</p>
                <p>Crush your specific goals.</p>
            </container >
        </div>
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
              </svg>
            <h3>Community that inspires</h3>
            <container>
                <p>Connect with fitness enthusiasts.</p>
                <p>Get advice and motivation.</p>
                <p>Share your victories.</p>
            </container >
        </div>
    </div>
    <div class="line"></div>
    <div class="side-container" id="section2">
        <div>
            <h1>Master your fitness evolution with <br><span>advanced progress tracking</span></h1>
            <div>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>In-depth tracking of weight and strength</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>Easy-to-understand graphs and charts</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>Receive tailored summaries of your fitness journey</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>Set and celebrate your personal milestones</p>
            </div>
        </div>
    </div>
    <div class="line"></div>
    <div class="side-container" id="section3">
        <h1>Choose from our curated selection of <br><span>predefined workout plans</span></h1>
        <div>
        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>Plans designed by fitness professionals</p>
        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>Find the perfect match for your goals and lifestyle</p>
        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>Select plans based on your specific fitness goals</p>
        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>No planning, just doing</p>
        </div>
    </div>
    <div class="line"></div>
    <div id="section4">
        <h1 class="main-heading">Embark on your fitness journey with <span>confidence</span></h1>
        <p class="main-caption">Unlock access to a world of fitness where convenience meets efficacy.</p>
        <a class="btn" href="/register" use:link>JOIN NOW</a>
    </div>
</div>
<style>
    :global(body) {
        box-sizing: border-box;
    }
    .hero {
        background-image: url("/images/LandingPage/banner2.png");
        background-attachment: fixed;
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;
        height: auto;
        min-height: 100%;
        width: auto;
    }
    .banner-wrapper {
        height: 500px;
        margin: 70px 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .main-heading {
        color: white;
        font-size: 50px;
        margin: 0;
        text-shadow: black 2px 3px 3px;
    }
    .main-caption {
        color: white;
        font-size: 25px;
        letter-spacing: 1px;
        text-shadow: black 2px 3px 3px;
    }
    span {
        color: var(--orange-75);
    }
    .btn {
        display: block;
        color: white;
        background-color: #00124515;
        letter-spacing: 2px;
        width:200px;
        padding:15px 25px;
        text-align: center;
        border: 2px solid var(--orange-75);
        border-radius: 7px;
        transition: .2s ease-in-out;
    }
    .btn:hover {
        background-color: var(--orange-75);
    }
    .btn:active {
	transform: translateY(1px)
    }
    #section1, #section4 {
        height: 350px;
        background-image: url("/images/LandingPage/background1.png");
        background-attachment: fixed;
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    #section1 div {
        height: 85%;
        width: 25%;
        display: flex;
        flex-direction: column;
        background-color: #ffffff28;
        border-radius: 10px;
        box-shadow: var(--shadow);
        padding: 0 40px;
        align-items: center;
        justify-content: center;
        transition: .2s ease-in-out;
    }
    #section1 div:hover {
        background-color: #ffffff71;
        box-shadow: 0px 5px 6px rgba(0, 0, 0, 0.3);
    }
    #section1 h3 {
        font-size: 26px;
    }
    #section1 p {
        margin: 0 0 5px 0;
        font-size: 20px;
    }
    #section1 p::before {
        content: "\2713";
        color: var(--orange-100);
        margin-right: 10px;
        font-size: 19px;
    }
    #section1 svg {
        color: var(--orange-75);
        height: 80px;
        width: auto;
    }
    .side-container {
        width: 50%;
        height: 650px;
        background-image: url("/images/LandingPage/background1.png");
        background-attachment: fixed;
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    .side-container p {
        border: 3px solid  var(--blue-75);
        color: var(--blue-100);
        padding:20px 25px;
        font-size: 20px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        letter-spacing: 1px;
    }
    .side-container svg {
        color: var(--orange-75);
        height: 30px;
        width: auto;
        margin-right: 10px;
    }
    #section2 {
        margin-left: 50%;
    }
    #section4 {
        flex-direction: column;
        justify-content: center;
        height: 500px;
    }
    #section4 .main-heading {
        color: var(--blue-75);
        text-shadow: none;
    }
    #section4 .main-caption {
        color: var(--blue-75);
        text-shadow: none;
    }
    #section4 .btn {
        color: white;
        background-color: var(--orange-75);
        font-weight: bold;
        text-shadow: var(--shadow);
        border:none;
    }
    #section4 .btn:hover {
        background-color: var(--orange-100);
    }
    .line {
        height:5px;
        width:auto;
        background-color:var(--blue-75);
    }
</style>