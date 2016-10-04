
lungeApp.directive("trainerMapAddLocation", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapAddLocationController',
		templateUrl: 'components/trainer-map/add-location/trainer-map-add-location.partial.html'
	}
});