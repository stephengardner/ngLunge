lungeApp.controller("MenuController", function($state, Auth, $scope, MenuService){
	//$scope.isMenuActive =
	Auth.isLoggedInAsync(function(){
		$scope.show = MenuService.show;
		$scope.hide = MenuService.hide;
		$scope.toggle = MenuService.toggle;
		$scope.user = Auth.getCurrentUser();
		$scope.goToProfile = function(){
			$scope.hide();
			if($scope.user.urlName) {
				$state.go("profilePage", {urlName : $scope.user.urlName});
			}
		};
		function setMenuItems() {
			$scope.menuItems = [
				{
					name : "Profile",
					icon : "fa-user"
				},
				{
					name : "Account",
					icon : "fa-cog",
					sref : "main.account"
				}
			];
		};
		setMenuItems();
		$scope.$watch(function(){ return Auth.getCurrentUser()}, function(user){
			$scope.user = user;
			setMenuItems();
		});

	});
});