myApp.controller('TrainerMapAddLocationDialogController', function($timeout,
                                                                   Geocoder,
                                                                   $mdDialog,
                                                                   $scope,
                                                                   trainerMapLocations,
                                                                   FormControl,
                                                                   AlertMessage,
                                                                   $q)
{
	$scope.addingLocation = !$scope.addingLocation;

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	// Remove the location details from the scope / form
	$scope.reset = function(form) {
		form.$setPristine();
		$scope.location = {};
		$scope.$$childTail.searchText = ''; // Hacky way to clear md-autocomplete
		$scope.userFactory.newLocation = {};
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
		return $q(function(resolve, reject) {
			if(form.$invalid) {
				AlertMessage.error('Please address the erros listed before continuing');
				return reject(new Error('Please address the errors listed before continuing'));
			}

			if(!$scope.location || (!$scope.location.city && !$scope.location.state)) {
				FormControl.parseSingleClientSideError(form, 'location', 'Please select a location');
				return reject(false);
			}
			if(!$scope.location || !$scope.location.city) {
				AlertMessage.error('Please select a location from the dropdown list');
				return reject(new Error('Please select a location from the dropdown list'));
			}
			$scope.location.title = $scope.title.text;
			$scope.cgBusy = trainerMapLocations.submitLocation($scope.userFactory, $scope.location)
				.then(function(response){
					$scope.addingLocation = false;
					$scope.reset(form);
					$scope.done();
					AlertMessage.success("Location added to your account");
				}).catch(function(err){
					if(err.message) {
						AlertMessage.error(err.message);
					}
					$scope.userFactory.resetEditing('locations');
					console.log("AFTER ALL, ", $scope.location);
					FormControl.parseValidationErrors(form, err);
					console.log("parsing errors:", err, " for form : ", form);
					console.log("FormControl errors:", FormControl.errors);
					if(FormControl.errors.location) {
						AlertMessage.error(FormControl.errors.location);
					}
					return reject(false);
				})
		});
	};
});