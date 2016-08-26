lungeApp.directive('agEditableEditing', function(){
	return {
		restrict : 'AEC',
		link : function(scope, element, attrs) {
			// necessary to hide this.  Sometimes the element is not available immediately from the
			// agEditableContainer directive
			element.addClass('ng-hide');
		}
	}
});

lungeApp.directive("agEditableTraineeContainer", ['$animate', '$q', '$animateCss', function($animate, $q, $animateCss){
	return {
		restrict : "AE",
		link : function(scope, element, attrs) {
			var container = angular.element(element[0].querySelector('.ag-editable-container')),
				containerHeightDefault = container.prop('offsetHeight'),
				containerHeightEditing,
				editingContainer = angular.element(element[0].querySelector('.ag-editable-editing')),
				defaultContainer = angular.element(element[0].querySelector('.ag-editable-default')),
				editing,
				duration = .5,
				easing = 'ease-in-out',
				animators
				;
			function setContainers() {
				container = angular.element(element[0].querySelector('.ag-editable-container')),
				containerHeightDefault = container.prop('offsetHeight'),
				containerHeightEditing,
				editingContainer = angular.element(element[0].querySelector('.ag-editable-editing')),
				defaultContainer = angular.element(element[0].querySelector('.ag-editable-default'))
			}

			function setDefaultHeight() {
				containerHeightDefault = container.prop('offsetHeight');
			}

			function setEditingHeight() {
				editingContainer.addClass('ag-editable-preparing');
				editingContainer.removeClass('ng-hide');
				editingContainerHeightDefault = editingContainer.prop('offsetHeight');
				containerHeightEditing = editingContainerHeightDefault;
				editingContainer.addClass('ag-editable-showing');
				editingContainer.removeClass('ag-editable-preparing');
			}

			function showEditingAnimation() {
				setContainers();
				setDefaultHeight();
				setEditingHeight();
				console.log("Animating from " + containerHeightDefault + "px to " + containerHeightEditing + "px");
				console.log("EditingSectition", containerHeightEditing);
				editingContainer.removeClass('ng-hide');
				// $animate.removeClass(editingContainer, 'ng-hide');
				console.log("Editing container is:", editingContainer);
				var containerAnimation = $animateCss(container, {
					easing: easing,
					from: {
						height: containerHeightDefault + 'px'
					},
					to: {
						height : containerHeightEditing + "px"
					},
					duration : duration
				});
				var defaultSectionAnimation = $animateCss(defaultContainer, {
					easing: easing,
					from: {
						top : 0 + 'px',
						opacity : 1
					},
					to: {
						top : -20 + 'px',
						opacity : 0
					},
					duration : duration
				});
				var editingSectionAnimation = $animateCss(editingContainer, {
					easing: easing,
					from: {
						pointerEvents : 'none',
						opacity : 0,
						marginTop: -20 + 'px'
					},
					to: {
						pointerEvents : 'all',
						opacity : 1,
						marginTop : 0 + "px"
					},
					duration : duration
				});
				animators = [];
				animators.push(
					containerAnimation.start(),
					defaultSectionAnimation.start(),
					editingSectionAnimation.start()
				);
				$q.all(animators).then(function(){});
			}

			function hideEditingAnimation() {
				editingContainer.blur(); // blur the element if you're on a phone and something hides this
				var containerAnimation = $animateCss(container, {
					addClass: 'hide-editing',
					removeClass : 'show-editing',
					easing: easing,
					from: {
						height : containerHeightEditing + "px"
					},
					to: {
						height: containerHeightDefault + 'px'
					},
					duration : duration
				});
				var defaultSectionAnimation = $animateCss(defaultContainer, {
					easing: easing,
					from: {
						opacity : 0,
						top : -20 + 'px'
					},
					to: {
						opacity : 1,
						top : 0 + 'px'
					},
					duration : duration
				});
				var editingSectionAnimation = $animateCss(editingContainer, {
					easing: easing,
					from: {
						pointerEvents : 'none',
						marginTop : 0 + "px",
						opacity : 1
					},
					to: {
						pointerEvents : 'none',
						marginTop: -20 + 'px',
						opacity : 0
					},
					duration : duration
				});
				animators = [];
				animators.push(
					containerAnimation.start(),
					defaultSectionAnimation.start(),
					editingSectionAnimation.start()
				);
				$q.all(animators).then(function(){
					editingContainer.addClass('ng-hide');
				});
			}
			editingContainer.addClass('ng-hide');

			scope.userFactorySection = attrs.userFactorySection;
			
			scope.userFactory = scope.$eval(attrs.userFactory);
			
			var section = scope.$eval(attrs.userFactorySection);
			
			scope.$watch(function(){
				return scope.userFactory.isEditing[section]
			}, function(newValue, oldValue) {
				if(!newValue && scope.editing) {
					scope.editing = false;
					hideEditingAnimation();
				}
				else if(newValue && !scope.editing) {
					scope.editing = true;
					showEditingAnimation();
				}
			});

			scope.toggleEditing = function(form){
				editing = !editing;
				scope.editing = editing;

				if(editing) {
					showEditingAnimation();
				}
				else {
					scope.userFactory.resetEditing(scope.userFactorySection);
					hideEditingAnimation();
				}
				if(!editing){
					if(scope.onEditableHide) {
						console.log("Calling scope.onEditableHide which is:", scope.onEditableHide);
						scope.$eval(scope.onEditableHide);
					}
					else if(scope.reset) {
						// allow scope.reset to be handled by the controller
						scope.reset();
					}
				}
			}
		}
	}
}]);

myApp.animation('.ag-editable-showing', function() {
	return {
		addClass : function(element, done) {
			alert();
		}
	}
});