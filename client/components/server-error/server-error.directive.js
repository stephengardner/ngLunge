/**
 * Removes server error when user updates input
 */
myApp
	.directive('serverError', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, ngModel) {
				// added this secondarily... Allows me to watch without a keydown
				scope.$watch(function(){
					return ngModel.$modelValue;
				}, function(newValue, oldValue) {
					if(newValue !== oldValue) {
						setOk();
					}
				});

				element.on('keydown', function(){
					console.log("...server-error directive caught keydown...");
					setOk();
				});

				function setOk() {
					ngModel.$setValidity('mongoose', true)
					if(ngModel) ngModel.$setValidity('mongoose', true);
					if(ngModel && attrs['serverError']) {
						console.log('setting ok for: ' + (attrs['serverError']));
						ngModel.$setValidity((attrs['serverError']), true);
					}
				}
			}
		};
	});