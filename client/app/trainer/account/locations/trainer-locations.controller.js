lungeApp.controller('TrainerLocationsController', function($q, AlertMessage, $compile, Auth, Geocoder, $timeout, $scope){
	$scope.control = {};
	$scope.toggleLocation = function(){
		$scope.addingLocation = !$scope.addingLocation;
	};
	$scope.removeMongooseError = function(form, inputName) {
		console.log("attempting...", form[inputName]);
		//$scope.submitted = false;
		if(!form[inputName] || !form[inputName].$error) {
			return false;
		}
		console.log("SETTING INVISIBLE TRUE FOR : ", inputName);
		form[inputName].$error['invisible'] = false;
		form[inputName].$setValidity('mongoose', true);
		form[inputName].$setValidity('invisible', true);
	};
	$timeout(function(){
		Geocoder.bindPlaces("#location", function(updatedLocation){
			$scope.updatedLocation = updatedLocation;
			$scope.$apply();
		});
	}, 4000);

});