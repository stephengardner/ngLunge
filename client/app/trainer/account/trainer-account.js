'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
		$stateProvider.
			state('main.login', {
				url: '/login',
				templateUrl : "app/trainer/account/login/login.html"
			}).
			state('main.signup', {
				url: '/signup',
				templateUrl : "app/trainer/account/signup/signup.html"
			})
			.state('main.dashboard', {
				url: '/dashboard',
				templateUrl: 'app/account/user/dashboard/dashboard.html',
				controller: 'DashboardController',
				authenticate: true
			})
			.state('main.account', {
				url : '/account',
				templateUrl : 'app/trainer/account/trainer-account.partial.html',
				controller : 'AccountController',
				authenticate : true
			});
  });