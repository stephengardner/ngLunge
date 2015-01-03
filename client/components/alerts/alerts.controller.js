lungeApp.controller("AlertsController", function(Auth, $scope){
	$scope.closeMessage = function($index) {
		var user = $scope.trainer ? $scope.trainer : $scope.user;
		if(user) {
			user.alerts.profile.home[$index].closed = true;
			Auth.updateProfile({alerts: user.alerts}).then(function(response){
				console.log("updated alerts:", response);
			});
		}
		else {
			alert("Sorry, but there was a problem when connecting to your account.  Try logging out and logging in again");
		}
	};

});