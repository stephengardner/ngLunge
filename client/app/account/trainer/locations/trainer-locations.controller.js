lungeApp.controller('TrainerLocationsController', function($q, AlertMessage, $compile, Auth, Geocoder, $timeout, $scope){
	$scope.control = {};
	$scope.toggleLocation = function(){
		$scope.addingLocation = !$scope.addingLocation;
	};
	$scope.googleMapLoaded = false;
	$scope.removeMongooseError = function(form, inputName) {
		console.log("attempting...", form[inputName]);
		//$scope.submitted = false;
		if(!form[inputName] || !form[inputName].$error) {
			return false;
		}
		console.log("SETTING INVISIBLE TRUE FOR : ", inputName);
		form[inputName].$error['invisible'] = false;
		form[inputName].$setValidity('mongoose', true);
		form[inputName].$setValidity('invisible', true);
	};
	$timeout(function(){
		Geocoder.bindPlaces("#location", function(updatedLocation){
			$scope.updatedLocation = updatedLocation;
			$scope.$apply();
		});
	}, 4000);

	Auth.isLoggedInAsync(function(){
		$scope.map = { center: {latitude: $scope.user.location.coords.lat, longitude: $scope.user.location.coords.lon }, zoom: 10,
			bounds: {} };
		$scope.options = {
			scrollwheel: true
		};
		$scope.markers = [];

		var numMarkers = 0;
		$scope.closeInfoWindow = function(){
			$scope.infoWindow.close();
		}
		var setMarkerContent = function(marker, location) {
			var map = $scope.control.getGMap();
			var contentTitle = location.title ? location.title : $scope.user.name.first + "'s location";
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
			// if the marker is already on the scope, it means we're updating it, not creating it
			// this is an issue when we want to set the marker content after calling changeTitle()
			for(var i = 0; i < $scope.markers.length; i++) {
				var mk = $scope.markers[i];
				if(mk.id == marker.id) {
					mk.content = (marker.content);
					mk.setTitle(contentTitle);
					marker = mk;
				}
			}
			if(marker.listener) {
				google.maps.event.removeListener(marker.listener);
			}
			marker.listener = google.maps.event.addListener(marker, 'click', function() {
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
			marker.id = location._id;
			marker.coords = {
				lat : location.coords.lat,
				lon : location.coords.lon
			};
			setMarkerContent(marker, location);
			return marker;
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
				$scope.$watch(function(){
					return $scope.markers;
				}, function(){
					$scope.updateLocations();
				})
				$scope.googleMapLoaded = true;
			}
		}, true);

		$scope.triggerMarkerClick = function(location) {
			var id = location._id;
			for(var i = 0; i < $scope.markers.length; i++) {
				var marker = $scope.markers[i];
				if(marker.id == id) {
					new google.maps.event.trigger( marker, 'click' );
				}
			}
		}
		// helper that iterates through all the markers and makes sure they're updated and added.
		$scope.updateLocations = function() {
			// remove the marker if it's on the map but our location result's doesn't include it
			for(var k = 0; k < $scope.markers.length; k++) {
				var isMarkerFound = false;
				var marker = $scope.markers[k];
				for(var i = 0; i < $scope.user.locations.length; i++) {
					var location = $scope.user.locations[i];
					if(location.coords && mnarker.coords && location.coords.lat == marker.coords.lat && location.coords.lon == marker.coords.lon) {
						isMarkerFound = true;
					}
				}
				if(!isMarkerFound) {
					$scope.markers[k].setMap(null);
					$scope.markers.slice(k, 1);
				}
			}

			// add the marker if our location results includes it and it's not on the map
			for(var i = 0; i < $scope.user.locations.length; i++) {
				var location = $scope.user.locations[i];
				var isLocationFound = false;
				for(var k = 0; k < $scope.markers.length; k++) {
					var marker = $scope.markers[k];
					if(marker.id == location._id) {
						isLocationFound = true;
						// it's found, great, but it might have changed content (if we call a changeTitle method), so always make sure it's updated.
						setMarkerContent(marker, location);
					}
				}
				if(!isLocationFound) {
					var marker = createGoogleMarker($scope.user.locations[i]);
					$scope.markers.push(marker);
				}
			}
		};

		// when finished with the "Add Location" form
		$scope.submitLocation = function(form) {
			if($scope.updatedLocation) {
				var deferred = $q.defer();
				$scope.updatedLocation.title = form.title.$modelValue;
				var dataToSend = {
					location : $scope.updatedLocation
				};
				console.log("=========> SENDING: ", dataToSend);
				//if(form.$valid){
				$scope.sending = true;
				Auth.addLocation(dataToSend).then(function(response){
					console.log("AddLocation response: ", response);
					$scope.user = response;
					$scope.updateLocations();
					$scope.addingLocation = false;
				}).catch(function(err){
					//$scope.ajax.email = false;
					$scope.errors = {};
					console.log("ERRRRRRRRRRR", err);
					form.$setPristine();
					err = err.data;
					$scope.sending = false;
					// Update validity of form fields that match the mongoose errors
					angular.forEach(err.errors, function (error, field) {
						console.log("Setting form[" + field + "].$dity = false");
						form[field].$dirty = false;//('mongoose', false);
						console.log(form[field]);
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
						deferred.reject();
					});
				});
				return deferred.promise;
			}
			else {
				$scope.errors = {};
				var field = 'location';
				form[field].$dirty = false;
				form[field].$setValidity('mongoose', false);
				$scope.errors[field] = "Invalid location";
			}
		};

		// changing the title of a location from the ng-repeat of all locations
		$scope.toggleChangeTitle = function(location){
			location.editingTitle = !location.editingTitle;
		};
		$scope.changeTitle = function(location) {
			for(var i = 0; i < $scope.user.locations.length; i++) {
				var userLocation = $scope.user.locations[i];
				if(userLocation._id == location._id) {
					userLocation.title = location.title;
				}
			}
			var dataToSend = {
				locations : $scope.user.locations
			};
			Auth.updateProfile(dataToSend).then(function(response){
				console.log(response);
				$scope.toggleChangeTitle(location);
				AlertMessage.success("Location title changed successfully");
				$scope.updateLocations();
			}).catch(function(err){
				AlertMessage.error("Location title change failed");
			});
		}

		// when clicking the "Remove" button from the ng-repeat of all locations
		$scope.removeLocation = function(location) {
			location.removing = true;
			var dataToSend = {
				location : location
			};
			Auth.removeLocation(dataToSend).then(function(response){
				location.removing = false;
				console.log("RemoveLocation response: ", response);
				$scope.user = response;
				$scope.updateLocations();
			}).catch(function(err){
				location.removing = false;
			});
		}
	});

});