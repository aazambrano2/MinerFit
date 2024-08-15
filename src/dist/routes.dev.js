"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Landingpage = _interopRequireDefault(require("./Landingpage.svelte"));

var _Mainpage = _interopRequireDefault(require("./Mainpage.svelte"));

var _Login = _interopRequireDefault(require("./user-auth/Login.svelte"));

var _Register = _interopRequireDefault(require("./user-auth/Register.svelte"));

var _ThreadPage = _interopRequireDefault(require("./community-forum/ThreadPage.svelte"));

var _Navbar = _interopRequireDefault(require("./Navbar.svelte"));

var _WorkoutTracker = _interopRequireDefault(require("./week-schedule/WorkoutTracker.svelte"));

var _WeekSchedulePage = _interopRequireDefault(require("./week-schedule/WeekSchedulePage.svelte"));

var _CommunityForum = _interopRequireDefault(require("./community-forum/CommunityForum.svelte"));

var _CreateThread = _interopRequireDefault(require("./community-forum/CreateThread.svelte"));

var _ThreadContent = _interopRequireDefault(require("./community-forum/ThreadContent.svelte"));

var _WorkoutPlansPage = _interopRequireDefault(require("./user-workout-plans/WorkoutPlansPage.svelte"));

var _DiscoverPlansPage = _interopRequireDefault(require("./discover-workouts/DiscoverPlansPage.svelte"));

var _WorkOutBuilderPage = _interopRequireDefault(require("./workout-builder/WorkOutBuilderPage.svelte"));

var _NotFound = _interopRequireDefault(require("./NotFound.svelte"));

var _MainPageManager = _interopRequireDefault(require("./MainPageManager.svelte"));

var _NutritionPage = _interopRequireDefault(require("./nutrition/NutritionPage.svelte"));

var _Profile = _interopRequireDefault(require("./user-profile/Profile.svelte"));

var _ExerciseManagement = _interopRequireDefault(require("./manager/ExerciseManagement.svelte"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = {
  // Exact path
  '/': _Landingpage["default"],
  '/home': _Mainpage["default"],
  '/home-manager': _MainPageManager["default"],
  '/exercise-manager': _ExerciseManagement["default"],
  '/nutrition': _NutritionPage["default"],
  '/weekly-schedule/:id': _WeekSchedulePage["default"],
  '/community-forum': _CommunityForum["default"],
  '/sections/:id/threads/:threadNum': _ThreadContent["default"],
  '/threads/:id': _ThreadPage["default"],
  '/createThread/:id': _CreateThread["default"],
  '/workout-plans': _WorkoutPlansPage["default"],
  '/discover': _DiscoverPlansPage["default"],
  '/workout-builder': _WorkOutBuilderPage["default"],
  '/workout/:id/:week/:day': _WorkoutTracker["default"],
  '/login': _Login["default"],
  '/register': _Register["default"],
  '/profile': _Profile["default"],
  '/*': _NotFound["default"]
};
exports["default"] = _default;