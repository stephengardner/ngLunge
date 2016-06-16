
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.login', {
				url: '/login',
				templateUrl : "app/account/login/login.html"
			})
			.
			state('main.signup', {
				url: '/signup',
				controller : "SignupController",
				templateUrl : "app/account/signup/signup.html"
			})
			.state('profile', {
				parent: 'main',
				controller : ['$state', 'Auth', '$location', function($state, Auth, $location) {
					console.log("Attempting to GO to state.profile from account.js");
					if(!Auth.getCurrentUser() || !Auth.getCurrentUser().urlName) {
						console.log("There is no Auth.currentUser, instead it is:", Auth.getCurrentUser());
						$state.go('main.home');
					}
					else {
						console.log("Going to profile page with urlName:", Auth.getCurrentUser().urlName);
						$location.path('/' + Auth.getCurrentUser().urlName);
						//$state.go('profilePage', {urlName :  Auth.getCurrentUser().urlName });
						// for some reason $state.go didn't work when a user was logging in right away.
						// it worked when the user had travelled around the site and then tried to log in,
						// but if they tried to log in right away, it failed to transition.  This is WIERD.
						// Maybe due to needing to async login.
					}
				}]
			})

			// Reset Password Abstract Route
			.state('main.password-reset', {
				abstract : true,
				url : '/password-reset'
			})

			// Reset Password Submit Email to send link to
			.state('main.password-reset.submit', {
				url : '/:type/submit',
				views : {
					'@main' : {
						controller : "PasswordResetSubmitController",
						templateUrl : "app/account/password-reset/submit/password-reset-submit.partial.html"
					}
				}
			})

			// Reset Password Submit Email to send link to
			.state('main.password-reset.confirm', {
				url : '/:type/confirm/:authenticationHash',
				views : {
					'@main' : {
						controller : "PasswordResetConfirmController",
						resolve : {
							isAuthenticated : ['AlertMessage', 'Registration', '$state', '$http', '$stateParams', '$q',
								function(AlertMessage, Registration, $state, $http, $stateParams, $q){
									var deferred = $q.defer();
									$http.get('api/trainers/password-reset/authenticate/'
											+  $stateParams.authenticationHash)
										.success(function(response) {
											deferred.resolve(response);
										}).error(function(err){
										if(err.error && err.error == 'expired') {
											AlertMessage.error('This link has expired, please try the password reset' +
												' process again');
										}
										if(err.error && err.error == 'used') {
											AlertMessage.error('This link has already been used to reset your password');
										}
										else {
											AlertMessage.error('Woops, the link you clicked is no longer active,' +
												' please try submitting your reset request again');
										}
										console.log("Error, going home:", err);
										$state.go('main.home');
										deferred.resolve(err);
									});
									return deferred.promise;
								}]
						},
						templateUrl : "app/account/password-reset/confirm/password-reset-confirm.partial.html"
					}
				}
			})

			// Verify Email, dont have an abstract route, there's only one path here, though it has vars
			.state('main.verify-email', {
				url : '/verify-email/:type/:authenticationHash',
				// controller : "EmailVerifyController",
				resolve : {
					resolvedTrainerResource : ['AlertMessage', 'Registration', '$state', '$http', '$stateParams', '$q',
						function(AlertMessage, Registration, $state, $http, $stateParams, $q){
							var deferred = $q.defer();
							$http.get('api/registrations/' + $stateParams.authenticationHash + '/authenticate')
								.success(function(response) {
									if(response && response.registration && response.registration.password_set) {
										AlertMessage.success('Thank you! Your email address has been verified');
									}
									else if(response.registration.password_set == false) {
										$state.go('main.set-password', {
											type : $stateParams.type,
											authenticationHash : $stateParams.authenticationHash,
											verified : true
										});
									}
									else {
										AlertMessage.error('Woops, something went wrong!');
									}
									console.log("Response:", response);
									deferred.resolve(response);
								}).error(function(err){
								AlertMessage.error('Woops, the link you clicked was invalid, try resubmitting your' +
									' verification request');
								console.log("Error, going home:", err);
								$state.go('main.home');
								deferred.resolve(err);
							});
							return deferred.promise;
						}]
				}
			})

			// Set Password route, also don't make it an abstract route, there's only one path, though it has vars
			.state('main.set-password', {
				url : '/set-password/:type/:authenticationHash',
				params : {
					// this can be set by a controller if we verify it beforehand, such as in verify-email
					// or it will be set after a promise call to get trainer by registration authentication hash
					verified : false
				},
				views : {
					'@main' : {
						controller : 'PasswordSetController',
						resolve : {
							isAuthenticated : ['AlertMessage', 'Registration', '$state', '$http', '$stateParams', '$q',
								function(AlertMessage, Registration, $state, $http, $stateParams, $q){
									var deferred = $q.defer();
									if($stateParams.emailVerified) {
										return deferred.resolve();
									}
									$http({
										url : 'api/registrations/' + $stateParams.authenticationHash + "/trainer"
									}).success(function(response){
										$stateParams.verified = true;
										deferred.resolve();
									}).error(function(err){
										if(err && err.error == 'password_set') {
											AlertMessage.error('Your password has already been set, please log in');
										}
										else {
											AlertMessage.error('That link is no longer valid.  Please try again' +
												' using the link in your email, or request a new link');
										}
										$state.go('main.home');
									});
									return deferred.promise;
								}]
						},
						templateUrl : "app/account/password-set/password-set.partial.html"
					}
				}
			})

			// Everyones profile page
			.state('profilePage', {
				parent: 'main',
				url: '^/:urlName',
				controller: "TrainerProfileController",
				templateUrl: "app/trainer/public/profile/profile.html"
			});
		;
	});