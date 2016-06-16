myApp.controller('PasswordResetConfirmController', function($state,
                                                            AlertMessage,
                                                            $scope,
                                                            $http,
                                                            FormControl,
                                                            $stateParams,
                                                            Auth
){
	console.log("StateParams: ", $stateParams);
	$scope.type = $stateParams.type;
	$scope.passwords = {};

	$scope.submit = function(form) {
		console.log("Sending reset link for type:", $scope.type);
		$scope.cgBusy = Auth.passwordResetConfirm('trainer',
				$stateParams.authenticationHash,
				$scope.passwords.password1,
				$scope.passwords.password2)
				.then(function(response){
					$scope.complete = true;
					AlertMessage.success('Your password has been reset successfully');
					$state.go('profile');
				}, function(err){
					console.log("err:", err);
					FormControl.parseValidationErrors(form, err);
				});
	}
});