lungeApp.controller("TrainerRegisterEmailController", function($state, Auth, Registration, $scope, $http){
	$scope.user = {};
	$scope.message = false;
	$scope.errors = {};
	$scope.resetErrors = function(){
		$scope.errors = {};
	}
	$scope.sendEmail = function(form){
		if(form.$valid) {
			$scope.submitted = true;
			$scope.sending = true;
			Auth.createRegistration({email : $scope.user.email}).then(function(){
				$scope.sending = false;
				$state.go("main.trainer.register.validation");
			}).catch( function(err) {
				err = err.data;
				$scope.sending = false;
				$scope.errors = {};

				// Update validity of form fields that match the mongoose errors
				angular.forEach(err.errors, function(error, field) {
					console.log("Error is: ", error);
					console.log("Field is: ", field);
					form[field].$setValidity(field, false);
					$scope.errors[field] = error.message;
					console.log("form.email.$error", form.email.$error);
				});
			});
		}
		else {
			$scope.submitted = true;
			form.email.$setValidity('email', false);
			$scope.errors.email = "Please use a real, valid email address.";
		}
	};
});