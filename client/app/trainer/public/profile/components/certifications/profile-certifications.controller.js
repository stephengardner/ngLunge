lungeApp.controller("ProfileCertificationsController", function($scope){
	$scope.certVisibility = {

	};
	$scope.oneAtATime = true;
	$scope.status = {
		open : false
	}

	$scope.toggleCert = function(cert) {
		if(typeof $scope.certVisibility[cert] == "undefined") {
			$scope.certVisibility[cert] = true;
		}
		else {
			$scope.certVisibility[cert] = !$scope.certVisibility[cert];
		}
	}
});