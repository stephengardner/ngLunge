lungeApp.controller("AccountController", function(Auth, $scope){
	$scope.emailToggle = function(){
		$scope.emailUpdating = !$scope.emailUpdating;
	};
	$scope.changeEmail = function(email) {
		Auth.changeEmail(email, function(response){
			$scope.user = response;
			alert("DONE");
		});
	};
	Auth.isLoggedInAsync(function(){
		$scope.user = Auth.getCurrentUser();
	});
});