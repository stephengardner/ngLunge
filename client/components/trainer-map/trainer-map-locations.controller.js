lungeApp.controller("TrainerMapLocationsController", function(AlertMessage,
                                                              TrainerFactory,
                                                              $scope,
                                                              trainerMap,
                                                              trainerMapLocations,
                                                              FormControl,
                                                              Auth,
                                                              $document,
                                                              Geocoder,
                                                              $q
){

	$scope.ajax = {
		busy : false,
		promise : false
	};
	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;
	// Catch events broadcasted from the profile controller for when the profile page updates the location
	//$scope.$on("locationsChanged", trainerMap.updateLocations);
	$scope.makePrimary = function(location) {
		$scope.ajax.busy = true;
		TrainerFactory.setPrimaryLocation(location);
		$scope.cgBusy = TrainerFactory.save('locations').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("Primary location set to " + response.location.address_line_1);
		}).catch(function(err){
			$scope.ajax.busy = false;
			console.log("ERROR!", err);
			AlertMessage.error("Location update failed");
		})
	};
	// changing the title of a location from the ng-repeat of all locations
	$scope.toggleChangeTitle = function(location) {
		location.editingTitle = !location.editingTitle;
		TrainerFactory.resetEditing('locations');
	};
	$scope.$on('trainerUpdated', function() {
		//alert("Updated");
		trainerMap.updateLocations(TrainerFactory.trainer);
	});
	$scope.changeTitle = function(form, location) {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('locations').then(function(){
			$scope.ajax.busy = false;
			$scope.toggleChangeTitle(location);
			AlertMessage.success("Location title changed successfully");
		}).catch(function(err) {
			$scope.ajax.busy = false;
			form.$setPristine();
			$scope.sending = false;
			FormControl.parseValidationErrors(form, err);
		})
	};

	$scope.locationLimit = 1;
	$scope.accordionIndexViewable = function(index) {
		return index < $scope.locationLimit;
	};
	$scope.locationsShowMore = function() {
		return $scope.locationLimit < TrainerFactory.trainer.locations.length;
	};

	$scope.isMarkerLocationSelected = function(location) {
		return trainerMap.selectedMarkerLocation && location._id == trainerMap.selectedMarkerLocation._id;
	};

	$scope.toggleLimitLocations = function() {
		if(!TrainerFactory.trainer) return false;
		if($scope.locationLimit < TrainerFactory.trainer.locations.length) {
			/*
			 $scope.locationLimit +4 <= TrainerFactory.trainer.locations.length
			 ? $scope.locationLimit += 4
			 : $scope.locationLimit = TrainerFactory.trainer.locations.length;
			 */
			$scope.locationLimit = TrainerFactory.trainer.locations.length;
		}
		else{
			$scope.locationLimit = 1;//TrainerFactory.trainer.locations.length;
			//$scope.locationLimit < 5 ? $scope.locationLimit = 1 : $scope.locationLimit -= 4;
		}
	};
	Auth.isLoggedInAsync(function(trainer) {
		$scope.closeInfoWindow = trainerMap.closeInfoWindow;
		$scope.trainerFactory = TrainerFactory;
		TrainerFactory.trainer.locations && TrainerFactory.trainer.locations[0]
			? TrainerFactory.trainer.locations[0].open = true : false;
		$scope.triggerMarkerClick = function(location){
			if(location.editingTitle) {
				return false;
			}
			for(var i = 0; i < TrainerFactory.trainer.locations.length; i++ ){
				TrainerFactory.trainer.locations[i].selected = false;
			}
			location.selected = true;
			var mapElement = angular.element(document.getElementById('google-map'));
			$document.scrollToElement(mapElement, 60, 400);
			trainerMap._triggerMarkerClick(location);
		};
	});
});