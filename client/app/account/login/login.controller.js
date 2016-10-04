'use strict';

angular.module('myApp')
	.controller('LoginController', function ($scope,
	                                         Auth,
	                                         $location,
	                                         $window,
	                                         $state,
	                                         $timeout,
	                                         $auth,
	                                         $http,
	                                         AlertMessage,
	                                         $cookieStore,
	                                         FormControl,
	                                         $mdDialog,
	                                         $stateParams,
	                                         $mdToast) {
		$scope.type = $stateParams.tab;

		$scope.cancel = $mdDialog.hide;
		$scope.getSelectedTab = function() {
			if($scope.type == 'trainer') {
				$scope.selectedIndex = 1;
			}
			else {
				$scope.selectedIndex = 0;
			}
		};

		$scope.selectTab = function(tab) {
			$scope.type = tab;
		};

		$scope.getSelectedTab();

		$scope.user = {};
		$scope.errors = {};
		$scope.tabs = {
			User : {

			},
			Trainer : {

			}
		};

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
				}).success(function(response) {
					AlertMessage.success('Successfully logged in!');
					console.log("Response:", response);
					Auth.setCurrentUser(response.trainer);
					$state.go('profile');
				}).error(function(err){
					console.log("Err:", err);
					FormControl.parseValidationErrors(form, err);
				});
			}
		};


		$scope.loginOAuth = function(provider) {
			var type = $scope.type;
			$auth.authenticate(provider, {type : type + '-login'}).then(function(response){
				$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
				Auth.setCurrentUser(response.data[type]);
				$state.go('profile');
			}).catch(function(err){
				if(err.data) {
					$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
				}
				console.log("err", err);
			});
		};
		$scope.trainerLoginOAuth = function(provider) {
			$auth.authenticate(provider, {type : 'trainer-login'}).then(function(response){
				$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
				Auth.setCurrentUser(response.data.trainer);
				$state.go('profile');
			}).catch(function(err){
				if(err.data) {
					$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
				}
				console.log("err", err);
			});
		};

	});
