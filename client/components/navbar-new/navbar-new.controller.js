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
	'$mdSidenav',
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
	         $mdSidenav,
	         MessagesMenu
	){
		Auth.isLoggedInAsync(function(){
			$scope.getCurrentUser = Auth.getCurrentUser;
		});

		$scope.messagesMenuIsLockedOpen = $mdSidenav('messages').isLockedOpen;

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
			if($scope.isOnProfilePage && Auth.isLoggedIn()) {
				$scope.showShareButton = true;
			}
		});

		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.getCurrentUser = Auth.getCurrentUser;
		$scope.getCurrentType = Auth.getCurrentType;

		$scope.logout = function() {
			Auth.logout();
			$location.path('/login');
		};
		
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