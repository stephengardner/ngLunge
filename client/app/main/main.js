'use strict';

angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main', {
				abstract : true,
				url: '/',
				templateUrl :  'app/main/main.html',
				controller: 'MainCtrl'
			})
			.state('main.home', {
				url: '^/',
				templateUrl : "app/main/views/homepage/homepage.html"
			});
		;
	});