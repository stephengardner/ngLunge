lungeApp.controller("MenuButtonController", function($scope, MenuService, Auth){
	Auth.isLoggedInAsync(function(){
		$scope.user = Auth.getCurrentUser();
		$scope.show = MenuService.show;
		$scope.hide = MenuService.hide;
		$scope.toggle = MenuService.toggle;
	});
});
