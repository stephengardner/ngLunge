myApp.directive("validateOnBlur", [function() {
	var ddo = {
		restrict: "A",
		require: "ngModel",
		scope: {},
		link: function(scope, element, attrs, modelCtrl) {
			element.on('blur', function () {
				modelCtrl.$showValidationMessage = modelCtrl.$dirty;
				scope.$apply();
			});
		}
	};
	return ddo;
}]);