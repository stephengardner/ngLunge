lungeApp.directive("autosize", function(){
	return {
		restrict : 'AE',
		priority : 9,
		controller : [function(){
			console.log("eAutosize Controller");
		}],
		compile: function compile(tElement, tAttrs, transclude) {
			return {
				pre: function preLink(scope, iElement, iAttrs, controller) {
					$(iElement).attr("e-style", "color : pink");
				}
			}
		}
	}
});