'use strict';
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider.
			state('main.trainer', {
				url: 'trainer/:id',
				templateUrl : "app/trainer/profile/profile.html"
			});
	});