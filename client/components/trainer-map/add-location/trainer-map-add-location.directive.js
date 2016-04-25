
lungeApp.directive("trainerMapAddLocation", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapAddLocationController',
		scope : { mapseditable : '@' },
		templateUrl: 'components/trainer-map/add-location/trainer-map-add-location.partial.html',
		link: function (scope, element, attrs) {
			attrs.$observe('mapseditable', function(val){
				scope.mapseditable = val;
			});
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
			//attrs.$observe('mapseditable', function(val){
			//	scope.mapseditable = val;
			//	alert(scope.mapseditable);
			//});
			//if(scope.mapseditable) {
			//	return;
			//}
			//scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
		}
	}
});