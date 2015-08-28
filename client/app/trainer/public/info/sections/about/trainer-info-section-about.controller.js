myApp.controller("TrainerInfoSectionAboutController", function(TrainerFactory, AlertMessage, socket, FormControl, $popover, Sync, $scope, Auth) {
	$scope.editing = false;
	$scope.toggleEditing = function(form){
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form);//TrainerFactory.resetEditing('about');
		TrainerFactory.setEditingOf('about', $scope.editing);
	}

	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('about');
	};
	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		TrainerFactory.save('about').then(function(response){
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
	/*
	$scope.submit = function(form){
		$scope.busy = true;
		TrainerFactory.save().then(function(){
			$scope.busy = false;
			$scope.editing = false;
			AlertMessage.success("Profile updated successfully");
		}).catch(function(err){
			FormControl.parseValidationErrors(form, err);
			$scope.busy = false;
		})
	};
	*/
});