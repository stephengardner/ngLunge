myApp.controller("TrainerInfoSectionRateController", function(FormControl, AlertMessage, TrainerFactory, $scope){
	$scope.editing = false;

	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('rate');
	};
	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		TrainerFactory.save('rate').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'Cost' section updated");
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
});
