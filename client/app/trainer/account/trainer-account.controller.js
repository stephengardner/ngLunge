lungeApp.controller("AccountController", function(TrainerFactory, Sync, $timeout, Geocoder, AlertMessage,
                                                  $q, Auth, $scope){
	// Set the trainerFactory for all subsequent "Account" routes.  Make sure to unsync after descruction
	Auth.isLoggedInAsync(function(){
		if(Auth.getCurrentType() == "trainer") {
			$scope.trainerFactory = TrainerFactory;
			TrainerFactory.init(Auth.getCurrentUser(), {
				sync:true
			});
		}
		else {
			$scope.user = Auth.getCurrentUser();
		}
	});
	// unsync after scope destruction
	$scope.$on('$destroy', function(){
		TrainerFactory.unsyncModel();
	});
});