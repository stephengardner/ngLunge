lungeApp.controller("PasswordSetController", function( $location,
                                                      Auth,
                                                      $cookieStore,
                                                      $state,
                                                      Trainer,
                                                      Registration,
                                                      $stateParams,
                                                      $scope,
                                                      $http,
                                                      FormControl,
                                                      AlertMessage
){
	$scope.password = "";
	$scope.password2 = "";
	$scope.password = {
		password1 : "",
		password2 : ""
	};

	console.log("State params:", $stateParams);
	$scope.verified = $stateParams.verified;

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
		$scope.cgBusy = Auth.submitPassword(
			$stateParams.authenticationHash,
			$scope.password.password1,
			$scope.password.password2)
			.then(function(response){
				$scope.sending = false;
				alert("DONE");
				Auth.setCurrentUser(response);
				AlertMessage.success('Your profile has been created!');
				$state.go('profile');
			}).catch(function(err) {
				alert("err");
				if(err.data && err.data.errors && err.data.errors.trainer) {
					AlertMessage.error(err.data.errors.trainer.message);
				}
				FormControl.parseValidationErrors(form, err);
			});
	}
});