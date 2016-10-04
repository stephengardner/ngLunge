lungeApp.controller("TrainerMapLocationsController", function(AlertMessage,
                                                              TrainerFactory,
                                                              $scope,
                                                              trainerMap,
                                                              trainerMapLocations,
                                                              FormControl,
                                                              Auth,
                                                              $document,
                                                              Geocoder,
                                                              $q,
                                                              $mdDialog
){
	$scope.ajax = {
		busy : false,
		promise : false
	};

	$scope.events = {
		manu : undefined
	};
	$scope.openMenu = function($mdOpenMenu, ev) {
		$scope.events.menu = ev;
		$mdOpenMenu(ev);
	};

	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	// Catch events broadcasted from the profile controller for when the profile page updates the location
	//$scope.$on("locationsChanged", trainerMap.updateLocations);
	$scope.makePrimary = function(location) {
		$scope.ajax.busy = true;
		$scope.userFactory.setPrimaryLocation(location);
		$scope.cgBusy = $scope.userFactory.save('locations').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("Primary location set to " + response.location.address_line_1);
		}).catch(function(err){
			$scope.ajax.busy = false;
			console.log("ERROR!", err);
			AlertMessage.error("Location update failed");
		})
	};
	// changing the title of a location from the ng-repeat of all locations
	$scope.toggleChangeTitle = function(location, ev) {
		location.editingTitle = true;
		$mdDialog.show({
			templateUrl : 'components/trainer-map/change-title/dialog/' +
			'trainer-map-change-title-dialog.partial.html',
			targetEvent : $scope.events.menu,
			clickOutsideToClose : true,
			focusOnOpen : false,
			controller : ['$mdDialog', function($mdDialog) {
				var vm = this;
				console.log("Scope userfactory is:", $scope.userFactory);
				vm.location = $scope.userFactory.userEditing.locations
					[$scope.userFactory.user.locations.indexOf(location)];
				vm.confirm = function(form){
					$scope.userFactory.save('locations').then(function(response){
						AlertMessage.success("Location title changed successfully");
						$mdDialog.hide();
					}).catch(function(err){
						FormControl.parseValidationErrors(form, err);
						AlertMessage.error("Location title change failed");
					});
				};
				vm.cancel = $mdDialog.cancel;
			}],
			controllerAs : 'vm'
		}).then(function(response){
		}, function(response) {
		});
		// TrainerFactory.resetEditing('locations');
	};
	$scope.$on('trainerUpdated', function() {
		//alert("Updated");
		trainerMap.updateLocations($scope.userFactory.user);
	});
	$scope.changeTitle = function(form, location) {
		$scope.ajax.busy = true;
		$scope.cgBusy = $scope.userFactory.save('locations').then(function(){
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
		return $scope.locationLimit < $scope.userFactory.user.locations.length;
	};

	$scope.isMarkerLocationSelected = function(location) {
		return trainerMap.selectedMarkerLocation && location._id == trainerMap.selectedMarkerLocation._id;
	};

	$scope.toggleLimitLocations = function() {
		if(!$scope.userFactory.user) return false;
		if($scope.locationLimit < $scope.userFactory.user.locations.length) {
			/*
			 $scope.locationLimit +4 <= TrainerFactory.trainer.locations.length
			 ? $scope.locationLimit += 4
			 : $scope.locationLimit = TrainerFactory.trainer.locations.length;
			 */
			$scope.locationLimit = $scope.userFactory.user.locations.length;
		}
		else{
			$scope.locationLimit = 1;//TrainerFactory.trainer.locations.length;
			//$scope.locationLimit < 5 ? $scope.locationLimit = 1 : $scope.locationLimit -= 4;
		}
	};
	Auth.isLoggedInAsync(function(trainer) {
		$scope.closeInfoWindow = trainerMap.closeInfoWindow;
		$scope.userFactory.user.locations && $scope.userFactory.user.locations[0]
			? $scope.userFactory.user.locations[0].open = true : false;

		$scope.triggerMarkerClick = function(location){
			trainerMap.showWindowForLocationModel(location);
		};
	});
});