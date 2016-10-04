lungeApp.directive("trainerMap", function(){
	return {
		restrict : "AE",
		// template : 'test',
		templateUrl: 'components/trainer-map/trainer-map.partial.html',
		controller : 'TrainerMapController'
	}
});
lungeApp.directive("trainerMapLocations", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapLocationsController',
		templateUrl: 'components/trainer-map/trainer-map-locations.partial.html'
	}
});