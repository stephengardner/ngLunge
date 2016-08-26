myApp.controller('TraineeProfileController', function(Auth,
                                                      $http,
                                                      $scope,
                                                      $state,
                                                      $stateParams,
                                                      FullMetalSocket,
                                                      traineeMap,
                                                      UserFactory) {
	console.log("State params:", $stateParams);
	$scope.ready = false;

	$scope.isMe = function() {
		if(Auth.getCurrentUser() && Auth.getCurrentUser()._id == $scope.userFactory.user._id) {
			return true;
		}
		else {
			return false;
		}
	};

	$scope.$on('$destroy', function() {
		FullMetalSocket.user.unsyncUnauthUserFactory();
	});

	$http({
		method : 'GET',
		url : 'api/users/byUrlName/' + $stateParams.urlName,
		params : {
			kind : 'trainee'
		}
	}).success(function(response) {
		$scope.userFactory = UserFactory.init(response);
		FullMetalSocket.user.syncUnauthUserFactory($scope.userFactory);
		$scope.ready = true;
		console.log("map:", $scope.map);
	}).error(function(err){
		$state.go('main.home');
		console.log("err:", err);
	});


});