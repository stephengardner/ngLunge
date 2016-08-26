lungeApp.controller("TraineeBioController", function($scope,
                                                           UserFactory,
                                                           AlertMessage,
                                                           TrainerFactory){
	var section = 'bio',
		string = 'Bio updated';
	$scope.textareaRows = 5;
	$scope.submit = function() {
		$scope.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(string);
		}).catch(function(err){
			AlertMessage.error('Woops, something went wrong');
			console.error(err);
		})
	}
});