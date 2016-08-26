lungeApp.controller("TraineeReviewsController", function($scope,
                                                           UserFactory,
                                                           AlertMessage,
                                                           TrainerFactory){
	var section = 'reviews',
		sectionString = 'Reviews';
	$scope.submit = function() {
		$scope.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(sectionString + ' section updated');
		}).catch(function(err){

		})
	}
});