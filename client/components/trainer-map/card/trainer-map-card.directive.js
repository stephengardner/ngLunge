lungeApp.directive("trainerMapCard", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapCardController',
		scope : { editable : '@' },
		templateUrl: 'components/trainer-map/card/trainer-map-card.partial.html',
		link: function (scope, element, attrs) {
			scope.editable = attrs.editable == "false" ? false : scope.$eval(attrs.editable);
			attrs.$observe('editable', function(val){
				scope.editable = val;
			});
		}
	}
});