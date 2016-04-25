lungeApp.directive("trainerMapFull", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapFullController',
		scope : { mapseditable : '@' },
		templateUrl: 'components/trainer-map/full/trainer-map-full.partial.html',
		link: function (scope, element, attrs) {
			scope.mapseditable = attrs.mapseditable == "false" ? false : scope.$eval(attrs.mapseditable);
			attrs.$observe('mapseditable', function(val){
				scope.mapseditable = val;
			});
		}
	}
});