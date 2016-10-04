lungeApp.directive("trainerMapCard", function(){
	return {
		restrict : "AE",
		controller : 'TrainerMapCardController',
		scope : {
			userFactory : '<'
		},
		templateUrl: 'components/trainer-map/card/trainer-map-card.partial.html'
	}
});