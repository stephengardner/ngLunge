myApp.directive('agCollapseContainer', function($animateCss){
	return {
		restrict: 'AE',
		controller : ['$scope', function($scope){
			this.collapsed = true;
			this.toggleCollapsed = function(){
				this.collapsed = !this.collapsed;
				$scope.collapsed = this.collapsed;
			};
		}],
		link : function(scope, element, attrs) {
			scope.collapsed = true;
			var bodyHeight,
				animating = false,
				animation,
				duration = .4
			;
			var body = angular.element(element[0].querySelector('.ag-collapse-body'));
			body.wrap('<div class="ag-collapse-body-wrapper" style="overflow:hidden"></div>');
			body.addClass('ng-hide');
			function doAnimation(){
				if(animating) return;
				animating = true;
				if(!scope.collapsed) {
					body.css('height', 'auto');//.$set('style', "height: auto");
					body.removeClass('ng-hide');
					bodyHeight = body.prop('offsetHeight');
					var animation = $animateCss(body, {
						easing: 'ease-in-out',
						from: {
							top : -20 + 'px',
							height : 0 + 'px',
							opacity : 0
						},
						to: {
							top : 0 + 'px',
							height : bodyHeight + 'px',
							opacity : 1
						},
						duration : duration
					});
				}
				else {
					body.removeClass('ng-hide');
					bodyHeight = body.prop('offsetHeight');
					animation = $animateCss(body, {
						easing: 'ease-in-out',
						from: {
							top : 0 + 'px',
							height : bodyHeight + 'px',
							opacity : 1
						},
						to: {
							top : -20 + 'px',
							height : 0 + 'px',
							opacity : 0
						},
						duration : duration
					});
				}

				animation.start().then(function(){
					animating = false;
					// alert("HEIGHT:");
					if(!scope.collapsed) {
						body.css('height', 'auto');
					}
				});
			}
			scope.$watch(function(){
				return scope.collapsed
			}, function(oldValue, newValue){
				if(oldValue !== newValue)
				doAnimation();
			});
		}
	};
});

myApp.directive('agCollapseHeader', function(){
	return {
		restrict : 'AE',
		require : '^agCollapseContainer',
		link : function(scope, element, attrs, ctrl) {
			element.on('click', function(){
				ctrl.toggleCollapsed();
				scope.$apply();
			});
		}
	}
});

myApp.directive('agCollapseBody', function(){
	return {
		restrict : 'AE',
		require : '^agCollapseContainer',
		link : function(scope, element, attrs) {
			element.addClass('ag-collapse-body ng-hide');
		}
	}
});