myApp.controller("TrainerInfoController", function(TrainerFactory, AlertMessage, /*socket,*/ FormControl,
                                                   $popover, Sync, $scope, Auth){

	$scope.editingPrivacyFor = false;

	$scope.trainerFactory = TrainerFactory;

	$scope.isMe = function(){
		return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
	};

	// Sync the user up. and we're good to go!
	Auth.isLoggedInAsync(function(){
		TrainerFactory.init(Auth.getCurrentUser(), { sync : true });
	});
	$scope.$on('$destroy', function(){
		TrainerFactory.unsyncModel();
	});
	// END controller syncing
})