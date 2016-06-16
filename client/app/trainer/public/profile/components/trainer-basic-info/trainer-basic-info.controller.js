lungeApp.controller("TrainerBasicInfoController", function(ngDialog, $document, $popover, FormControl, AlertMessage,
                                                           $window, Geocoder, $timeout, $q, Auth, $scope,
TrainerFactory){
	$scope.trainerFactory = TrainerFactory;
});