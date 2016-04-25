myApp.controller("TrainerInfoSectionRateController", function(FormControl, AlertMessage, TrainerFactory, $scope){
	$scope.editing = false;
	$scope.toggleEditing = function(form){
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form);//TrainerFactory.resetEditing('about');
		TrainerFactory.setEditingOf('rate', $scope.editing);
	}

	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('rate');
	};
	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		TrainerFactory.save('rate').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'Cost' section updated");
			$scope.toggleEditing();// = false;
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
});
