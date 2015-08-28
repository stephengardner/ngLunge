lungeApp.controller("TrainerDeleteLocationController", function($timeout, TrainerFactory, Sync, trainerMap, AlertMessage, Auth, $scope, ngDialog){

	// when clicking the "Remove" button from the ng-repeat of all locations
	$scope.removeLocation = function(location) {
		/*
		*/
	}

	// Modals
	$scope.deleteLocationModal = function(location) {
		console.log("delete location modal...");
		// Just provide a template url, a controller and call 'showModal'.
		if(!$scope.modal) {
			$scope.modal = ngDialog.open({
				template: "components/trainer-map/delete-location/modal/trainer-delete-location-modal.html",
				scope: $scope,
				//controller: "TrainerDeleteLocationModalController",
				showClose : false
			});
			$scope.modal.closePromise.then(function(data) {
				if(data.value == true) {
					location.removing = true;
					TrainerFactory.deleteLocation(location);
					TrainerFactory.save().then(function(response){
						AlertMessage.success("Location removed successfully");
						//console.log("The trainer factory is now:", TrainerFactory);
						//$scope.$apply();
					}).catch(function(err){
						AlertMessage.error("Location removal failed");
					});
				}
				console.log("The data is:", data);
				console.log(data.id + ' has been dismissed.');
				$scope.modal = false;
			})
		}
	};
});