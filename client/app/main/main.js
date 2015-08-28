'use strict';
lungeApp.controller("MainController", function($scope, $location, Auth) {
	$scope.logout = function() {
		Auth.logout();
		$location.path('/login');
	};
});
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main', {
				abstract : true,
				url: '',
				templateUrl :  'app/main/main.html',
				controller: 'MainCtrl'
			})
			.state('main.home', {
				url: '^/',
				templateUrl : "app/main/views/homepage/homepage.html"
			})
	});