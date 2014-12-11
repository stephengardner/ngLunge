'use strict';

angular.module('ngLungeFullStack2App')
  .controller('MainCtrl', ['Auth', 'geolocation', '$scope', '$http', 'socket', 'GoogleMapApi'.ns(), 'Geocoder', function(Auth, geolocation, $scope, $http, socket, GoogleMapApi, Geocoder) {

		/*$http.get('/api/trainers/me').success(function(response){
			console.log("respopnse", response);
		}).error(function(err){
			console.log("Err", err);
		})
		*/
		/*
		*/
		$scope.awesomeThings = [];
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

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  }]);
