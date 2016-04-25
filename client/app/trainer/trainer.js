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
			.state('main.trainer.register.password', {
				url: '/password/:authenticationHash',
				views : {
					'registration@main.trainer.register' : {
						controller : "TrainerRegisterPasswordController",
						resolve : {
							resolvedTrainerResource : ['Registration', '$state', '$http', '$stateParams', '$q', function(Registration, $state, $http, $stateParams, $q){
								var deferred = $q.defer();
								$http.get('api/registrations/getTrainerByAuthenticationHash/'
								+  $stateParams.authenticationHash)
									.success(function(response) {
										deferred.resolve(response);
									}).error(function(err){
										deferred.resolve(err);
									})
								return deferred.promise;
							}]
						},
						templateUrl : "app/trainer/register/steps/password/password.partial.html"
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
			//.state('main.trainer.public-profile', {
			//	url: '/:id',
			//	views : {
			//		'@main' : {
			//			controller : "TrainerProfileController",
			//			templateUrl : "app/trainer/public/profile/profile.html"
			//		}
			//	}
			//});
	});