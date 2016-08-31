myApp.controller('TraineeMapAddLocationDialogController', function($timeout,
                                                                   Geocoder,
                                                                   TrainerFactory,
                                                                   $mdDialog,
                                                                   $scope,
                                                                   trainerMapLocations,
                                                                   FormControl,
                                                                   AlertMessage,
                                                                   $q)
{
	$scope.trainerFactory = TrainerFactory;

	$scope.addingLocation = !$scope.addingLocation;

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
		$scope.userFactory.resetEditing('location');// = {};
	};
	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};

	// Remove the location details from the scope / form
	$scope.reset = function(form) {
		form.$setPristine();
		$scope.location = {};
		$scope.$$childTail.searchText = ''; // Hacky way to clear md-autocomplete
		$scope.userFactory.resetEditing('location');// = {};
	};

	$scope.done = function() {
		$mdDialog.hide();
	};

	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.title = {
		text : ''
	};

	// when finished with the "Add Location" form or "Add another location" form
	$scope.submit = function(form) {
		// form.title.$error.test = 'a test';
		// $timeout(function(){
		// 	alert();
		// 	form.title.$error.test = false;
		// }, 5000)
		return $q(function(resolve, reject) {
			// if(form.$invalid) {
			// 	AlertMessage.error('Please address the erros listed before continuing');
			// 	return reject(new Error('Please address the errors listed before continuing'));
			// }
			if(!$scope.userFactory.userEditing.location || !$scope.userFactory.userEditing.location.city) {
				FormControl.parseSingleClientSideError('autocomplete', 'Please select a location');
				return reject(false);
			}
			$scope.cgBusy = $scope.userFactory.save('location')
				.then(function(response){
					$scope.addingLocation = false;
					$scope.reset(form);
					$scope.done();
					AlertMessage.success("Location updated");
				}).catch(function(err){
					if(err.message) {
						AlertMessage.error(err.message);
					}
					console.log("AFTER ALL, ", $scope.location);
					FormControl.parseValidationErrors(form, err);
					console.log("parsing errors:", err, " for form : ", form);
					console.log("FormControl errors:", FormControl.errors);
					if(FormControl.errors.location) {
						AlertMessage.error(FormControl.errors.location);
					}
					return reject(false);
				});
			// $scope.location.title = $scope.title.text;
		});
	};
})

// Do Not Delete - For Manual Locations
// Since the google locations don't have city/state - BUT it can still get city/state errors, set them
// as the location error
// if(!$scope.manualLocation.isActive()) {
// 	if(FormControl.errors.state) {
// 		FormControl.setError(form, 'location', FormControl.errors.state);
// 	}
// 	else if (FormControl.errors.city) {
// 		FormControl.setError(form, 'location', FormControl.errors.city);
// 	}
// }