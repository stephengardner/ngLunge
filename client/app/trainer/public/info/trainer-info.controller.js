myApp.controller("TrainerInfoController", function(TrainerFactory,
                                                   $scope,
                                                   $timeout,
                                                   UserFactory,
                                                   UserSyncer,
                                                   Auth){
	$scope.editable = $scope.userFactory.isMe();
});