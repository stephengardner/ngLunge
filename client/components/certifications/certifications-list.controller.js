myApp.controller("CertificationsListController", function($scope, TrainerFactory){
	$scope.editing = false;
	$scope.trainerFactory = TrainerFactory;
})