myApp.controller("TrainerInfoSectionAboutController", function(TrainerFactory, AlertMessage, /*socket,*/
                                                               FormControl, $popover, Sync, $scope, Auth) {
	$scope.editing = false;
	$scope.trainerFactory = TrainerFactory;
	$scope.ajax = {};

	$scope.toggleEditing = function(form){
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form);//TrainerFactory.resetEditing('about');
		TrainerFactory.setEditingOf('about', $scope.editing);
	}

	$scope.textareaRows = 5;
	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('about');
	};
	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('about').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'About' section updated");
			$scope.toggleEditing();// = false;
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
});