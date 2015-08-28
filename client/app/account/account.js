
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
			.state('profilePage', {
				parent: 'main',
				url: '^/:urlName',
				controller: "TrainerProfileController",
				templateUrl: "app/trainer/public/profile/profile.html"
			});
	});