lungeApp.directive("trainerMap", function(){
	return {
		restrict : "AE",
		templateUrl: 'components/trainer-map/trainer-map.partial.html',
		controller : 'TrainerMapController',
		scope : { mapseditable : '@' },
		link: function (scope, element, attrs) {
			attrs.$observe('mapseditable', function(val){
				scope.mapseditable = val;
			});
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
		}
	}
});
lungeApp.directive("trainerMapLocations", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapLocationsController',
		scope : { mapseditable : '@' },
		templateUrl: 'components/trainer-map/trainer-map-locations.partial.html',
		link: function (scope, element, attrs) {
			attrs.$observe('mapseditable', function(val){
				scope.mapseditable = val;
			});
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
		}
	}
});