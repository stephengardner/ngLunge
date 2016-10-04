myApp.directive('reviewsCard', function(){
	return {
		restrict : 'AE',
		controller : 'ReviewsCardController',
		scope : {
			userFactory : '='
		},
		templateUrl : 'components/reviews/card/reviews-card.partial.html'
	}
});