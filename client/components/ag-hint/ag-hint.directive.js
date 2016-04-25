lungeApp.directive("agHint", function(){
	return {
		restrict : "AE",
		transclude : true,
		replace: true,
		template : '<div class="ag-hint" ng-class="{\'on-focus\' : onFocus}" >' +
		'<ng-transclude></ng-transclude>' +
		'</div>',
		link : function(scope, elem, attrs) {
			scope.onFocus = attrs.onFocus ? true : false;
			console.log("The attrs for this hint are: ", attrs);

		}
	}
})