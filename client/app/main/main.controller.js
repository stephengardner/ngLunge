'use strict';

angular.module('ngLungeFullStack2App')
	.controller('MainCtrl', ['$timeout', '$popover', 'MenuService', 'Auth', 'geolocation', '$scope', '$http', 'socket', 'uiGmapGoogleMapApi',
		'Geocoder', function($timeout, $popover, MenuService, Auth, geolocation, $scope, $http, socket, GoogleMapApi, Geocoder) {
			/*
			$scope.isMenuActive = function(){
				return MenuService.active;
			}
			*/
			GoogleMapApi.then(function(maps) {
				var geocoder = new maps.Geocoder();
				geolocation.getLocation().then(function(position){

					Geocoder.init(position).then(function(){
						Geocoder.getPositionPostal().then(function(postal){
							$scope.postal = postal;
						});
						Geocoder.getCityState().then(function(cityState){
							$scope.cityState = cityState;
						});
					});

					//$scope.cityState = "Washington, DDC";
				});
			});
		}]);
