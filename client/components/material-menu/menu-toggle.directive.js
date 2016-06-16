myApp.directive('menuToggle', [ '$timeout', 'Menu', function($timeout, Menu){
	return {
		scope: {
			section: '='
		},
		templateUrl: 'components/material-menu/menu-toggle.partial.html',
		link: function($scope, $element) {
			// var controller = $element.parent().controller();
			$scope.isOpen = function() {
				return Menu.isSectionSelected($scope.section);
			};
			$scope.toggle = function() {
				Menu.toggleSelectSection($scope.section);
			};
		}
	};
}])