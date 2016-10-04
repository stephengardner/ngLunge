lungeApp.controller("TrainerDeleteLocationController", function($mdDialog,
                                                                $timeout,
                                                                TrainerFactory,
                                                                Sync,
                                                                trainerMap,
                                                                AlertMessage,
                                                                Auth,
                                                                $scope){
	// Modals
	$scope.deleteLocationModal = function(location, ev) {
		$mdDialog.show({
			templateUrl : 'components/trainer-map/delete-location/dialog/' +
			'trainer-map-delete-location-dialog.partial.html',
			parent : angular.element(document.body),
			targetEvent : $scope.events.menu, // inherited from parent scope
			clickOutsideToClose : true,
			controller : ['$mdDialog', function($mdDialog) {
				var vm = this;
				vm.confirm = function(){
					location.removing = true;
					$scope.userFactory.deleteLocation(location);
					vm.cgBusy = $scope.userFactory.save('locations', { updateOverwrite : true }).then(function(response){
						$mdDialog.hide();
						AlertMessage.success("Location removed successfully");
					}).catch(function(err){
						AlertMessage.error("Location removal failed");
					});
				};
				vm.cancel = $mdDialog.cancel;
			}],
			controllerAs : 'vm'
		}).then(function(response){
		}, function(response) {
		});
		//
		// console.log("delete location modal...");
		// // Just provide a template url, a controller and call 'showModal'.
		// if(!$scope.modal) {
		// 	$scope.modal = ngDialog.open({
		// 		template: "components/trainer-map/delete-location/modal/trainer-delete-location-modal.html",
		// 		scope: $scope,
		// 		//controller: "TrainerDeleteLocationModalController",
		// 		showClose : false
		// 	});
		// 	$scope.modal.closePromise.then(function(data) {
		// 		if(data.value == true) {
		// 			location.removing = true;
		// 			TrainerFactory.deleteLocation(location);
		// 			TrainerFactory.save().then(function(response){
		// 				AlertMessage.success("Location removed successfully");
		// 				//console.log("The trainer factory is now:", TrainerFactory);
		// 				//$scope.$apply();
		// 			}).catch(function(err){
		// 				AlertMessage.error("Location removal failed");
		// 			});
		// 		}
		// 		console.log("The data is:", data);
		// 		console.log(data.id + ' has been dismissed.');
		// 		$scope.modal = false;
		// 	})
		// }
	};
});