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
			//.state('main.account', {
			//	url : '/account',
			//	templateUrl : 'app/trainer/account/trainer-account.partial.html',
			//	controller : 'AccountController',
			//	authenticate : true
			//})
			//.state('main.account.main', {
			//	url : '/main',
			//	views : {
			//		'@main.account' : {
			//			templateUrl : 'app/trainer/account/main/trainer-account-main.partial.html',
			//			controller : 'AccountMainController'
			//		}
			//	}
			//})

			.state('main.trainer.account', {
				url: '',
				abstract : true,
				views : {
					'@main' : {
						templateUrl : 'app/trainer/account/trainer-account.partial.html',
						controller : 'AccountController'
					}
				},
				authenticate : true
			})
			.state('main.trainer.account.edit-profile', {
				url: '/info',
				views : {
					'@main.trainer.account' : {
						controller : "TrainerInfoController",
						templateUrl : "app/trainer/public/info/trainer-info.html"
					}
				}
			})
			.state('main.trainer.account.certifications.list', {
				url: '/list',
				views : {
					'@main.trainer.account' : {
						controller : "TrainerCertificationsListController",
						templateUrl : "app/trainer/account/certifications/list/trainer-certifications-list.partial.html"
					}
				}
			}).
			state('main.trainer.account.certifications', {
				url: '/certifications',
				views : {
					'@main.trainer.account' : {
						controller : "TrainerCertificationsController",
						templateUrl : "app/trainer/account/certifications/trainer-certifications.partial.html"
					}
				}
			})
	});