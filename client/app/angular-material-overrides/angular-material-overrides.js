
myApp.directive('mdSidenav', function(){
	return {
		restrict : 'AE',
		priority : -10000000000000000000000000,
		terminal : true,
		link : function(){
			// alert();
		}
	}
})
	// .controller('$mdSidenavController2', function(){});

/*
 * @private
 * @ngdoc controller
 * @name SidenavController
 * @module material.components.sidenav
 *
 */
function SidenavController($scope, $element, $attrs, $mdComponentRegistry, $q) {
	alert();
	var self = this;

	// Use Default internal method until overridden by directive postLink

	// Synchronous getters
	self.isOpen = function() { return !!$scope.isOpen; };
	self.isLockedOpen = function() { return !!$scope.isLockedOpen; };

	// Async actions
	self.open   = function() { return self.$toggleOpen( true );  };
	self.close  = function() { return self.$toggleOpen( false ); };
	self.toggle = function() { return self.$toggleOpen( !$scope.isOpen );  };
	self.$toggleOpen = function(value) { return $q.when($scope.isOpen = value); };

	self.destroy = $mdComponentRegistry.register(self, $attrs.mdComponentId);
}
// SidenavController.$inject = ["$scope", "$element", "$attrs", "$mdComponentRegistry", "$q"];

function SidenavDirective($mdMedia, $mdUtil, $mdConstant, $mdTheming, $animate, $compile, $parse, $log, $q, $document) {
	// alert();
	return {
		restrict: 'E',
		priority : 1,
		terminal : true,
		scope: {
			isOpen: '=?mdIsOpen'
		},
		controller: '$mdSidenavController',
		compile: function(element) {
			element.addClass('_md-closed');
			element.attr('tabIndex', '-1');
			return postLink;
		}
	};

	/**
	 * Directive Post Link function...
	 */
	function postLink(scope, element, attr, sidenavCtrl) {
		var lastParentOverFlow;
		var backdrop;
		var triggeringElement = null;
		var previousContainerStyles;
		var promise = $q.when(true);
		var isLockedOpenParsed = $parse(attr.mdIsLockedOpen);
		var isLocked = function() {
			return isLockedOpenParsed(scope.$parent, {
				$media: function(arg) {
					$log.warn("$media is deprecated for is-locked-open. Use $mdMedia instead.");
					return $mdMedia(arg);
				},
				$mdMedia: $mdMedia
			});
		};

		// Only create the backdrop if the backdrop isn't disabled.
		if (!angular.isDefined(attr.mdDisableBackdrop)) {
			backdrop = $mdUtil.createBackdrop(scope, "_md-sidenav-backdrop md-opaque ng-enter");
		}

		element.addClass('_md');     // private md component indicator for styling
		$mdTheming(element);

		// The backdrop should inherit the sidenavs theme,
		// because the backdrop will take its parent theme by default.
		if ( backdrop ) $mdTheming.inherit(backdrop, element);

		element.on('$destroy', function() {
			backdrop && backdrop.remove();
			sidenavCtrl.destroy();
		});

		scope.$on('$destroy', function(){
			backdrop && backdrop.remove();
		});

		scope.$watch(isLocked, updateIsLocked);
		scope.$watch('isOpen', updateIsOpen);


		// Publish special accessor for the Controller instance
		sidenavCtrl.$toggleOpen = toggleOpen;

		/**
		 * Toggle the DOM classes to indicate `locked`
		 * @param isLocked
		 */
		function updateIsLocked(isLocked, oldValue) {
			scope.isLockedOpen = isLocked;
			if (isLocked === oldValue) {
				element.toggleClass('_md-locked-open', !!isLocked);
			} else {
				$animate[isLocked ? 'addClass' : 'removeClass'](element, '_md-locked-open');
			}
			if (backdrop) {
				backdrop.toggleClass('_md-locked-open', !!isLocked);
			}
		}

		/**
		 * Toggle the SideNav view and attach/detach listeners
		 * @param isOpen
		 */
		function updateIsOpen(isOpen) {
			// Support deprecated md-sidenav-focus attribute as fallback
			var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element,'[md-sidenav-focus]') || element;
			var parent = element.parent();
			var parent = angular.element('body');
			console.log("PARENT:", parent);

			parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
			if (backdrop) backdrop[isOpen ? 'on' : 'off']('click', close);

			var restorePositioning = updateContainerPositions(parent, isOpen);

			if ( isOpen ) {
				// Capture upon opening..
				triggeringElement = $document[0].activeElement;
			}

			disableParentScroll(isOpen);

			return promise = $q.all([
				isOpen && backdrop ? $animate.enter(backdrop, parent) : backdrop ?
					$animate.leave(backdrop) : $q.when(true),
				$animate[isOpen ? 'removeClass' : 'addClass'](element, '_md-closed')
			]).then(function() {
				// Perform focus when animations are ALL done...
				if (scope.isOpen) {
					focusEl && focusEl.focus();
				}

				// Restores the positioning on the sidenav and backdrop.
				restorePositioning && restorePositioning();
			});
		}

		function updateContainerPositions(parent, willOpen) {
			var drawerEl = element[0];
			var scrollTop = parent[0].scrollTop;

			console.log("scrolltop:", scrollTop);

			if (willOpen && scrollTop) {
				previousContainerStyles = {
					top: drawerEl.style.top,
					bottom: drawerEl.style.bottom,
					height: drawerEl.style.height
				};

				// When the parent is scrolled down, then we want to be able to show the sidenav at the current scroll
				// position. We're moving the sidenav down to the correct scroll position and apply the height of the
				// parent, to increase the performance. Using 100% as height, will impact the performance heavily.
				var positionStyle = {
					top: scrollTop + 'px',
					bottom: 'initial',
					height: parent[0].clientHeight + 'px'
				};

				// Apply the new position styles to the sidenav and backdrop.
				element.css(positionStyle);
				backdrop.css(positionStyle);
			}

			// When the sidenav is closing and we have previous defined container styles,
			// then we return a restore function, which resets the sidenav and backdrop.
			if (!willOpen && previousContainerStyles) {
				return function() {
					drawerEl.style.top = previousContainerStyles.top;
					drawerEl.style.bottom = previousContainerStyles.bottom;
					drawerEl.style.height = previousContainerStyles.height;

					backdrop[0].style.top = null;
					backdrop[0].style.bottom = null;
					backdrop[0].style.height = null;

					previousContainerStyles = null;
				}
			}
		}

		/**
		 * Prevent parent scrolling (when the SideNav is open)
		 */
		function disableParentScroll(disabled) {
			var parent = element.parent();
			if ( disabled && !lastParentOverFlow ) {

				lastParentOverFlow = parent.css('overflow');
				parent.css('overflow', 'hidden');

			} else if (angular.isDefined(lastParentOverFlow)) {

				parent.css('overflow', lastParentOverFlow);
				lastParentOverFlow = undefined;

			}
		}

		/**
		 * Toggle the sideNav view and publish a promise to be resolved when
		 * the view animation finishes.
		 *
		 * @param isOpen
		 * @returns {*}
		 */
		function toggleOpen( isOpen ) {
			if (scope.isOpen == isOpen ) {

				return $q.when(true);

			} else {
				return $q(function(resolve){
					// Toggle value to force an async `updateIsOpen()` to run
					scope.isOpen = isOpen;

					$mdUtil.nextTick(function() {
						// When the current `updateIsOpen()` animation finishes
						promise.then(function(result) {

							if ( !scope.isOpen ) {
								// reset focus to originating element (if available) upon close
								triggeringElement && triggeringElement.focus();
								triggeringElement = null;
							}

							resolve(result);
						});
					});

				});

			}
		}

		/**
		 * Auto-close sideNav when the `escape` key is pressed.
		 * @param evt
		 */
		function onKeyDown(ev) {
			var isEscape = (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE);
			return isEscape ? close(ev) : $q.when(true);
		}

		/**
		 * With backdrop `clicks` or `escape` key-press, immediately
		 * apply the CSS close transition... Then notify the controller
		 * to close() and perform its own actions.
		 */
		function close(ev) {
			ev.preventDefault();

			return sidenavCtrl.close();
		}

	}
}
// SidenavDirective.$inject = ["$mdMedia", "$mdUtil", "$mdConstant", "$mdTheming", "$animate", "$compile", "$parse", "$log", "$q", "$document"];
