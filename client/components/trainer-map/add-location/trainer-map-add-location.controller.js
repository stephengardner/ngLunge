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


	// Clicking "Add a location" button
	$scope.toggleLocation = function() {
		$scope.addingLocation = !$scope.addingLocation;
		if(!$scope.boundGeocoder) {
			$scope.boundGeocoder = true;
			Geocoder.bindPlaces("#geocoder-location", function(updatedLocation){
				$scope.userFactory.newLocation = updatedLocation;
				$scope.$apply();
			});
		}
	};

});