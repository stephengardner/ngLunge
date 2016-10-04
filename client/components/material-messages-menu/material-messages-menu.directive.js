myApp.directive('materialMessagesMenu', function($rootScope,
                                                 Chat,
                                                 MessagesMenu,
                                                 Auth,
                                                 $timeout,
                                                 $mdMedia,
                                                 $mdSidenav,
                                                 $state
){
	return {
		restrict : 'AE',
		replace : true, // necessary
		templateUrl : 'components/material-messages-menu/material-messages-menu.partial.html',
		controller : ['$scope', function($scope) {
			$scope.MessagesMenu = MessagesMenu;
			$scope.chatService = Chat;


			Auth.isLoggedInAsync(function() {
				$scope.isLockedOpen = function(){
					return $scope.routerState
						&& $mdMedia('gt-xs')
						&& $scope.routerState.current == "main.messages.message";
				};
				// only fire the get() once.  This was causing problems when firing HTTP request inside a massively run
				// $scope method.  I know it's dumb, it didn't work.
				$scope.$watch(function(){
					return $scope.isLockedOpen()
				}, function(newValue, oldValue) {
					if(newValue == true && newValue != oldValue) {
						Chat.get();
					}
				});
			});
			
			$scope.createHeadingId = function(name){
				return 'heading_' + name;
			};

			$scope.toggleLeft = MessagesMenu.toggleLeft;

			$scope.onAction = this.onAction = function(action) {
				MessagesMenu.toggleLeft();
				$scope.$eval(action);
			};
			$scope.getHref = this.getHref = function(state, options){
				if(state) {
					return $state.href(state, options);
				}
			};
		}]
	}
});