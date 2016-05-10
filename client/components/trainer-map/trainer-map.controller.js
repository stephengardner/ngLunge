lungeApp.controller("TrainerMapController", function(TrainerFactory, Sync, $document, $anchorScroll, $interval,
                                                     trainerMap, trainerMapUIOverlays, uiGmapGoogleMapApi,
                                                     uiGmapIsReady, snazzyStyleBlue, FormControl, $q, $timeout, Auth,
                                                     $compile, AlertMessage, Geocoder, $scope, $mdDialog){
	$scope.boundGeocoder = false;
	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;
	$scope.ajax = {
		busy : false,
		promise : false
	};
	$scope.cgBusy = false;
	$scope.googleMapLoaded = trainerMap.googleMapLoaded;
	// The Google Map Options
	$scope.gmapOptions = {
		scrollwheel: false,
		draggable: true,
		styles: snazzyStyleBlue,
		disableDefaultUI: true // <-- see this line
	};

	$scope.$on('trainerUpdated', function() {
		//alert("Updated");
		trainerMap.updateLocations(TrainerFactory.trainer);
	});

	uiGmapIsReady.promise().then(function(maps) {
		$timeout(function(){
			if($scope.map && $scope.map.control && $scope.map.control.getGMap){
				trainerMapUIOverlays.init($scope.map.control.getGMap());
				trainerMap.bindInfoWindow($scope);
				$scope.infoWindow = trainerMap.infoWindow;
				trainerMap.updateLocations(TrainerFactory.trainer);
			}
		})
	});

	Auth.isLoggedInAsync(function(trainer) {
		$scope.trainerFactory = TrainerFactory;
		$scope.map = trainerMap.init(TrainerFactory.trainer).map;
		// TEST THE ABOVE
	});


	$scope.locationDialog = function(ev) {
		// Appending dialog to document.body to cover sidenav in docs app
		// Modal dialogs should fully cover application
		// to prevent interaction outside of dialog
		$mdDialog.show(
			{
				controller: 'TrainerMapAddLocationDialogController',
				templateUrl: '/components/trainer-map/add-location/dialog/trainer-map-add-location-dialog.partial.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			}
		).then(function(location) {

		}, function() {

		});
	};
});