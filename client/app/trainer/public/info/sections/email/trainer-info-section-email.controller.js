myApp.controller("TrainerInfoSectionEmailController", function(FormControl, AlertMessage, TrainerFactory, $scope){
	$scope.editing = false;
	$scope.trainerFactory = TrainerFactory;

	$scope.ajax = {
		busy : false
	};
	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('email');
	};
	$scope.errors = FormControl.errors;
	$scope.changeEmail = function(form) {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('email').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("Email changed to: " + $scope.trainerFactory.trainer.email);
		}).catch(function(err){
			$scope.ajax.busy = false;
			FormControl.parseValidationErrors(form, err);
		})
	}
})