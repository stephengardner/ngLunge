'use strict';

angular.module('myApp')
	.config(function ($stateProvider) {
		$stateProvider
		// abstract certifications route.  actually helps when we check where the state is during menu when we
		// add classes. just keep it like this
			.state('main.certifications', {
				url: '/certifications',
				templateUrl : 'app/certifications/certifications.partial.html'
				// abstract : true
			})
			.state('main.certifications.list', {
				url: '/list',
				// views : {
				// 	'@main.certifications' : {
				// 		controller : "CertificationsListController",
				// 		templateUrl : "app/certifications/list/certifications-list.partial.html"
				// 	}
				// }

				controller : "ListCertificationsController",
				templateUrl : "app/certifications/list/list-certifications.partial.html"
			})
			.state('main.certifications.faq', {
				url: '/faq',
				views : {
					'@main' : {
						templateUrl : "app/certifications/faq/certifications-faq.partial.html"
					}
				}
			})
	});