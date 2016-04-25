lungeApp.controller("TrainerMapAddLocationController", function(TrainerFactory, Sync,
                                                                $document,
                                                                $anchorScroll,
                                                                $interval,
                                                                trainerMap,
                                                                trainerMapUIOverlays,
                                                                uiGmapGoogleMapApi,
                                                                uiGmapIsReady,
                                                                snazzyStyleBlue,
                                                                FormControl,
                                                                $q,
                                                                $timeout,
                                                                Auth,
                                                                $compile,
                                                                AlertMessage,
                                                                Geocoder,
                                                                $scope,
                                                                trainerMapLocations
){

	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;

	$scope.manualLocation = {
		active : false,
		isActive : function() {
			return this.active;
		},
		toggle : function() {
			this.active = !this.active;
		}
	};

	$timeout(function(){
		Geocoder.bindPlaces("#geocoder-location", function(updatedLocation){
			TrainerFactory.newLocation = updatedLocation;
			$scope.$apply();
		});
	}, 2000);

	// Clicking "Add a location" button
	$scope.toggleLocation = function() {
		$scope.addingLocation = !$scope.addingLocation;
		if(!$scope.boundGeocoder) {
			$scope.boundGeocoder = true;
			Geocoder.bindPlaces("#geocoder-location", function(updatedLocation){
				TrainerFactory.newLocation = updatedLocation;
				$scope.$apply();
			});
		}
	};

	// Remove the location details from the scope / form
	$scope.reset = function() {
		$scope.location = {};
		$scope.trainerFactory.newLocation = {};
		$("#location").val('');
	};

	// when finished with the "Add Location" form or "Add another location" form
	$scope.submitLocation = function(form) {
		return $q(function(resolve, reject) {
			if(form.$invalid) {
				AlertMessage.error('Please address the erros listed before continuing');
				return reject(new Error('Please address the errors listed before continuing'));
			}
			$scope.cgBusy = trainerMapLocations.submitLocation(form, $scope.manualLocation.isActive())
				.then(function(response){
				//$scope.ajax.busy = false;
				$scope.addingLocation = false;
				$scope.reset();
				AlertMessage.success("Location added to your account");
			}).catch(function(err){
				AlertMessage.error(err.message);
				//$scope.ajax.busy = false;
				//$scope.sending = false;
				FormControl.parseValidationErrors(form, err);
				console.log("parsing errors:", err, " for form : ", form);
				console.log("FormControl errors:", FormControl.errors);
				if(FormControl.errors.location) {
					AlertMessage.error(FormControl.errors.location);
				}
				// Since the google locations don't have city/state - BUT it can still get city/state errors, set them
				// as the location error
				if(!$scope.manualLocation.isActive()) {
					if(FormControl.errors.state) {
						FormControl.setError(form, 'location', FormControl.errors.state);
					}
					else if (FormControl.errors.city) {
						FormControl.setError(form, 'location', FormControl.errors.city);
					}
				}
				return reject(false);
			})
		});
	};

});