lungeApp.controller("TrainerAccountController", function(TrainerFactory,
                                                         $timeout,
                                                         Menu,
                                                         Auth,
                                                         UserSyncer,
                                                         SocketV2,
                                                         UserFactory,
                                                         $scope){
	// TrainerFactory.unset();
	// Set the trainerFactory for all subsequent "Account" routes.  Make sure to unsync after descruction
	// TrainerFactory.initToCurrentTrainerIfNecessary();
	// $scope.trainerFactory = TrainerFactory;
	//
	// // unsync after scope destruction
	// $scope.$on('$destroy', function(){
	// 	TrainerFactory.unsyncModel();
	// });

	$scope.userFactory = new UserFactory.init(Auth.getCurrentUser());

	SocketV2.authenticate().then(function(){
		var callbackIndex = Auth.addOnSocketUpdatedCallback(function(){
			console.log('[Trainer Account Controller] updating scope.userFactory after socket message for user id: ' +
						Auth.getCurrentUser()._id);
			$scope.userFactory.init(Auth.getCurrentUser());
		});
		$scope.$on('$destroy', function(){
			Auth.removeOnSocketUpdatedCallback(callbackIndex);
		});
	});
});