'use strict';
lungeApp.controller("MainController", function(FullMetalSocket, $scope, $location, Auth) {

	// testing the on connection method for a socket.  This will connect the socket indefinitely
	// FullMetalSocket.testConnect();

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
				controller: 'MainCtrl as vm'
			})
			.state('main.home', {
				url: '^/',
				templateUrl : "app/main/views/homepage/homepage.html"
			})
	});