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
					if(ngModel) ngModel.$setValidity('mongoose', true);
				});
			}
		};
	});