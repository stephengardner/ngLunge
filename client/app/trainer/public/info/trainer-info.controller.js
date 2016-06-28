myApp.controller("TrainerInfoController", function(TrainerFactory,
                                                   $scope,
                                                   $timeout,
                                                   Auth){

	TrainerFactory.unset();

	$scope.trainerFactory = TrainerFactory;

	$scope.isMe = function(){
		return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
	};

	// we DONT NEED TO DO THIS, ITS ALREADY DONE IN THE ACCOUNT CONTROLLER
	// Sync the user up. and we're good to go!
	// $timeout(function(){
	// 	Auth.isLoggedInAsync(function(){
	// 		TrainerFactory.init(Auth.getCurrentUser(), { sync : true });
	// 	});
	// }, 50);
	
	// $scope.$on('$destroy', function(){
	// 	TrainerFactory.unsyncModel();
	// });
	// END controller syncing
})