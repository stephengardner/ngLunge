myApp.controller('ReviewsCardController', function($scope, Reviews, TrainerFactory) {
	$scope.reviews = Reviews.init($scope.userFactory.user._id);
	// putting it here so that the scope updates isntantly...
	$scope.get = function(){
		$scope.reviews.get();
	};
	$scope.$on('$destroy', function(){
		$scope.reviews.destroySocket();
	})
});