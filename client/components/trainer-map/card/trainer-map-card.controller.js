lungeApp.controller("TrainerMapCardController", function(TrainerFactory,
                                                         Sync,
                                                         $document,
                                                         $anchorScroll,
                                                         $interval,
                                                         trainerMap,
                                                         trainerMapUIOverlays,
                                                         uiGmapGoogleMapApi,
                                                         uiGmapIsReady,
                                                         snazzyStyleBlue,
                                                         FormControl,
                                                         $q,
                                                         $timeout,
                                                         Auth,
                                                         $compile,
                                                         AlertMessage,
                                                         Geocoder,
                                                         $scope,
                                                         $mdDialog
){

	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;
	$scope.locationDialog = function(ev) {
		$mdDialog.show(
			{
				focusOnOpen : false,
				controller: 'TrainerMapAddLocationDialogController',
				templateUrl: 'components/trainer-map/add-location/dialog/trainer-map-add-location-dialog.partial.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			}
		).then(function(location) {

		}, function() {

		});
	};
});