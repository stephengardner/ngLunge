lungeApp.controller('TrainerLocationsController', function($compile, Auth, Geocoder, $timeout, $scope){
	$scope.control = {};
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
		$scope.options = {
			scrollwheel: false
		};
		$scope.markers = [];

		var numMarkers = 0;
		$scope.closeInfoWindow = function(){
			$scope.infoWindow.close();
		}
		var createGoogleMarker = function(location){
			var map = $scope.control.getGMap();
			var myLatlng = new google.maps.LatLng(location.coords.lat, location.coords.lon);
			var contentTitle = location.title ? location.title : $scope.user.name.first + "'s location";
			var marker = new google.maps.Marker({
				position: myLatlng,
				map: map,
				title: contentTitle
			});
			marker.id = ++numMarkers;
			marker.content = "" +
			"<div class='infoWindow' id='infoWindow'>" +
				"<div class='close' ng-click='closeInfoWindow()'><i class='fa fa-times'></i></div>" +
				"<div class='title'>" + contentTitle  + "</div>"+
				"<div class='content'>" +
					"<div class='address_line_1'>" + location.address_line_1 + "</div>" +
					"<div class='city-state'>" + location.city + ", " + location.state + "</div>" +
					"<div class='zipcode'>" + location.zipcode + "</div>" +
				"</div>" +
			"</div>";
			google.maps.event.addListener(marker, 'click', function() {
				$scope.selectedMarker = marker;
				var infoBoxContent = marker.content;
				var infoBoxDimensions = getInfoBoxDimensions(infoBoxContent);
				var infoBoxWidth = infoBoxDimensions[0];
				var infoBoxHeight = infoBoxDimensions[1];
				var infoBoxHeightOffset = -infoBoxHeight;
				var infoBoxOffset = - (infoBoxWidth / 2);
				$scope.infoWindow.setOptions({
					boxStyle				: {
						"width" : infoBoxWidth + 5 + "px"
					},
					closeBoxURL : "",
					content					: infoBoxContent,
					zIndex					: null,
					pixelOffset : new google.maps.Size(infoBoxOffset, infoBoxHeightOffset-60),
					infoBoxClearance		: new google.maps.Size(-80,50),
					isHidden				: false,
					enableEventPropagation	: false
				});
				$scope.infoWindow.open(map, marker);
			});
		};
		function getInfoBoxDimensions( content ) {
			var sensor = $("<div>").html(content);
			$(sensor).appendTo(".profile-style section:first").css({"position" : "absolute", left : "-9000px"});
			var width = $(sensor).width();
			var height = $(sensor).height();
			$(sensor).remove();
			return new Array(width, height);
		}
		$scope.$watch(function() {
			return $scope.map.bounds;
		}, function(nv, ov) {
			// Only need to regenerate once
			if (!ov.southwest && nv.southwest) {
				$scope.infoWindow = new InfoBox(); // InfoBox is a custom javascript vendor file
				for(var i = 0; i < $scope.user.locations.length; i++) {
					if($scope.user.locations[i].coords) {
						var marker = createGoogleMarker($scope.user.locations[i]);
					}
					$scope.markers.push(marker);
				}

				// Allowing ng-click directives within the html I use in the infoWindow
				// I have to $compile the html inside the window once the window is ready
				function onload(){
					$scope.$apply(function(){
						$compile(document.getElementById("infoWindow"))($scope)
					});
				}
				google.maps.event.addListener($scope.infoWindow, 'domready', function(a,b,c,d) {
					onload();
				});
			}
		}, true);

		$scope.submitLocation = function(form) {
			$scope.updatedLocation.title = form.title.$modelValue;
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