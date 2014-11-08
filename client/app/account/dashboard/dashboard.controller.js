lungeApp.controller("DashboardController",function($scope, Auth, User){
	$scope.user = Auth.getCurrentUser();

});