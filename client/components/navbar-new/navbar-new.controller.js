lungeApp.controller("NavbarNewController", ['TrainerFactory',
	'$timeout',
	'MenuService',
	'$state',
	'$rootScope',
	'$location',
	'$window',
	'$scope',
	'Auth',
	'Menu',
	'Chat',
	'MessagesMenu',
	function(TrainerFactory,
	         $timeout,
	         MenuService,
	         $state,
	         $rootScope,
	         $location,
	         $window,
	         $scope,
	         Auth,
	         Menu,
	         Chat,
	         MessagesMenu
	){
		Auth.isLoggedInAsync(function(){
			$scope.getCurrentUser = Auth.getCurrentUser;
		});

		$scope.getUnreadMessageCount = function(){
			var count;
			try {
				count = Auth.getCurrentUser().notifications.count.chat;
			}
			catch(err) {
				console.log(err);
			}
			return count;
		};


		$scope.toggleMenu = Menu.toggleLeft;
		$scope.toggleMessagesMenu = MessagesMenu.toggleLeft;

		$scope.$watch(function(){
			return $state.current.name
		}, function(toState, fromState){
			$scope.isOnProfilePage = toState.indexOf('profilePage') != -1;
			$scope.isOnAdminPage = toState.indexOf('admin') != -1;
			if($scope.isOnProfilePage) {
				$scope.showShareButton = true;
			}
		});

		$scope.$watch(function(){
			return Auth.getCurrentUser()._id
		}, function(newValue, oldValue) {
			console.log("navbar new auth getcurrentuser watch newvalue:", newValue);
			if(!newValue) {
				$scope.showShareButton = false;
			}
		});

		//console.log($location.path().indexOf("admin"));//.includes('admin'));
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
			// alert("destroying the navbar scope");
			//socket.unsync.user("trainer", Auth.getCurrentUser());
		});


		// check page and scrolled on page changes
		$rootScope.$on('$locationChangeSuccess', function (event, next) {
			setSpaced();
		});

		// set spaced on load
		setSpaced();

		// helper function, set spaced
		function setSpaced() {
			if($location.path() == "/"){
				$rootScope.spaced = false;
			}
			else {
				$rootScope.spaced = true;
				$scope.scrolled = true;
			}
		}
	}]);