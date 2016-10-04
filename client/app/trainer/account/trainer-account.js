'use strict';

angular.module('myApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.dashboard', {
				url: '/dashboard',
				templateUrl: 'app/account/user/dashboard/dashboard.html',
				controller: 'DashboardController',
				authenticate: true
			})
			.state('main.trainer.account', {
				url: '',
				abstract : true,
				views : {
					'@main' : {
						templateUrl : 'app/trainer/account/trainer-account.partial.html',
						controller : 'TrainerAccountController'
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
			// abstract certifications route.  actually helps when we check where the state is during menu when we
			// add classes. just keep it like this
			// .state('main.trainer.account.certifications', {
			// 	url: '/certifications',
			// 	abstract : true
			// })
			.state('main.trainer.account.certifications', {
				url: '/my-certifications',
				views : {
					'@main.trainer.account' : {
						controller : "TrainerCertificationsController",
						templateUrl : "app/trainer/account/certifications/trainer-certifications.partial.html"
					}
				}
			});
			// .state('main.trainer.account.certifications.list', {
			// 	url: '/list',
			// 	views : {
			// 		'@main.trainer.account' : {
			// 			controller : "TrainerCertificationsListController",
			// 			templateUrl : "app/trainer/account/certifications/list/trainer-certifications-list.partial.html"
			// 		}
			// 	}
			// })
			// .state('main.trainer.account.certifications.faq', {
			// 	url: '/faq',
			// 	views : {
			// 		'@main.trainer.account' : {
			// 			templateUrl : "app/trainer/account/certifications/faq/trainer-certifications-faq.partial.html"
			// 		}
			// 	}
			// })
	});