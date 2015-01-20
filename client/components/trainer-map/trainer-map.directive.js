lungeApp.directive("trainerMap", function(){
	return {
		restrict : "AE",
		templateUrl: '/components/trainer-map/trainer-map.partial.html'
	}
});
lungeApp.directive("trainerMapLocations", function(){
	return {
		restrict : "AE",
		templateUrl: '/components/trainer-map/trainer-map-locations.partial.html',
		link: function (scope, element, attrs) {
			scope.editable = attrs.editable == "false" ? false : true;//attrs.editable : 1;
		}
	}
});