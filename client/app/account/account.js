
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.login', {
				url: '/login',
				templateUrl : "app/account/login/login.html"
			})
			/*.
			 state('main.signup', {
			 url: '/signup',
			 templateUrl : "app/account/signup/signup.html"
			 })
			 */
			.state('profile', {
				parent: 'main',
				controller : ['$state', 'Auth', '$location', function($state, Auth, $location) {
					if(!Auth.getCurrentUser() || !Auth.getCurrentUser().urlName) {
						console.log("There is no Auth.currentUser, instead it is:", Auth.getCurrentUser());
						$state.go('main.home');
					}
					else {
						console.log("Going to profile page with urlName:", Auth.getCurrentUser().urlName);
						$location.path('/' + Auth.getCurrentUser().urlName);
						//$state.go('profilePage', {urlName :  Auth.getCurrentUser().urlName });
						// for some reason $state.go didn't work when a user was logging in right away.
						// it worked when the user had travelled around the site and then tried to log in,
						// but if they tried to log in right away, it failed to transition.  This is WIERD.
					}
				}]
			})
			.state('profilePage', {
				parent: 'main',
				url: '^/:urlName',
				controller: "TrainerProfileController",
				templateUrl: "app/trainer/public/profile/profile.html"
			});
		;
	});