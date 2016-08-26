myApp.factory('MessagesMenu', [
	'$q',
	'$location',
	'$rootScope',
	'$mdSidenav',
	'$timeout',
	'Auth',
	'$log',
	'Chat',
	'$state',
	function($q, $location, $rootScope, $mdSidenav, $timeout, Auth, $log, Chat, $state){
		var sections = [];

		function setLinks() {

		}

		var MessagesMenu = {
			sections: sections,
			refreshLinks : setLinks,
			toggleSelectSection: function (section) {
				Menu.openedSection = (Menu.openedSection === section ? null : section);
			},
			isSectionSelected: function (section) {
				return Menu.openedSection === section;
			},
			togglePromise : false,
			toggleLeft : buildDelayedToggler('messages'),
			toggleRight : buildToggler('right'),
			selectPage: function (section, page) {
				page && page.url && $location.path(page.url);
				Menu.currentSection = section;
				Menu.currentPage = page;
			},
			isClosedLeftPromise : false,
			isOpenLeft : false,
			isOpenRight : function(){
				return $mdSidenav('right').isOpen();
			}
		};
		function debounce(func, wait, context) {
			var timer;
			return function debounced() {
				var context = $rootScope,
					args = Array.prototype.slice.call(arguments);
				$timeout.cancel(timer);
				timer = $timeout(function() {
					timer = undefined;
					func.apply(context, args);
				}, wait || 10);
			};
		}
		/**
		 * Build handler to open/close a SideNav; when animation finishes
		 * report completion in console
		 */
		function buildDelayedToggler(navID) {
			console.log("MessagesMenutoggleLeft");
			return debounce(function() {
				if(!$mdSidenav('messages').isOpen()) {
					Chat.readNotifications().then(function(response){
						console.log('done:',response);
					}).catch(function(err){
						console.log('err:',err);
					});
					Chat.get();
				}
				$mdSidenav(navID)
					.toggle()
					.then(function () {
						var isOpen = $mdSidenav('messages').isOpen() ? true : false;
						MessagesMenu.isOpenLeft = isOpen;
						$log.debug("toggle " + navID + " is done");
					});
			}, 10);
		}
		function buildToggler(navID) {
			return function() {
				$mdSidenav(navID)
					.toggle()
					.then(function () {
						$log.debug("toggle " + navID + " is done");
					});
			}
		}

		return MessagesMenu;
	}]);