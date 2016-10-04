myApp.directive('certificationsCard', ['TrainerFactory', function(TrainerFactory){
	return {
		restrict : 'AE',
		scope : {
			userFactory : '<'
		},
		templateUrl : 'components/certifications/card/certifications-card.partial.html'
	}
}])