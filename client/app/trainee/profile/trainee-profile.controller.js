myApp.controller('TraineeProfileController', function(Auth,
                                                      $http,
                                                      $scope,
                                                      $state,
                                                      $stateParams,
                                                      UserSyncer,
                                                      traineeMap,
                                                      UserFactory) {
	$scope.ready = false;
	$scope.isMe = function() {
		return Auth.getCurrentUser() && Auth.getCurrentUser()._id == $scope.userFactory.user._id;
	};
	$http({
		url : 'api/users/byUrlName/' + $stateParams.urlName,
		params : {
			kind : 'trainee'
		}
	}).success(function(response) {
		$scope.userFactory = UserFactory.init(response);
		UserSyncer.syncUnauthUserFactory($scope.userFactory);
		$scope.$on('$destroy', function() {
			UserSyncer.unsyncUnauthUserFactory($scope.userFactory);
		});
		$scope.ready = true;
	}).error(function(err){
		$state.go('main.home');
		console.log("err:", err);
	});
});