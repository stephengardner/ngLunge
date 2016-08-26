lungeApp.controller("TrainerAccountController", function(TrainerFactory,
                                                         $timeout,
                                                         Menu,
                                                         Auth,
                                                         $scope){
	// TrainerFactory.unset();
	// Set the trainerFactory for all subsequent "Account" routes.  Make sure to unsync after descruction
	TrainerFactory.initToCurrentTrainerIfNecessary();
	$scope.trainerFactory = TrainerFactory;

	// unsync after scope destruction
	$scope.$on('$destroy', function(){
		TrainerFactory.unsyncModel();
	});
});