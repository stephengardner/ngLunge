'use strict';

angular.module('ngLungeFullStack2App')
	.controller('LoginController', function ($scope,
	                                         Auth,
	                                         $location,
	                                         $window,
	                                         $state,
	                                         $timeout,
	                                         $auth,
	                                         $http,
	                                         AlertMessage,
	                                         FormControl,
	                                         $mdToast) {

		$scope.user = {};
		$scope.errors = {};
		$scope.tabs = {
			User : {

			},
			Trainer : {

			}
		}
		$scope.login = function(form) {
			$scope.submitted = true;
			console.log("FORM:",form);
			if(form.$valid) {
				$http({
					method : "POST",
					url : 'auth/local',
					data : {
						type : 'trainer',
						email : $scope.user.email,
						password : $scope.user.password
					}
				}).success(function(response){
					AlertMessage.success('Successfully logged in!');
					console.log("Response:", response);
					Auth.setCurrentUser(response.trainer);
					$state.go('profile');
				}).error(function(err){
					console.log("Err:", err);
					FormControl.parseValidationErrors(form, err);
				})
				// Auth.login({
				// 		email: $scope.user.email,
				// 		password: $scope.user.password,
				// 		type : "trainer"
				// 	})
				// 	.then( function() {
				// 		// Logged in, redirect to home
				// 		console.log("redirecting to profile state");
				// 		$state.go('profile');
				//
				// 		return false;
				// 	})
				// 	.catch( function(err) {
				// 		$scope.errors.other = err.message;
				// 	});
			}
		};


		$scope.trainerLoginOAuth = function(provider) {
			$auth.authenticate(provider, {type : 'trainer-login'}).then(function(response){
				$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
				Auth.setCurrentUser(response.data.trainer);
				$state.go('profile');
			}).catch(function(err){
				$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
				console.log("err", err);
			});
		};

	});
