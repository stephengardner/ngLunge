'use strict';

angular.module('ngLungeFullStack2App')
	.controller('MainCtrl', [
		'TrainerFactory',
		'Auth',
		'uiGmapGoogleMapApi',
		'Geocoder',
		'$rootScope',
		'$scope',
		'geolocation',
		function(
			TrainerFactory,
			Auth,
			GoogleMapApi,
			Geocoder,
			$rootScope,
			geolocation,
		    Menu
		){

			// in the main controller, set the trainer factory when we log in.
			// this is good. Is also sets trainerFactory for children scopes.
			// It does this because trainerFactory is an object, so the child scopes can inherit this object
			// and they can also edit it, by editing properties of the object
			// FALSE - The trainerfactory needs to be set when they view someone ELSES page too,
			// or for when an admin edits a trainer.  This is NOT an AUTH service necessarily
			/*
			function syncTrainerFactory() {
				$scope.trainerFactory = TrainerFactory;
				TrainerFactory.init(Auth.getCurrentUser(),
					{
						sync : true
					}
				);
			}
			$rootScope.$on('trainerLogin', function(){
				syncTrainerFactory()
			});
			Auth.isLoggedInAsync(syncTrainerFactory);
			*/

			// BEGIN
			// var vm = this;
			//
			// vm.status = {
			// 	isFirstOpen: true,
			// 	isFirstDisabled: false
			// };
			// vm.isOpen = isOpen;
			// vm.toggleOpen = toggleOpen;
			// vm.autoFocusContent = false;
			// vm.menu = Menu;
			//
			// vm.status = {
			// 	isFirstOpen: true,
			// 	isFirstDisabled: false
			// };
			//
			//
			// function isOpen(section) {
			// 	return Menu.isSectionSelected(section);
			// }
			//
			// function toggleOpen(section) {
			// 	Menu.toggleSelectSection(section);
			// }
			// END

			// Initialize the google maps api
			// GoogleMapApi.then(function(maps) {
			// 	var geocoder = new maps.Geocoder();
			// 	geolocation.getLocation().then(function(position){
			// 		Geocoder.init(position).then(function(){
			// 			Geocoder.getPositionPostal().then(function(postal){
			// 				vm.postal = postal;
			// 			});
			// 			Geocoder.getCityState().then(function(cityState){
			// 				$scope.cityState = cityState;
			// 			});
			// 		});
			// 	});
			// });
		}]);
