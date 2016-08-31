myApp.directive('certificationsCard', ['TrainerFactory', function(TrainerFactory){
	return {
		restrict : 'AE',
		scope : {
			editable : '@'
		},
		controller : ['$scope', function($scope) {
			$scope.trainerFactory = TrainerFactory;
		}],
		templateUrl : 'components/certifications/card/certifications-card.partial.html'
	}
}])