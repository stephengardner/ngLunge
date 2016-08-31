lungeApp.controller("TraineeBasicInfoController", function($scope,
                                                           UserFactory,
                                                           AlertMessage,
                                                           lodash,
                                                           TrainerFactory){
	var section = 'basicInfo',
		string = 'Basic Info updated';
	$scope.ageRange = lodash.range(8, 99);
	$scope.submit = function() {
		$scope.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(string);
		}).catch(function(err){

		})
	}
});