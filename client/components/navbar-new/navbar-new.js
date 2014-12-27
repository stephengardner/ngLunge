lungeApp.run(function($window, $rootScope, $location){
	$rootScope.$on('$stateChangeSuccess', function (event, next) {
		if($location.path() == "/"){

			//if(angular.element($window).pageYOffset < 100){
			//	$scope.scrolled = false;
			//}
			//$rootScope.spaced = false;
		}
		else {
			//$rootScope.spaced = true;
		}
	});
});