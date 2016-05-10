lungeApp.controller("RegisterMainController", function($timeout, $rootScope, TrainerFactory, Sync, FormControl,
                                                         $state, AlertMessage, $location, $q, $document, $window,
                                                         ProfilePicture, Auth, $scope, $http,
                                                         $stateParams){
	$scope.user = {};
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.submit = function(registrationForm) {
		alert("Submit");
		$http({
			method : 'POST',
			url : '/api/users',
			data : $scope.user
		}).success(function(data){
			AlertMessage.success('created user');
		}).error(function(err){
			FormControl.parseValidationErrors(registrationForm, err);
		})
	}
});