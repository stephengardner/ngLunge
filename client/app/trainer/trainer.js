'use strict';
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {

		$stateProvider.
			state('main.trainer', {
				url : "/trainer",
				abstract : true
			}).

			state('main.trainer.register', {
				url: '/register',
				views : {
					'@main' : {
						templateUrl : "app/trainer/register/register.html"
					}
				}
			}).
			state('main.trainer.register.email', {
				url: '/email',
				views : {
					'registration@main.trainer.register' : {
						templateUrl : "app/trainer/register/steps/email/email.partial.html"
					}
				}
			})
			.state('main.trainer.register.validation', {
				url: '/validation',
				views : {
					'registration@main.trainer.register' : {
						templateUrl : "app/trainer/register/steps/validation/validation.partial.html"
					}
				}
			})
	});