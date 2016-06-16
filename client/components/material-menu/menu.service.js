myApp.factory('Menu', [
	'$location',
	'$rootScope',
	'$mdSidenav',
	'$timeout',
	'Auth',
	'$log',
	function($location, $rootScope, $mdSidenav, $timeout, Auth, $log){
		var sections = [];
		// working example
		// {
		// 	name: 'Beers',
		// 		type: 'toggle',
		// 	pages: [{
		// 	name: 'IPAs',
		// 	type: 'link',
		// 	state: 'beers.ipas',
		// 	icon: 'fa fa-group'
		// }, {
		// 	name: 'Porters',
		// 	state: 'home.toollist',
		// 	type: 'link',
		// 	icon: 'fa fa-map-marker'
		// },
		// 	{
		// 		name: 'Wheat',
		// 		state: 'home.createTool',
		// 		type: 'link',
		// 		icon: 'fa fa-plus'
		// 	}]
		// },
		sections.push(
			{
				name : 'Log In',
				type : 'link',
				state : 'main.login',
				icon : 'ext_to_app'
			}
		);
		Auth.isLoggedInAsync(function(){
			sections.splice(0, 1,
				{
					name : Auth.getCurrentUser().name ? Auth.getCurrentUser().name.first : 'Profile',
					type : 'link',
					state : 'profilePage',
					stateOptions : {urlName : Auth.getCurrentUser().urlName },
					action : 'goToProfile()',
					icon : 'person'
				}
			);
			sections.push(
				{
					name : 'Account',
					type : 'link',
					state : 'main.trainer.account.edit-profile',
					icon : 'settings'
				},
				{
					name : 'Certifications',
					type : 'link',
					icon : 'pages',
					state : 'main.trainer.account.certifications'
				},
				{
					name : 'Logout',
					type : 'link',
					state : 'main.trainer.account.certifications',
					icon : 'power_settings_new',
					action : 'logout()' // from the rootscope
				}
			);
		});
		var Menu = {
			sections: sections,

			toggleSelectSection: function (section) {
				Menu.openedSection = (Menu.openedSection === section ? null : section);
			},
			isSectionSelected: function (section) {
				return Menu.openedSection === section;
			},
			toggleLeft : buildDelayedToggler('left'),
			toggleRight : buildToggler('right'),
			selectPage: function (section, page) {
				page && page.url && $location.path(page.url);
				Menu.currentSection = section;
				Menu.currentPage = page;
			},
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
		return Menu;
	}]);