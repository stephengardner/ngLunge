myApp.service('ngCopy', ['$window', function ($window) {
	var body = angular.element($window.document.body);
	var textarea = angular.element('<textarea/>');
	textarea.css({
		position: 'fixed',
		opacity: '0'
	});

	return function (toCopy) {
		textarea.val(toCopy);
		body.append(textarea);
		textarea[0].select();

		try {
			var successful = document.execCommand('copy');
			if (!successful) throw successful;
		} catch (err) {
			window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
		}

		textarea.remove();
		return !!successful;// ? true : false;
	}
}])
	.directive('ngClickCopy', ['ngCopy', function (ngCopy) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('click', function (e) {
					var success = ngCopy(attrs.ngClickCopy);
					if(success && attrs.onSuccess) {
						scope.$eval(attrs.onSuccess);
					}
				});
			}
		}
	}]);