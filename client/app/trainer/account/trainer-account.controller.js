lungeApp.controller("AccountController", function(TrainerFactory, Sync, socket, $timeout, Geocoder, AlertMessage, $q, Auth, $scope){
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


	$scope.changeEmail = function(form) {
		$scope.sending = true;
		TrainerFactory.save().then(function(response){
			$scope.sending = false;
			AlertMessage.success("Email updated");
			$scope.emailUpdating = false;
		}).catch(function(err){
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
			});
		})
	}
	Auth.isLoggedInAsync(function(){
		if(Auth.getCurrentType() == "trainer") {
			$scope.trainerFactory = TrainerFactory;
			TrainerFactory.init(Auth.getCurrentUser(), {sync:true});
		}
		else {
			$scope.user = Auth.getCurrentUser();
		}
	});
	$scope.removeMongooseError = function(form, inputName) {
		if(!form[inputName] || !form[inputName].$error) {
			return false;
		}
		form[inputName].$error['invisible'] = false;
		form[inputName].$setValidity('mongoose', true);
		form[inputName].$setValidity('invisible', true);
	};
	$scope.isMe = function(){
		return TrainerFactory.isMe();
	}
});