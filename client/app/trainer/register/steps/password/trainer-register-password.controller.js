lungeApp.controller("TrainerRegisterPasswordController", function($location, Auth,
                                                                  $cookieStore,
                                                                  $state,
                                                                  Trainer,
                                                                  Registration,
                                                                  $stateParams,
                                                                  resolvedTrainerResource,
                                                                  $scope,
                                                                  $http,
                                                                  FormControl,
                                                                  AlertMessage
){
	$scope.resolvedTrainerResource = resolvedTrainerResource;
	$scope.password = "";
	$scope.password2 = "";
	$scope.errors = {};
	$scope.password = {
		password1 : "",
		password2 : ""
	};

	// reset errors, called on keypress in form
	$scope.resetErrors = function(){
		$scope.errors = {};
	};

	$scope.removePasswordErrors = function(form) {
		form.password.$setValidity('mongoose', true);
		form.password2.$setValidity('mongoose', true);
	};

	// submit password, check errors, check validation errors returned by mongoose on pre-saving hooks
	$scope.submitPassword = function(form){
		if(form.$invalid) {
			return false;
		}
		$scope.cgBusy = Auth.register(resolvedTrainerResource, $scope.password.password1, $scope.password.password2)
			.then(function(response){
			$scope.sending = false;
			Auth.setCurrentUser(response);
			AlertMessage.success('Your profile has been created!');
			$state.go('profile');
		}).catch(function(err) {
			FormControl.parseValidationErrors(form, err);
		});
	}
});