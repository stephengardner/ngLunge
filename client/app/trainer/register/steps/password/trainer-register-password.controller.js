lungeApp.controller("TrainerRegisterPasswordController", function($location, Auth, $cookieStore, $state, Trainer, Registration, $stateParams, resolvedRegistrationResource, $scope, $http){
	console.log("RESOURCE: ", resolvedRegistrationResource);
	$scope.resolvedRegistrationResource = resolvedRegistrationResource;
	$scope.password = "";
	$scope.password2 = "";
	$scope.errors = {};
	$scope.password = {
		password1 : "",
		password2 : "",
	}

	// reset errors, called on keypress in form
	$scope.resetErrors = function(){
		$scope.errors = {};
	};

	// submit password, check errors, check validation errors returned by mongoose on pre-saving hooks
	$scope.submitPassword = function(form){
		form['password'].$setValidity('mongoose', true);
		if(!$scope.password.password1.length){
			$scope.errors.password = "Password cannot be blank.";
		}
		else if($scope.password.password1 == $scope.password.password2){
			if(form.$valid){
				$scope.submitted = true;
				$scope.sending = true;
				Auth.register(resolvedRegistrationResource, $scope.password.password1, $scope.password.password2).then(function(response){
					$scope.sending = false;
					$location.url("/" + response.urlName);//.go("main.profilePage", {urlName : response.urlName});
				}).catch(function(err) {
					err = err.data;
					$scope.sending = false;
					$scope.errors = {};

					// Update validity of form fields that match the mongoose errors
					angular.forEach(err.errors, function(error, field) {
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
					});
				});
			}
			else {
				$scope.errors.password = "Try a different password";
			}
		}
		else {
			//console.log("'" + $scope.password + "' != '" + $scope.password2 + "'");
			form['password'].$setValidity('mongoose', false);
			$scope.errors.password = "Passwords must match";
		}
	}
});