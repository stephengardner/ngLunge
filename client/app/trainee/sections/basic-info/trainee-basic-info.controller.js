lungeApp.controller("TraineeBasicInfoController", function($scope,
                                                           UserFactory,
                                                           AlertMessage,
                                                           TrainerFactory){
	var section = 'basicInfo',
		string = 'Basic Info updated';
	$scope.submit = function() {
		$scope.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(string);
		}).catch(function(err){

		})
	}
});