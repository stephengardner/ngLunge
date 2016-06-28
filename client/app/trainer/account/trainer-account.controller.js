lungeApp.controller("TrainerAccountController", function(TrainerFactory,
                                                         $timeout,
                                                         Menu,
                                                         Auth,
                                                         $scope){
	TrainerFactory.unset();
	// Set the trainerFactory for all subsequent "Account" routes.  Make sure to unsync after descruction

	if(Menu.isOpenLeft) {
		var unbindWatch = $scope.$watch(function(){
			return Menu.isOpenLeft
		}, function(newValue, oldValue){
			if(newValue === false) {
				getTrainer();
				unbindWatch();
			}
		});
	}
	else getTrainerWithTimeout();

	function getTrainerWithTimeout() {
		$timeout(function() {
			getTrainer();
		}, 50);
	}
	
	function getTrainer() {
		Auth.isLoggedInAsync(function () {
			if (Auth.getCurrentType() == "trainer") {
				$scope.trainerFactory = TrainerFactory;
				TrainerFactory.init(Auth.getCurrentUser(), {
					sync: true
				});
			}
			else {
				$scope.user = Auth.getCurrentUser();
			}
		});
	}

	// unsync after scope destruction
	$scope.$on('$destroy', function(){
		TrainerFactory.unsyncModel();
	});
});