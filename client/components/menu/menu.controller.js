lungeApp.controller("MenuController", function(Auth, $scope, MenuService){
	//$scope.isMenuActive =
	Auth.isLoggedInAsync(function(){
		$scope.user = Auth.getCurrentUser();
		$scope.show = MenuService.show;
		$scope.hide = MenuService.hide;
		$scope.toggle = MenuService.toggle;
		$scope.menuItems = [
			{
				name : "Profile",
				icon : "fa-user",
				sref : "profilePage({urlName : '" + $scope.user.urlName + "'})"
			},
			{
				name : "Account",
				icon : "fa-cog",
				sref : "main.account"
			}
		];
	});
});