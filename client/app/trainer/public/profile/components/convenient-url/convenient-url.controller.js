lungeApp.controller("ConvenientUrlController", function($scope, $q, Auth, $location){
	$scope.updateProfileUrlName = function($data) {
		console.log("----------------------- UPDATING PROFILE URL NAME! ------------------------ ");
		var deferred = $q.defer();
		var dataToSend = {urlName : $data, urlNameChanged : true};
		console.log("Sending:",dataToSend);
		Auth.updateProfile(dataToSend).then(function(response){
			$location.url($data);
			$location.replace();
			deferred.resolve(true);
		}).catch(function(err) {
			err = err.data;
			$scope.setTrainerError();
			$scope.sending = false;
			if($scope.errors)
				$scope.errors.urlName = null;
			// Update validity of form fields that match the mongoose errors
			angular.forEach(err.errors, function(error, field) {
				//form[field].$setValidity('mongoose', false);
				$scope.errors[field] = error.message;
			});
			deferred.resolve(""); // resolve a string so that x-editable plugin notices it as an error

		});
		return deferred.promise;
	};
})