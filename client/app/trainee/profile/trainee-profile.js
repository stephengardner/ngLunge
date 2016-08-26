'use strict';

angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
		// Everyones profile page
		.state('main.trainee.profilePage', {
			url: '/:urlName',
			controller: "TraineeProfileController",
			templateUrl: "app/trainee/profile/trainee-profile.partial.html"
		});
	});