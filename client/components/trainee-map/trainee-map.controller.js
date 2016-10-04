myApp.controller('TraineeMapController', function(traineeMap, $scope, $mdDialog) {
	$scope.locationDialog = function(ev) {
		$mdDialog.show(
			{
				focusOnOpen : false,
				controller: 'TraineeMapAddLocationDialogController',
				templateUrl: 'components/trainee-map/add-location/dialog/trainee-map-add-location-dialog.partial.html',
				parent: angular.element(document.body),
				scope : $scope,
				preserveScope : true,
				targetEvent: ev,
				clickOutsideToClose: true
			}
		).then(function(location) {

		}, function() {

		});
	};
});