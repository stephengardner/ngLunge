'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
		$stateProvider.
			state('main.login', {
				url: 'login',
				templateUrl : "app/account/login/login.html"
			}).
			state('main.signup', {
				url: 'signup',
				templateUrl : "app/account/signup/signup.html"
			})
			.state('main.dashboard', {
				url: 'dashboard',
				templateUrl: 'app/account/dashboard/dashboard.html',
				controller: 'DashboardController',
				authenticate: true
			});;
		/*
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
      */
  });