lungeApp.controller("SignupController", function($timeout, $rootScope, TrainerFactory, Sync, FormControl,
                                                       $state, AlertMessage, $location, $q, $document, $window,
                                                       ProfilePicture, Auth, $scope, $http,
                                                       $stateParams,
                                                       $auth,
                                                       $mdToast
){
	$scope.type = $stateParams.tab;

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

	$scope.user = {
		type : $scope.type,
		email : ''
	};

	$scope.submit = function(registrationForm) {
		console.log("passing in:", $scope.user);
		$http({
			method : 'POST',
			url : '/api/registrations',
			data : $scope.user
		}).success(function(data){
			AlertMessage.success('Your verification email has been sent!');
			$scope.success = true;
			$scope.trainer = data.trainer;
		}).error(function(err){
			FormControl.parseValidationErrors(registrationForm, err);
		})
	};

	$scope.resendEmail = function(resendEmailForm) {
		$http({
			method : 'POST',
			url : '/api/registrations/resend',
			data : {
				trainer : $scope.trainer
			}
		}).success(function(data) {
			$scope.resent = true;
			AlertMessage.success('Email has been resent!');
		}).error(function(err) {
			FormControl.parseValidationErrors(resendEmailForm, err);
			AlertMessage.error('Please wait a moment, then try again');
		})
	};

	$scope.authenticate = function(provider) {
		var type = $scope.type;
		$auth.authenticate(provider, { type : type + '-register' }).then(function(response){
			$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
			Auth.setCurrentUser(response.data[type]);
			Auth.setCurrentType(response.data[type].kind);
			$state.go('profile');
		}).catch(function(err){
			$mdToast.show($mdToast.simple().position('bottom right').textContent(err.data.message));
			console.log("err", err);
		});
	};

});