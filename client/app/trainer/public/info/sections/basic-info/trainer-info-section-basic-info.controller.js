myApp.controller("TrainerInfoSectionBasicInfoController", function(AlertMessage, TrainerFactory, FormControl, $scope){
	$scope.editing = false;
	$scope.toggleEditing = function(form) {
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form);
		TrainerFactory.setEditingOf('basicInfo', $scope.editing);
	};
	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('basicInfo');
	}
	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		TrainerFactory.save('basicInfo').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'Basic Info' section updated");
			$scope.toggleEditing();// = false;
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
});