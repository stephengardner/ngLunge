lungeApp.controller("AccountController", function(Geocoder, AlertMessage, $q, Auth, $scope){
	$scope.emailToggle = function(){
		$scope.emailUpdating = !$scope.emailUpdating;
	};
	$scope.hide = function(){
		$scope.emailUpdating = false;
	}
	$scope.ajax = {};
	$scope.isAjax = function(){
		return $scope.sending;
	};
	$scope.getType = function(){
		return Auth.getCurrentType();
	};
	$scope.user = Auth.getCurrentUser();
	$scope.changeEmail = function(form) {
		var deferred = $q.defer();
		$scope.sending = true;
		Auth.changeEmail(form.email.$modelValue).then(function (response) {
			$scope.user = response;
			$scope.hide();
			deferred.resolve(true);
			$scope.sending = false;
			AlertMessage.success("Email updated");
		}).catch(function (err) {
			$scope.ajax.email = false;
			console.log("ERRRRRRRRRRR", err);
			form.$setPristine();
			err = err.data;
			$scope.sending = false;
			$scope.errors = {};
			// Update validity of form fields that match the mongoose errors
			angular.forEach(err.errors, function (error, field) {
				console.log("Setting form[" + field + "].$dity = false");
				form[field].$dirty = false;//('mongoose', false);
				console.log(form[field]);
				form[field].$setValidity('mongoose', false);
				$scope.errors[field] = error.message;
				deferred.reject();
			});
			return deferred.promise;
		});
	}
	Auth.isLoggedInAsync(function(){
		$scope.user = Auth.getCurrentUser();
	});
	$scope.removeMongooseError = function(form, inputName) {
		console.log("attempting...", form[inputName]);
		//$scope.submitted = false;
		if(!form[inputName] || !form[inputName].$error) {
			return false;
		}
		console.log("SETTING INVISIBLE TRUE FOR : ", inputName);
		form[inputName].$error['invisible'] = false;
		form[inputName].$setValidity('mongoose', true);
		form[inputName].$setValidity('invisible', true);
	};
});