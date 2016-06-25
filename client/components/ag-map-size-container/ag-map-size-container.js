myApp.directive('agMapSizeContainer', function($window){
	return {
		restrict : 'AE',
		link : function(scope, element, attrs){
			angular.element($window).bind('resize', function(){
				setHeight();
				scope.$digest();
			});

			setHeight();
			function setHeight() {


				var windowHeight = $window.innerHeight,
					newHeight,
					halfWindowHeight = windowHeight / 2,
					maxHeight = 400,
					heightByWidthRatio = element.width() * .56,
					isMaxHeightGreaterThanHalfWindowHeight = maxHeight > halfWindowHeight,
					isNeWHeightGreaterThanMaxHeight = heightByWidthRatio > maxHeight
					;
				if(isNeWHeightGreaterThanMaxHeight) {
					newHeight = 400;
				}
				if(isMaxHeightGreaterThanHalfWindowHeight) {
					newHeight = halfWindowHeight;
				}
				console.log("It is:", newHeight);
				element.height(newHeight);

			}

		}
	}
})