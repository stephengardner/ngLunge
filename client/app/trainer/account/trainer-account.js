'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
		$stateProvider
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