lungeApp.directive('agEditableEditing2', function(){
	return {
		restrict : 'AEC',
		link : function(scope, element, attrs) {
			// necessary to hide this.  Sometimes the element is not available immediately from the
			// agEditableContainer directive
			element.addClass('ng-hide');
		}
	}
});

lungeApp.directive("agEditableContainer2", ['$animate', '$q', '$animateCss', function($animate, $q, $animateCss){
	return {
		restrict : "AE",
		scope : {
			editing : '='
		},
		link : function(scope, element, attrs) {
			var container = angular.element(element[0].querySelector('.ag-editable-container-2')),
				containerHeightDefault = $(container).outerHeight(true),//.prop('offsetHeight'),
				containerHeightEditing,
				editingContainer = angular.element(element[0].querySelector('.ag-editable-editing-2')),
				defaultContainer = angular.element(element[0].querySelector('.ag-editable-default-2')),
				editing,
				duration = .5,
				easing = 'ease-in-out',
				animators
				;

			function setContainers() {
				container = angular.element(element[0].querySelector('.ag-editable-container-2')),
				containerHeightDefault = $(container).outerHeight(true);//.prop('offsetHeight'),
				containerHeightEditing,
				editingContainer = angular.element(element[0].querySelector('.ag-editable-editing-2')),
				defaultContainer = angular.element(element[0].querySelector('.ag-editable-default-2'))
			}

			function setDefaultHeight() {
				containerHeightDefault = $(container).outerHeight(true);//.prop('offsetHeight');
			}

			function setEditingHeight() {
				// editingContainer.addClass('ag-editable-preparing');
				editingContainer.removeClass('ng-hide');
				editingContainerHeightDefault = $(editingContainer).outerHeight(true);//.prop('offsetHeight');
				containerHeightEditing = editingContainerHeightDefault;
				// editingContainer.addClass('ag-editable-showing');
				// editingContainer.removeClass('ag-editable-preparing');
			}

			function getHeightsOnOpen() {
				defaultContainer.addClass('ag-set-absolute-to-get-height');
				containerHeightDefault = $(defaultContainer).outerHeight(false);//.prop('offsetHeight');
				defaultContainer.removeClass('ag-set-absolute-to-get-height');

				defaultContainer.addClass('ag-editable-closing');

				editingContainer.removeClass('ng-hide');

				editingContainer.addClass('ag-set-absolute-to-get-height');
				containerHeightEditing = $(editingContainer).outerHeight(false);//.prop('offsetHeight');
				editingContainer.removeClass('ag-set-absolute-to-get-height');

				editingContainer.addClass('ag-editable-showing');
			}

			function getHeightsOnClose2() {
				defaultContainer.removeClass('ng-hide');

				defaultContainer.addClass('ag-set-absolute-to-get-height');
				containerHeightDefault = $(defaultContainer).outerHeight(false);//.prop('offsetHeight');
				defaultContainer.removeClass('ag-set-absolute-to-get-height');

				defaultContainer.addClass('ag-editable-showing');

				editingContainer.addClass('ag-set-absolute-to-get-height');
				containerHeightEditing = $(editingContainer).outerHeight(false);//.prop('offsetHeight');
				editingContainer.removeClass('ag-set-absolute-to-get-height');

				editingContainer.addClass('ag-editable-closing');
			}

			function getHeightsOnClose() {
				defaultContainer.addClass('ag-editable-closing');
				// editingContainer.removeClass('ag-editable-closing');
				// editingContainer.addClass('ag-editable-closing');
				containerHeightEditing = $(container).outerHeight(true);//.prop('offsetHeight');
				// editingContainer.removeClass('ag-editable-closing');
				// defaultContainer.addClass('ag-editable-closing');
				containerHeightDefault = $(defaultContainer).outerHeight(true);//.prop('offsetHeight');
				// defaultContainer.removeClass('ag-editable-closing');
				// editingContainer.removeClass('ag-editable-closing');
			}

			function showEditingAnimation() {
				// setContainers();
				// setDefaultHeight();
				// setEditingHeight();
				getHeightsOnOpen();
				console.log("[AgEditableContainer] Animating from " +
					containerHeightDefault + "px to " + containerHeightEditing + "px");
				// return;
				editingContainer.removeClass('ng-hide');
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
				$q.all(animators).then(function(){
					if(scope.editing) {
						$(container).css({height : 'auto'});
						defaultContainer.addClass('ng-hide');
						defaultContainer.removeClass('ag-editable-closing');
						editingContainer.removeClass('ag-editable-showing');
					}
				});
			}

			function hideEditingAnimation() {
				getHeightsOnClose2();
				console.log("[AgEditableContainer] Animating from " +
					containerHeightEditing + "px to " + containerHeightDefault + "px");
				defaultContainer.removeClass('ng-hide');
				// return;
				// $(defaultContainer).css({position : 'relative'});
				// $(editingContainer).css({position : 'absolute'});
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
					if(!scope.editing) {
						$(container).css({height : 'auto'});
						editingContainer.addClass('ng-hide');
						editingContainer.removeClass('ag-editable-closing');
						defaultContainer.removeClass('ag-editable-showing');
					}
				});
			}
			editingContainer.addClass('ng-hide');

			// scope.section = attrs.section;
			// var section = scope.$eval(attrs.section);

			scope.$watch(function(){
				return scope.editing
			}, function(newValue, oldValue) {
				// necessary to check if oldValue is undefined, it gets changed a little bit and this could cause
				// too many animations firing
				// alert("switching to:" +  newValue + ' from : ' + scope.editing);
				if(newValue != oldValue) {
					scope.toggleEditing();
				}
			});

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