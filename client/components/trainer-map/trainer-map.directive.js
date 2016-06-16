lungeApp.directive("trainerMap", function(){
	return {
		restrict : "AE",
		// template : 'test',
		templateUrl: 'components/trainer-map/trainer-map.partial.html',
		controller : 'TrainerMapController',
		scope : { editable : '@' },
		link: function (scope, element, attrs) {
			// attrs.$observe('editable', function(val){
			// 	scope.editable = val;
			// });
			// scope.editable = attrs.editable == "false" ? false : scope.$eval(attrs.editable);
		}
	}
});
lungeApp.directive("trainerMapLocations", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapLocationsController',
		scope : { editable : '@' },
		templateUrl: 'components/trainer-map/trainer-map-locations.partial.html',
		link: function (scope, element, attrs) {
			attrs.$observe('editable', function(val){
				scope.editable = val;
			});
			scope.editable = attrs.editable == "false" ? false : scope.$eval(attrs.editable);
		}
	}
});