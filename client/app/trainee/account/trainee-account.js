'use strict';
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {

		$stateProvider.
		state('main.trainee.account', {
			abstract : true,
			url: '/account',
			views : {
				'@main.trainee' : {
					controller : 'TraineeAccountController',
					templateUrl : "app/trainee/account/trainee-account.partial.html"
				}
			}
		}).
		state('main.trainee.account.info', {
			url: '',
			views : {
				'@main.trainee.account' : {
					templateUrl : "app/trainee/account/info/trainee-account-info.partial.html"
				}
			}
		})
	});