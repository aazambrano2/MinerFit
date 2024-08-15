<script>
	let firstName = "Testing";
	let lastName = "User";
	let username = "testingUser123";
	let email = "exampleEmail@utep.edu";
	let password = "********";
	let userType = "customer";
	let text = "Upgrade to Premium"
	let url = "pathForPremiumPlan"
  	function handleClick() {
    	window.location.href = url;
  	}
	let url2 = "pathToEditGoals"
	let url3 = "pathToEditAccount"
	let url4 = "pathToDeleteAccount"

</script>

<main>
	<h1>Hello {firstName} {lastName}!</h1>
	<h2> User Information </h2>
	<p>Username: {username}</p>
	<p>Email: {email}</p>
	<p>Password: {password}</p>
	<p>User Type: {userType}</p>
	<br><br>
	<h2> Settings</h2>
	<a href={url2}>Edit Goals</a>
	<br><br>
	<a href={url3}>Edit Account</a>
	<br><br>
	<a href={url4}>Delete Account </a>
	<br><br>
	<button on:click={handleClick}>{text}</button>

</main>

<style>
	main {
		text-align: none;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #000000;
		text-transform: uppercase;
		font-size: 3em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	button {
    padding: 10px 20px;
    background-color: #000000;
    color: red;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  	}

  	button:hover {
    background-color: #0056b3;
  	}
</style>
