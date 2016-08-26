myApp.factory('Menu', [
	'$q',
	'$location',
	'$rootScope',
	'$mdSidenav',
	'$timeout',
	'Auth',
	'$log',
	'$state',
	function($q, $location, $rootScope, $mdSidenav, $timeout, Auth, $log, $state){
		var sections = [];
		function setLoggedInLinks() {
			sections = [];
			sections.splice(0, 1,
				{
					name : Auth.getCurrentUser().name ? Auth.getCurrentUser().name.first : 'Profile',
					type : 'link',
					state : 'profile',
					icon : 'person',
					profile : true
				}
			);
			sections.push(
				{
					name : 'Account',
					type : 'link',
					state : 'account',
					icon : 'settings'
				},
				{
					name : 'Certifications',
					type : 'toggle',
					state : 'main.certifications',
					pages : [
						{
							name : 'My Certifications',
							type : 'link',
							state : 'main.trainer.account.certifications.show'
						},
						{
							name : 'Add Certifications',
							type : 'link',
							state : 'main.certifications.list'
						},
						{
							name : 'faq',
							type : 'link',
							state : 'main.certifications.faq'
						}
					],
					icon : 'pages'
				},
				{
					name : 'Logout',
					type : 'link',
					state : 'main.login',
					icon : 'power_settings_new',
					action : 'logout()' // from the rootscope
				}
			);
		} 

		function setLoggedOutLinks() {
			sections = [];
			sections.push(
				{
					name : 'Sign up',
					type : 'link',
					state : 'main.signup',
					icon : 'person_add'
				},
				{
					name : 'Login',
					type : 'link',
					state : 'main.login',
					icon : 'person'
				},
				{
					name : 'Certifications',
					type : 'toggle',
					pages : [
						{
							name : 'Browse Certifications',
							type : 'link',
							state : 'main.trainer.account.certifications.list'
						},
						{
							name : 'faq',
							type : 'link',
							state : 'main.trainer.account.certifications.faq'
						}
					],
					icon : 'pages'
				}
			);
		}
		function setLinks() {
			Auth.isLoggedInAsync(function(isLoggedIn){
				if(isLoggedIn) {
					setLoggedInLinks();
				}
				else {
					setLoggedOutLinks();
				}
				console.log("Set sections as:", sections);
				Menu.sections = sections;
			});
		}
		var Menu = {
			sections: sections,
			refreshLinks : setLinks,
			toggleSelectSection: function (section) {
				Menu.openedSection = (Menu.openedSection === section ? null : section);
			},
			isSectionSelected: function (section) {
				return Menu.openedSection === section;
			},
			togglePromise : false,
			toggleLeft : buildDelayedToggler('left'),
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
			return debounce(function() {
				$mdSidenav(navID)
					.toggle()
					.then(function () {
						var isOpen = $mdSidenav('left').isOpen() ? true : false;
						Menu.isOpenLeft = isOpen;
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
		setLinks();
		return Menu;
	}]);