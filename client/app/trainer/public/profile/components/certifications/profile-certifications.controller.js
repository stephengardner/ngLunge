lungeApp.controller("ProfileCertificationsController", function($scope){
	$scope.certVisibility = {

	};

	$scope.toggleCert = function(cert) {
		if(typeof $scope.certVisibility[cert] == "undefined") {
			$scope.certVisibility[cert] = true;
		}
		else {
			$scope.certVisibility[cert] = !$scope.certVisibility[cert];
		}
	}
});