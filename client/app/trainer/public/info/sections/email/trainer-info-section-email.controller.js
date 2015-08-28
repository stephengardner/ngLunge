myApp.controller("TrainerInfoSectionEmailController", function(FormControl, AlertMessage, TrainerFactory, $scope){
	$scope.editing = false;
	$scope.toggleEditing = function(form) {
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form); // reset the user input if they cancel the request
		TrainerFactory.setEditingOf('email', $scope.editing);
	}
	$scope.ajax = {
		busy : false
	};
	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('email');
	}
	$scope.errors = FormControl.errors;
	$scope.changeEmail = function(form) {
		$scope.ajax.busy = true;
		TrainerFactory.save('email').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("Email updated");
			$scope.toggleEditing();// = false;
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
})