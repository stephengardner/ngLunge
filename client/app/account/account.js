'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
		$stateProvider.
			state('main.login', {
				url: '/login',
				templateUrl : "app/account/login/login.html"
			}).
			state('main.signup', {
				url: '/signup',
				templateUrl : "app/account/signup/signup.html"
			})
			.state('main.dashboard', {
				url: '/dashboard',
				templateUrl: 'app/account/dashboard/dashboard.html',
				controller: 'DashboardController',
				authenticate: true
			});
  });