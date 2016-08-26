myApp.controller('TraineeAccountController', function($state, Auth, $http, $scope, UserFactory) {
	Auth.isLoggedInAsync(function(){
		if(Auth.getCurrentUser().kind != 'trainee') {
			$state.go('main.login');
			return;
		}
		$http({
			method : 'GET',
			url : 'api/users/byUrlName/' + Auth.getCurrentUser().urlName,
			params : {
				kind : 'trainee'
			}
		}).success(function(response) {
			console.log("TraineeAccount for response:", response);
			$scope.userFactory = UserFactory.init(response);
			$scope.ready = true;
		}).error(function(err){
			$state.go('main.home');
			console.log("err:", err);
		});
	})
});