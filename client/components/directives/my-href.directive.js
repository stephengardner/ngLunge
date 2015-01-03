lungeApp.directive('myHref', function($parse) {
	return {
		restrict: 'AE',
		scope : true,
		link: function(scope, element, attrs) {
			var url = scope.$eval(attrs.myHref);
			element.attr('href', url);
		}
	}
});