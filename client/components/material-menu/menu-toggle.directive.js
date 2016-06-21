myApp.directive('menuToggle', [ '$timeout', 'Menu', '$state', function($timeout, Menu, $state){
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
			$scope.isStateInsideToggledSection = function(section) {
				for(var i = 0; i < section.pages.length; i++) {
					var page = section.pages[i];
					if($state.includes(page.state)) {
						return true;
					}
				}
				return false;
			};
			$scope.toggle = function() {
				Menu.toggleSelectSection($scope.section);
			};
		}
	};
}])