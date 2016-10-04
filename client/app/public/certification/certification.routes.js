angular.module('myApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.certification', {
				url: '^/',
				templateUrl : "app/public/certification/public-certification.html",
				abstract : true
			})
			/*.
			 state('main.signup', {
			 url: '/signup',
			 templateUrl : "app/account/signup/signup.html"
			 })
			 */
			.state('main.certification.organization', {
				url: 'organization/:slug',
				controller: "PublicCertificationOrganizationController",
				templateUrl: "app/public/certification/organization/public-certification-organization.partial.html"
			});
	});