lungeApp.controller("TrainerMapController", function(TrainerFactory, Sync, $document, $anchorScroll, $interval, trainerMap, trainerMapUIOverlays, uiGmapGoogleMapApi, uiGmapIsReady, snazzyStyleBlue, FormControl, $q, $timeout, Auth, $compile, AlertMessage, Geocoder, $scope){
	$scope.boundGeocoder = false;
	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.locationLimit = 1;
	$scope.trainerFactory = TrainerFactory;
	TrainerFactory.trainer.locations[0] ? TrainerFactory.trainer.locations[0].open = true : false;
	$scope.manualLocation = {
		active : false,
		isActive : function() {
			return this.active;
		},
		toggle : function() {
			this.active = !this.active;
		}
	};
	$scope.ajax = {
		busy : false
	}
	$scope.googleMapLoaded = trainerMap.googleMapLoaded;
	// The Google Map Options
	$scope.gmapOptions = {
		scrollwheel: false,
		draggable: true,
		styles: snazzyStyleBlue,
		disableDefaultUI: true // <-- see this line
	};

	$scope.map = trainerMap.init(TrainerFactory.trainer).map;
	$scope.closeInfoWindow = trainerMap.closeInfoWindow;

	$scope.accordionIndexViewable = function(index) {
		return index < $scope.locationLimit;
	}
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

	$scope.locationsShowMore = function() {
		return $scope.locationLimit < TrainerFactory.trainer.locations.length;
	};

	$scope.toggleLocation = function() {
		$scope.addingLocation = !$scope.addingLocation;
		if(!$scope.boundGeocoder) {
			$scope.boundGeocoder = true;
			Geocoder.bindPlaces("#location", function(updatedLocation){
				TrainerFactory.newLocation = updatedLocation;
				$scope.$apply();
			});
		}
	};

	$scope.$on('trainerUpdated', function() {
		//alert("Updated");
		trainerMap.updateLocations(TrainerFactory.trainer);
	});

	uiGmapIsReady.promise().then(function(maps) {
		$timeout(function(){
			trainerMapUIOverlays.init($scope.map.control.getGMap());
			trainerMap.bindInfoWindow($scope);
			$scope.infoWindow = trainerMap.infoWindow;
			trainerMap.updateLocations(TrainerFactory.trainer);
		})
	});

	$scope.isMarkerLocationSelected = function(location) {
		return location._id == trainerMap.selectedMarkerLocation._id;
	}
	Auth.isLoggedInAsync(function(trainer) {
		$scope.triggerMarkerClick = function(location){
			for(var i = 0; i < TrainerFactory.trainer.locations.length; i++ ){
				TrainerFactory.trainer.locations[i].selected = false;
			}
			location.selected = true;
			var mapElement = angular.element(document.getElementById('google-map'));
			$document.scrollToElement(mapElement, 60, 400);
			trainerMap._triggerMarkerClick(location);
		};

		// Catch events broadcasted from the profile controller for when the profile page updates the location
		//$scope.$on("locationsChanged", trainerMap.updateLocations);
		$scope.makePrimary = function(location) {
			$scope.ajax.busy = true;
			TrainerFactory.setPrimaryLocation(location);
			TrainerFactory.save('locations').then(function(response){
				$scope.ajax.busy = false;
				AlertMessage.success("Primary location set to " + response.location.address_line_1);
			}).catch(function(err){
				$scope.ajax.busy = false;
				console.log("ERROR!", err);
				AlertMessage.error("Location update failed");
			})
		};

		// when finished with the "Add Location" form
		$scope.submitLocation = function(form) {
			if(form.$invalid) {
				AlertMessage.error("Please address the errors listed before continuing");
				return false;
			}
			var deferred = $q.defer();
			$scope.ajax.busy = true;
			TrainerFactory.addEditedLocation($scope.manualLocation.isActive());
			TrainerFactory.save('locations').then(function(response){
				$scope.ajax.busy = false;
				$scope.addingLocation = false;
				$scope.reset();
				AlertMessage.success("Location added to your account");
			}).catch(function(err){
				$scope.ajax.busy = false;
				TrainerFactory.resetEditing('locations');
				form.$setPristine();
				$scope.sending = false;
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
				$scope.errors = FormControl.errors;
				deferred.reject();
			});
			return deferred.promise;
		};

		// changing the title of a location from the ng-repeat of all locations
		$scope.toggleChangeTitle = function(location) {
			location.editingTitle = !location.editingTitle;
			TrainerFactory.resetEditing('locations');
		};
		$scope.reset = function() {
			$scope.location = {};
			$scope.trainerFactory.newLocation = {};
			$("#location").val('');
		};

		$scope.changeTitle = function(location) {
			$scope.ajax.busy = true;
			TrainerFactory.save('locations').then(function(){
				$scope.ajax.busy = false;
				$scope.toggleChangeTitle(location);
				AlertMessage.success("Location title changed successfully");
			}).catch(function(err) {
				$scope.ajax.busy = false;
				form.$setPristine();
				$scope.sending = false;
				FormControl.parseValidationErrors(form, err);
			})
		}

	});
});

lungeApp.controller("TrainerMapLocationsController", function(){
});