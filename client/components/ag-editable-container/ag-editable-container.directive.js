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

lungeApp.directive("agEditableContainer", ['$animateCss', 'TrainerFactory', function($animateCss, TrainerFactory){
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

			scope.trainerFactorySection = false;
			scope.$watch(function(){
				return attrs.trainerFactorySection;
			}, function(newVal){
				scope.trainerFactorySection = scope.$eval(newVal);
			});
			scope.$watch(function(){
				return attrs.onEditableHide
			}, function(newVal){
				scope.onEditableHide = newVal;
			});

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
				var editingSectionAniamtion = $animateCss(editingContainer, {
					easing: easing,
					from: {
						opacity : 0,
						marginTop: -20 + 'px'
					},
					to: {
						opacity : 1,
						marginTop : 0 + "px"
					},
					duration : duration
				});
				animators = [];
				animators.push(containerAnimation, defaultSectionAnimation, editingSectionAniamtion);
				for(var i = 0; i < animators.length; i++) {
					animators[i].start();
				}
			}

			function hideEditingAnimation() {
				// setEditingHeight();
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
				var editingSectionAniamtion = $animateCss(editingContainer, {
					easing: easing,
					from: {
						marginTop : 0 + "px",
						opacity : 1
					},
					to: {
						marginTop: -20 + 'px',
						opacity : 0
					},
					duration : duration
				});
				animators = [];
				animators.push(containerAnimation, defaultSectionAnimation, editingSectionAniamtion);
				for(var i = 0; i < animators.length; i++) {
					animators[i].start();
				}
			}
			editingContainer.addClass('ng-hide');
			scope.toggleEditing = function(form){
				editing = !editing;
				scope.editing = editing;

				if(editing) {
					showEditingAnimation();
				}
				else {
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
				if(scope.trainerFactorySection) {
					if(!editing) {
						TrainerFactory.resetEditing(scope.trainerFactorySection);
					}
					TrainerFactory.setEditingOf(scope.trainerFactorySection, editing);
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