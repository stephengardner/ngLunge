lungeApp.controller("NavbarNewController", ['$rootScope', '$location', '$window', '$scope', '$location', 'Auth', function($rootScope, $location, $window, $scope, $location, Auth){
	$scope.getCurrentUser = Auth.getCurrentUser;

	// check scrolled and do scope apply on home page scrolling
	angular.element($window).bind("scroll", function() {
		if($location.path() == "/"){
			if (this.pageYOffset >= 100) {
				$scope.scrolled = true;
			} else {
				$scope.scrolled = false;
			}
			$scope.$apply();
		}
	});

	// check page and scrolled on page changes
	$rootScope.$on('$locationChangeSuccess', function (event, next) {
		checkPageAndScrolled();
	});

	// check page and scrolled on load
	checkPageAndScrolled();

	// helper function, check location path and scroll distance
	function checkPageAndScrolled() {
		if($location.path() == "/"){
			if(window.pageYOffset < 100){
				$scope.scrolled = false;
			}
			$rootScope.spaced = false;
		}
		else {
			$rootScope.spaced = true;
			$scope.scrolled = true;
		}
	}
	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.isAdmin = Auth.isAdmin;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$scope.logout = function() {
		Auth.logout();
		$location.path('/login');
	};

}]);