myApp.directive('agOnEnter', function() {
	return {
		scope : {
			'agOnEnter' : '&'
		},
		link : function(scope, element, attrs) {
			element.bind("keydown", function(e) {
				if(e.which === 13) {
					scope.agOnEnter({ e : e });
				}
			});
		}
	};
});
myApp.directive('messageContainer', function($window, lodash, $timeout, Auth, User){
	function markMessageRead(message) {
		console.log("[Message Container] marking message read:", message.message);
		User.markMessageRead({
			id : Auth.getCurrentUser()._id,
			messageId : message._id
		}, function(response){
		}, function(err){
		})
	}
	return {
		restrict : 'AE',
		controller : ['$scope', function($scope) {
		}],
		link : {
			pre : function(scope, element, attrs, ctrl){
				var initialized,
					containerHeight,
					scrollPosition,
					viewportHeight,
					pos,
					percentOfElementNeededInView = .7,
					viewportShorterThanElement = false
					;

				var container = scope.container = $(element);
				scope.messageElements = ctrl.customMessageObjects = [];

				var onScroll = ctrl.onScroll = function() {
					if(!scope.windowFocused) return;
					pos = containerScrollPos = container[0].scrollTop;
					viewportHeight =  $(element).outerHeight();
					containerHeight = scope.containerHeight = scope.container.outerHeight();
					scrollPosition = scope.position = scope.container[0].scrollTop;

					for(var i = 0; i < ctrl.customMessageObjects.length; i++) {
						var customMessageObject = ctrl.customMessageObjects[i],
							shouldAttachScrollSpyEvent = customMessageObject.message.sendEventWhenSeen == true,
							topOffset = messageOffsetTop = customMessageObject.element[0].offsetTop,
							elementHeight = $(customMessageObject.element)[0].offsetHeight
							;
						if(shouldAttachScrollSpyEvent) {
							// console.log('elementHeight:', elementHeight,
							// 	" containerScrollPos: ", containerScrollPos,
							// 	" viewportHeight: ", viewportHeight,
							// 	" messageOffsetTop: ", messageOffsetTop
							// );
							if (!customMessageObject.scrolledOutOfView) {
								var messageScrolledOutOfView =
									containerScrollPos + viewportHeight < messageOffsetTop
									|| containerScrollPos > messageOffsetTop + elementHeight;
								if (messageScrolledOutOfView) {
									customMessageObject.scrolledOutOfView = true;
									customMessageObject.scrolledIntoView = false;
								}
							}
							var messageIsInView = (
									containerScrollPos + viewportHeight
									>=
									messageOffsetTop + (percentOfElementNeededInView * elementHeight)
									&& messageOffsetTop > containerScrollPos
								)
								||
								(
									containerScrollPos >= messageOffsetTop
									&& viewportShorterThanElement
								)
								||
								(
									// added by augie, if theres no scroll
									containerScrollPos == 0
									&& viewportHeight < messageOffsetTop
									&& viewportHeight + elementHeight > messageOffsetTop
								);

							if (messageIsInView) {
								// element First Scrolled Into View
								if (!customMessageObject.firstScrolledIntoView) {
									customMessageObject.firstScrolledIntoView = true;
									markMessageRead(customMessageObject.message);
									customMessageObject.message.isNew = false;

									customMessageObject.message.sendEventWhenSeen = false;
									// console.log("First Scrolled Into View for customMessage: ",
									// 	customMessageObject.message);
								}
								// element Scrolled Into View
								if (!customMessageObject.scrolledIntoView) {
									customMessageObject.scrolledIntoView = true;
									customMessageObject.scrolledOutOfView = false;
								}
							}
						}
					}
				}.bind(this);
				scope.windowFocused = document.hasFocus();
				var debounced = lodash.debounce(onScroll, 50);

				// not debouncing this because I don't want to lose any checks for if message is read or not as
				// it passes through the viewport on a fast scroll
				scope.container[0].onscroll = onScroll;

				angular.element($window).on( "focus", function() {
					scope.windowFocused = true;
					onScroll();
				});
				angular.element($window).on("blur", function(){
					scope.windowFocused = false;
				});
			}
		}
	}
});


myApp.directive('chatMessage', function($timeout, lodash) {
	return {
		restrict : 'AE',
		require : '^?messageContainer',
		link : function(scope, element, attrs, ctrl) {
			var message = scope.$eval(attrs.chatMessage);
			ctrl.customMessageObjects.push({
				scrolledIntoView : false,
				scrolledOutOfView : false,
				firstScrolledIntoView : false,
				element : element,
				message : message
			});
			$timeout(function(){
				ctrl.onScroll();
			}, 1000);
		}
	}
});
/*

 myApp.directive('agScrollSpy', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
 return {
 restrict: 'A',
 link: function ($scope, $el, $attrs) {
 if(!$scope.$eval($attrs.registerSpyEvent)) {
 console.log("Not registering spy event because it is already seen!");
 return;
 }
 else {
 console.log("RegisterSpyEvent = ", $scope.$eval($attrs.registerSpyEvent));
 }
 if(!$attrs.container) {
 throw Error('agScrollSpy directive must specify a container');
 }
 var container = $($attrs.container);
 function ScrollSpy() {
 var self = this,
 initialized = false,
 viewportHeight,
 elementHeight,
 topOffset,
 elementFirstScrolledIntoView = false,
 elementScrolledIntoView = false,
 elementScrolledOutOfView = false,
 doc = document.documentElement,
 id = $attrs.id || 'unknown element',
 target = $($el)[0],
 viewportShorterThanElement = false,
 percentOfElementNeededInView = 1;

 // onscroll
 this.determinePosition = function () {
 if (initialized) {
 var pos = (container[0].scrollTop);
 // element Scrolled Out Of View
 if (!elementScrolledOutOfView) {
 if (pos + viewportHeight < topOffset || pos > topOffset + elementHeight) {
 // $log.debug('element Scrolled Out Of View '+id);
 elementScrolledOutOfView = true;
 elementScrolledIntoView = false;
 $rootScope.$broadcast('elementScrolledOutOfView', id);
 }
 }
 if ((pos + viewportHeight >= topOffset + percentOfElementNeededInView * elementHeight
 && topOffset > pos) ||
 (pos >= topOffset && viewportShorterThanElement)) {
 // element First Scrolled Into View
 if (!elementFirstScrolledIntoView) {
 // $log.debug('element First Scrolled Into View '+id);
 elementFirstScrolledIntoView = true;
 $rootScope.$broadcast('elementFirstScrolledIntoView', id);
 }
 // element Scrolled Into View
 if (!elementScrolledIntoView) {
 // $log.debug('element Scrolled Into View '+id);
 elementScrolledIntoView = true;
 elementScrolledOutOfView = false;
 $rootScope.$broadcast('elementScrolledIntoView', id);
 }
 }
 }
 };
 this.takeMeasurements = function () {
 viewportHeight = container.outerHeight();
 elementHeight = target.offsetHeight;
 topOffset = target.offsetTop;
 // $log.debug('take measurements for '+$attrs.id+'- viewportHeight:'+viewportHeight+', element height: '+elementHeight+', top offset: '+topOffset);
 if (viewportHeight < elementHeight) viewportShorterThanElement = true;

 // determine position on page load
 initialized = true;
 self.determinePosition();
 };
 // wait for dom to render so correct measurements can be taken
 var waitForRender = setInterval(function () {
 if (target.offsetHeight > 2) { // IE11  reports 2 at times...
 clearTimeout(waitForRender);
 self.takeMeasurements();
 }
 }, 50);
 }

 var name = $attrs.id + '-scrollSpy';
 $rootScope[name] = new ScrollSpy();

 // global onscroll fns array
 if (!$rootScope.globalOnScrollFunctions) {
 $rootScope.globalOnScrollFunctions = [];
 }
 $rootScope.globalOnScrollFunctions.push($rootScope[name]);

 // set up global onscroll function that will call each fn in global onscroll fns
 if (!$rootScope.globalOnScroll) {
 $rootScope.globalOnScroll = function () {
 angular.forEach($rootScope.globalOnScrollFunctions, function (val, key) {
 val.determinePosition();
 });
 };
 // on scroll
 // container[0].onscroll = $rootScope.globalOnScroll;
 }
 }
 }
 }]);*/