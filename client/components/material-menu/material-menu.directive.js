myApp.directive('materialMenu', ['Menu', 'Auth', '$state', function(Menu, Auth, $state){
	return {
		restrict : 'E',
		replace : true, // necessary
		templateUrl : 'components/material-menu/menu.partial.html',
		controller : function($scope) {
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
			$scope.onAction = this.onAction = function(action) {
				// console.log("onAction()...");
				Menu.toggleLeft();
				$scope.$eval(action);
			};
			$scope.getHref = this.getHref = function(state, options){
				// console.log("getHref()...");
				if(state) {
					return $state.href(state, options);
				}
			};
			$scope.getSref = this.getSref = function(state, options){
				// console.log("getSref()...");
				if(!state) return $state.current.name || '-';
				if(options) {
					return '' + state + '(' + JSON.stringify(options) + ')';
				}
				else {
					return state;
				}
			};
		}
	}
}]);