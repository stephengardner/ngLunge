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
			state('main.trainer.certifications', {
				url: '/certifications',
				views : {
					'@main' : {
						controller : "CertificationsController",
						templateUrl : "app/trainer/account/certifications/certifications.partial.html"
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
			}).
			state('main.trainer.register.password', {
				url: '/password/:authenticationHash',
				views : {
					'registration@main.trainer.register' : {
						controller : "TrainerRegisterPasswordController",
						resolve : {
							resolvedRegistrationResource : ['Registration', '$state', '$http', '$stateParams', '$q', function(Registration, $state, $http, $stateParams, $q){
								var deferred = $q.defer();
								Registration.get({ id : $stateParams.authenticationHash}, {}, function(res){
									console.log("RES:" , res);
									deferred.resolve(res);
								}, function(err){
									deferred.resolve(err);
								});
								return deferred.promise;
							}]
						},
						templateUrl : "app/trainer/register/steps/password/password.partial.html"
					}
				}
			}).
			state('main.trainer.register.validation', {
				url: '/validation',
				views : {
					'registration@main.trainer.register' : {
						templateUrl : "app/trainer/register/steps/validation/validation.partial.html"
					}
				}
			}).
			state('main.trainer.public-profile', {
				url: '/:id',
				views : {
					'@main' : {
						templateUrl : "app/trainer/public/profile/profile.html"
					}
				}
			});
	});