myApp.controller("RatesController", function(FormControl, AlertMessage, TrainerFactory, $scope){
	$scope.editing = false;
	$scope.trainerFactory = TrainerFactory;

	// $scope.toggleEditing = function(form){
	// 	$scope.editing = !$scope.editing;
	// 	if(!$scope.editing) $scope.reset(form);//TrainerFactory.resetEditing('about');
	// 	TrainerFactory.setEditingOf('rate', $scope.editing);
	// }

	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('rate');
	};
	$scope.submit = function(form) {
		$scope.cgBusy = TrainerFactory.save('rate').then(function(response){
			AlertMessage.success("'Cost' section updated");
			$scope.toggleEditing();
		}).catch(function(err){
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	}
	$scope.removeMongooseError = FormControl.removeMongooseError;
});
