myApp.directive('menuLink', function (Auth) {
	return {
		require : '^materialMenu',
		scope: {
			section: '='
		},
		templateUrl: 'components/material-menu/menu-link.partial.html',
		link: {
			pre : function (scope, element, attrs, materialMenu) {
				var controller = element.parent().controller();
				scope.auth = Auth;
				scope.getHref = materialMenu.getHref;
				scope.getSref = materialMenu.getSref;
				scope.onAction = materialMenu.onAction;
				scope.goToProfile = materialMenu.goToProfile;
			}
		}
	};
})