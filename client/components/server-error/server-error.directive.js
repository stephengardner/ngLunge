/**
 * Removes server error when user updates input
 */
myApp
	.directive('serverError', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, ngModel) {
				element.on('keydown', function(){
					console.log("...server-error directive caught keydown...");
					ngModel.$setValidity('mongoose', true)
					if(ngModel) ngModel.$setValidity('mongoose', true);
					if(ngModel && attrs['serverError']) {
						console.log('setting ok for: ' + (attrs['serverError']));
						ngModel.$setValidity((attrs['serverError']), true);
					}
				});
			}
		};
	});