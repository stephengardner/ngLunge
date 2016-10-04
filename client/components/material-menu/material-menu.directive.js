myApp.directive('materialMenu', ['Menu', 'Auth', '$state', function(Menu, Auth, $state){
	return {
		restrict : 'AE',
		replace : true, // necessary
		templateUrl : 'components/material-menu/menu.partial.html',
		controller : ['$scope', function($scope) {
			$scope.Menu = Menu;
			$scope.createHeadingId = function(name){
				return 'heading_' + name;
			};
			$scope.user = Auth.getCurrentUser();
			$scope.goToProfile = function(){
				if($scope.user.urlName) {
					$state.go("profilePage", {urlName : $scope.user.urlName});
				}
			};
			$scope.onAction = this.onAction = function(action, options, event) {
				Menu.toggleLeft();
				if(options && options.href) {
					$window.open(options.href, "_self");
				}
				$scope.$eval(action);
			};
			$scope.getHref = this.getHref = function(state, options){
				if(state) {
					return $state.href(state, options);
				}
			};

			$scope.$watch(function(){
				return Auth.isLoggedIn();
			}, function(newValue, oldValue) {
				if(newValue !== oldValue)
					Menu.refreshLinks();
			});
			$scope.getSref = this.getSref = function(state, options){
				if(!state) return $state.current.name || '-';
				if(options)
					return '' + state + '(' + JSON.stringify(options) + ')';
				return state;
			};
		}]
	}
}]);