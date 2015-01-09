lungeApp.controller("NavbarNewController", ['MenuService', 'socket', '$state', '$rootScope', '$location', '$window', '$scope',
	'$location', 'Auth', function(MenuService, socket, $state, $rootScope, $location, $window, $scope, $location, Auth){
	$scope.getCurrentUser = Auth.getCurrentUser;

	$scope.isAdminPage = function(){
		return $location.path().indexOf('admin') == 1;
	};
	console.log($location.path().indexOf("admin"));//.includes('admin'));
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
	$scope.getCurrentType = Auth.getCurrentType;

	// when a login event is fired from a sibling controller, app.js broadcasts this in a route change
	// since the navbar will not catch a route change because it typically doesn't repaint, we catch this event here
	$scope.$on("login", function(){
		console.log("CAUGHT LOGIN");
		$scope.isLoggedIn = Auth.isLoggedIn;
		console.log("Navbar login is now: ", Auth.isLoggedIn);
		$scope.isLoggedIn = Auth.isLoggedIn;
	})

	$scope.logout = function() {
		Auth.logout();
		$location.path('/login');
	};

	$scope.$on("$destroy", function(){
		alert("destroying the navbar scope");
		socket.unsync.user("trainer", Auth.getCurrentUser());
	});
	/*
	socket.syncLogin('trainer', function(event, newTrainer) {
		console.log("LOGIN EVENT, NEW TRAINER: ", newTrainer);
	});
	*/

}]);