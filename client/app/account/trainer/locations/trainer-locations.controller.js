lungeApp.controller('TrainerLocationsController', function(Auth, Geocoder, $timeout, $scope){
	$scope.toggleLocation = function(){
		$scope.addingLocation = !$scope.addingLocation;
	};

	$timeout(function(){
		Geocoder.bindPlaces("#location", function(updatedLocation){
			$scope.updatedLocation = updatedLocation;
			$scope.$apply();
		});
	}, 4000);

	Auth.isLoggedInAsync(function(){
		$scope.map = { center: {latitude: $scope.user.location.coords.lat, longitude: $scope.user.location.coords.lon }, zoom: 8,
			bounds: {} };
		console.log("SCOPE MAP IS: ", $scope.map);

		$scope.markers = [
			{
				latitude: $scope.user.location.coords.lat,
				longitude: $scope.user.location.coords.lon,
				title : 'm'
			}
		]
		$scope.user.location;
		$scope.options = {
			scrollwheel: false
		};
		$scope.markers = [];
		$scope.selected = {show: false};
		var numMarkers = 0;

		var createMarker = function(location) {
			var infoWindowDefaults = {
				title : $scope.user.name.first + "'s location",
				id : ++numMarkers
			};
			location.coords.latitude = location.coords.lat;
			location.coords.longitude = location.coords.lon;
			var ret = angular.extend({}, location, { show : false }, infoWindowDefaults);
			ret.onClick = function(){
				$scope.selectedMarker = ret;
			};
			ret.onCloseClick = function() {
				$scope.selected.show = false;
				ret.show = false;
				console.log("CloseClicked", ret);
				$scope.$apply();
			};
			return ret;
		};
		var createRandomMarker = function(i, bounds, idKey) {
			var lat_min = bounds.southwest.latitude,
				lat_range = bounds.northeast.latitude - lat_min,
				lng_min = bounds.southwest.longitude,
				lng_range = bounds.northeast.longitude - lng_min;

			if (idKey == null) {
				idKey = "id";
			}

			var latitude = lat_min + (Math.random() * lat_range);
			var longitude = lng_min + (Math.random() * lng_range);
			var ret = {
				latitude: latitude,
				longitude: longitude,
				title: 'm' + i
			};
			ret[idKey] = i;
			return ret;
		};
		$scope.randomMarkers = [];
		// Get the bounds from the map once it's loaded
		$scope.$watch(function() {
			return $scope.map.bounds;
		}, function(nv, ov) {
			// Only need to regenerate once
			if (!ov.southwest && nv.southwest) {
				var markers = [];
				for (var i = 0; i < 50; i++) {
					markers.push(createRandomMarker(i, $scope.map.bounds))
				}
				$scope.randomMarkers = markers;
			}
			console.log("RANDOM MARKERS:",$scope.randomMarkers);
			$scope.markers = [];
			var marker = createMarker($scope.user.location);
			console.log("The marker is:", marker);
			$scope.markers.push(marker);
			for(var i = 0; i < $scope.user.locations.length; i++) {
				var marker = createMarker($scope.user.locations[i]);
				$scope.markers.push(marker);
			}
		}, true);
		$scope.selectedMarker = {
			title : "something"
		};
		$scope.onClick = function(marker){
			$scope.selectedMarker = marker;
			$scope.showWindow = true;
		}

		$scope.submitLocation = function() {
			var dataToSend = {
				location : $scope.updatedLocation
			};
			console.log("=========> SENDING: ", dataToSend);
			//if(form.$valid){
			$scope.sending = true;
			Auth.addLocation(dataToSend).then(function(response){
				console.log("AddLocation response: ", response);
			});
		}
	});

});