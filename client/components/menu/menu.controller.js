lungeApp.controller("MenuController", function($state, Auth, $scope, MenuService){
	//$scope.isMenuActive =
	Auth.isLoggedInAsync(function(){
		$scope.show = MenuService.show;
		$scope.hide = MenuService.hide;
		$scope.toggle = MenuService.toggle;
		$scope.user = Auth.getCurrentUser();
		$scope.goToProfile = function(){
			alert("going to profile");
			$scope.hide();
			if($scope.user.urlName) {
				$state.go("profilePage", {urlName : $scope.user.urlName});
			}
		};
		function setMenuItems() {
			$scope.menuItems = [
				{
					name : Auth.getCurrentUser().name ? Auth.getCurrentUser().name.first : 'Profile',
					icon : "fa-user",
					sref : 'profile'
					//sref : 'profilePage({urlName : \'' + Auth.getCurrentUser().urlName + '\'})'
				},
				{
					name : "Account",
					icon : "fa-cog",
					sref : "main.trainer.account.edit-profile"
				},
				//{
				//	name : "Add Certifications",
				//	icon : "fa-certificate",
				//	sref : "main.trainer.account.certifications"
				//},
				{
					name : "Certifications",
					icon : "fa-trophy",
					sref : "main.trainer.account.certifications"
				},
				{
					name : 'Logout',
					icon : 'fa-power-off',
					action : 'logout()'
				}
			];
		};

		$scope.getSref = function(state){
			//console.log("State is:", $state);
			return state ? state : $state.current.name;
		};

		$scope.onAction = function(action) {
			$scope.hide();
			$scope.$eval(action);
		}
		setMenuItems();
		$scope.$watch(function(){ return Auth.getCurrentUser()}, function(user){
			$scope.user = user;
			setMenuItems();
		});
		$scope.isMenuActive = function(){
			return MenuService.active;
		}

	});
});