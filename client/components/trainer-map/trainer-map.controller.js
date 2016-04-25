lungeApp.controller("TrainerMapController", function(TrainerFactory, Sync, $document, $anchorScroll, $interval,
                                                     trainerMap, trainerMapUIOverlays, uiGmapGoogleMapApi,
                                                     uiGmapIsReady, snazzyStyleBlue, FormControl, $q, $timeout, Auth,
                                                     $compile, AlertMessage, Geocoder, $scope){
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
});