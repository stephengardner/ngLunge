myApp.controller('PasswordResetSubmitController', function($scope, $http, FormControl, $stateParams){
	console.log("StateParams: ", $stateParams);
	$scope.type = $stateParams.type;
	$scope.user = {};

	$scope.submit = function(form) {
		console.log("Sending reset link for type:", $scope.type);
		$scope.cgBusy = $http({
			url : 'api/trainers/password-reset/submit',
			method : 'POST',
			data : $scope.user
		}).success(function(response){
			$scope.emailSent = true;
			console.log("success:", response);
		}).catch(function(err) {
			FormControl.parseValidationErrors(form, err);
			console.log("error:", err);
		})
	}
});