angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.certification', {
				url: '/certification',
				templateUrl : "app/public/certification/certification.html",
				abstract : true
			})
			/*.
			 state('main.signup', {
			 url: '/signup',
			 templateUrl : "app/account/signup/signup.html"
			 })
			 */
			.state('main.certification.individual', {
				url: '^/:name',
				controller: "PublicCertificationIndividualController",
				templateUrl: "app/public/certification/individual/certification-individual.partial.html"
			});
	});