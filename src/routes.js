import Landingpage from './Landingpage.svelte'
import Mainpage from './Mainpage.svelte'
import Login from './user-auth/Login.svelte'
import Register from './user-auth/Register.svelte'
import ThreadPage from './community-forum/ThreadPage.svelte'
import Navbar from './Navbar.svelte'
import WorkoutTracker from './week-schedule/WorkoutTracker.svelte'
import WeekSchedulePage from './week-schedule/WeekSchedulePage.svelte';
import CommunityForum from './community-forum/CommunityForum.svelte';
import CreateThread from './community-forum/CreateThread.svelte'
import ThreadContent from './community-forum/ThreadContent.svelte'
import WorkoutPlansPage from './user-workout-plans/WorkoutPlansPage.svelte';
import DiscoverPlansPage from './discover-workouts/DiscoverPlansPage.svelte';
import WorkOutBuilderPage from './workout-builder/WorkOutBuilderPage.svelte';
import NotFound from './NotFound.svelte';
import MainPageManager from './MainPageManager.svelte';
import NutritionPage from  './nutrition/NutritionPage.svelte';
import Profile from  './user-profile/Profile.svelte';
import ExerciseManagement from './manager/ExerciseManagement.svelte';
import RevenueManagement from './manager/RevenueManagement.svelte';
import AboutUs from './AboutUs.svelte'

export default {
    // Exact path
    '/': Landingpage,
    '/home': Mainpage,
    '/home-manager': MainPageManager,
    '/exercise-manager': ExerciseManagement,
    '/revenue-manager' : RevenueManagement,
    '/nutrition': NutritionPage,
    '/weekly-schedule/:id': WeekSchedulePage,
    '/community-forum': CommunityForum,
    '/sections/:id/threads/:threadNum': ThreadContent,
    '/threads/:id': ThreadPage,
    '/createThread/:id' : CreateThread,
    '/workout-plans': WorkoutPlansPage,
    '/discover': DiscoverPlansPage,
    '/workout-builder':WorkOutBuilderPage,
    '/workout/:id/:week/:day': WorkoutTracker,
    '/login': Login,
    '/register': Register,
    '/profile' : Profile,
    '/about-us': AboutUs,
    '/*' : NotFound,

}