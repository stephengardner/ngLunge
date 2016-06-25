lungeApp.controller("TrainerMapController", function(TrainerFactory, Sync, $document, $anchorScroll, $interval,
                                                     trainerMap, trainerMapUIOverlays, uiGmapGoogleMapApi,
                                                     uiGmapIsReady, snazzyStyleBlue, FormControl, $q, $timeout, Auth,
                                                     $compile, AlertMessage, Geocoder, $scope, $mdDialog,
                                                     $log,
                                                     $window){
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;
	$scope.ajax = {
		busy : false,
		promise : false
	};
	$scope.cgBusy = false;
	$scope.googleMapLoaded = trainerMap.googleMapLoaded;
	$scope.windowControl = {};

	// The Google Map Options
	$scope.gmapOptions = {
		scrollwheel: false,
		draggable: true,
		styles: snazzyStyleBlue,
		disableDefaultUI: true, // <-- see this line,
		events : {
		}
	};
	
	angular.element($window).bind('resize', function() {
		console.log("Resize...");
		trainerMap.triggerResize();
		trainerMap.setGoogleMapCenter();
	});

	// $timeout(function() {
	// 	trainerMap.map.window.show = true;
	// 	console.log("WindowControl:", $scope.windowControl);
	// 	$scope.windowControl.showWindow();
	// }, 5000);
	$scope.$on('trainerUpdated', function() {
		$scope.map = trainerMap.init(TrainerFactory.trainer).map;
	});

	uiGmapIsReady.promise().then(function(maps) {
		$log.warn('uiGmapIsReady.promise is causing a massive amount of scope digests...  This can ' +
			'be seen when we console.log within something like the menuservice which does getSref()');
		$timeout(function(){
			if($scope.map && $scope.map.control && $scope.map.control.getGMap){
				// trainerMapUIOverlays.init($scope.map.control.getGMap());
				// trainerMap.bindInfoWindow($scope);
				// $scope.infoWindow = trainerMap.infoWindow;
				// trainerMap.updateLocations(TrainerFactory.trainer);
			}
		})
	}, function(){
		$log.warn('uiGmapIsReady.promise is causing a massive amount of scope digests...  This can ' +
			'be seen when we console.log within something like the menuservice which does getSref()');
	});

	Auth.isLoggedInAsync(function(trainer) {
		$scope.trainerFactory = TrainerFactory;
		$scope.map = trainerMap.init(TrainerFactory.trainer).map;

		// This IS necessary.  When changing routes, the size of the container alters somehow,
		// leaving a grey spot on the map, we need to trigger the resize WITHIN this timeout
		$timeout(function(){
			trainerMap.triggerResize();
			trainerMap.setGoogleMapCenter();
		});
	});
});