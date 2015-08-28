lungeApp.directive("trainerMap", function(){
	return {
		restrict : "AE",
		templateUrl: 'components/trainer-map/trainer-map.partial.html',
		controller : 'TrainerMapController',
		link: function (scope, element, attrs) {
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
		}
	}
});
lungeApp.directive("trainerMapLocations", function(){
	return {
		restrict : "AE",
		templateUrl: 'components/trainer-map/trainer-map-locations.partial.html',
		link: function (scope, element, attrs) {
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
		}
	}
});