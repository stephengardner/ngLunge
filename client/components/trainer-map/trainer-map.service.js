myApp.factory('trainerMap', function($window, $compile, $timeout, $q, $rootScope){
	Array.prototype.diff = function(a) {
		return this.filter(function(i) {return a.indexOf(i) < 0;});
	};
	Array.prototype.differenceOfLocations = function(a) {
		return this.filter(function (i) {
			var found = false;
			console.log("A is:", a, " i is: ", i);
			for (var k = 0; k < a.length; k++) {
				var _id = a[k]._id;
				console.log("Checking if id:", i._id, " == ", _id);
				if (i._id == _id) found = true;
				// for (var j = 0; j < i.length; j++) {
				// 	console.log("Checking if id:", i[j]._id, " == ", _id);
				// 	if (i[j]._id == _id) found = true;
				// }
			}
			return !found;
		});
	};

	var TrainerMap = {
		map : {
			control : {},
			markers : [],
			window : {
				control : {},
				options : {
					// Don't delete this comment
					// use boxClass to make this an INFOBOX not InfoWindow.
					// Infoboxes are more stylable, we will have to set a dynamic pixel offset and
					// calculate the width of this this, though.  I did it before... Just don't really care right now.
					//boxClass : 'infobox',
					boxStyle: {
						backgroundColor: "#CCC",
						border: "1px solid red",
						borderRadius: "5px",
						width: "60px",
						height: "60px"
					},
					pixelOffset : new google.maps.Size(0, -35, 'px', 'px')
				},
				// templateParameter : 'location',
				templateUrl : 'components/trainer-map/trainer-map-info-window.partial.html',
				closeClick: function() {
					this.show = false;
				},
				model : {
					test : 'nothing'
				}
			},
			markersEvents: {
				click: function(marker, eventName, model) {
					console.log("Got Model:",model);
					TrainerMap.map.window.model = model;
					TrainerMap.map.window.show = true;
				}
			},
			zoom : 10,
			// markersOptions : {
			// 	animation : google.maps.Animation.DROP
			// },
			bounds: {
				northeast : null,
				northwest : null
			},
			events : {
				resize : function(){
					console.log("RESIZED");
					// TrainerMap.onResize();
				}
			}
		},
		infoWindow : {},
		googleMapLoaded : false,
		trainer : {},
		selectedMarker : {},
		uniqueMarkerId : 0,

		// Not sure if necessary
		reset : function () {
			this.map = {};
		},

		// When we click a location row, we show the marker for that location using this function.
		// All the markers were created to map to locations, but we need to set the model to a specific
		// marker instance.  So use this function
		showWindowForLocationModel : function(location) {
			console.log("checking location:", location);
			for(var i = 0; i < TrainerMap.map.markers.length; i++) {
				var marker = TrainerMap.map.markers[i];
				console.log("Against marker:", marker);
				if(marker._id == location._id) {
					TrainerMap.map.window.model = marker;
					TrainerMap.map.window.show = true;
					return true;
				}
			}
			return false;
		},
		/**
		 *
		 * @param trainer
		 * @returns {TrainerMap}
		 */
		init : function(trainer) {
			this.markers = [];
			this.googleMapLoaded = false;
			this.infoWindow = {};
			this.selectedMarkerLocation = {};
			if(!trainer.location || !trainer.location.coords) {
				return this;
			}
			this.map = angular.extend(this.map,
				{
					center: {
						latitude: trainer.location.coords.lat,
						longitude: trainer.location.coords.lon
					}
				});
			// }
			this.trainer = trainer;
			if(trainer.location && trainer.location.coords) {
				this.setMarkers();
			}
			else {
				alert("Empty trainer");
				// if a new trainer adds a location where there previously was no location, the location is added and we want to reflect that on an already generated map.
				// so we generate the map on a blank lat/lon before populating it with the trainer's new data.
				// i know this seems a lottle fuzzy, but it's the precedent of angular operations right now.
				// we can create a service that does this for us more seamlessly.
				this.map = {
					center : {latitude: 70, longitude: 0 }, zoom : 10, bounds : {
						northeast : null,
						northwest : null
					},
					markers : [],
					control : {}
				};
			}
			console.log("After initting, this map is:", this.map);
			return this;
		},

		setMarkers : function() {
			var currentMarkers = this.map.markers || [], returnArray = [], marker, location, i;
			var differenceBetweenTrainerLocationsAndMapMarkers =
				this.trainer.locations.differenceOfLocations(currentMarkers);
			console.log("Diff1:", differenceBetweenTrainerLocationsAndMapMarkers);
			var differenceBetweenMapMarkersAndTrainerLocations =
				currentMarkers.differenceOfLocations(this.trainer.locations);
			console.log("Diff2:", differenceBetweenMapMarkersAndTrainerLocations);
			if(!this.map.markers) {
				console.log("---- was no this.map.markers ----");
				this.map.markers = [];
			}
			var markersToAdd = [];
			for(i = 0; i < differenceBetweenTrainerLocationsAndMapMarkers.length; i++) {
				location = differenceBetweenTrainerLocationsAndMapMarkers[i];
				var newMarker = {
					_id : location._id,
					id : ++this.uniqueMarkerId,
					coords : {
						latitude : location.coords.lat,
						longitude : location.coords.lon
					},
					options : {
						animation : google.maps.Animation.DROP
					},
					trainerLocationModel : location
				};
				markersToAdd.push(newMarker);
			}
			for(i = 0; i < differenceBetweenMapMarkersAndTrainerLocations.length; i++) {
				location = differenceBetweenMapMarkersAndTrainerLocations[i];
				for(var j = 0; j < this.map.markers.length; j++) {
					marker = this.map.markers[j];
					if(marker._id == location._id) {
						// marker.setMap(null);
						this.map.markers.splice(j, 1);
						j--;
					}
				}
			}
			for(i = 0; i < markersToAdd.length; i++) {
				addMarkerWithTimeout.call(this, markersToAdd[i], i * 200);
			}

			function addMarkerWithTimeout(marker, timeout) {
				// Don't Delete
				// We're omitting this for now, but we may implement this in the future.
				// The reason it didn't work is because A) the map takes a second to load, and these have already fired
				// and B) this needs to return a promise, otherwise the scope won't update.
				// window.setTimeout(function() {
					this.map.markers.push(marker);
				// }.bind(this), timeout);
			}
			return this.map.markers;
		},
		setGoogleMapCenter : function() {
			if(this.map.control.getGMap) {
				var map = this.map.control.getGMap();
				map.setCenter({
					lat: TrainerMap.map.center.latitude,
					lng: TrainerMap.map.center.longitude
				});
			}
		},
		triggerResize : function() {
			if(this.map.control.getGMap) {
				var map = this.map.control.getGMap();
				google.maps.event.trigger(map, "resize");
			}
		},

		closeInfoWindow : function() {
			if(this.infoWindow && this.infoWindow.close)
				this.infoWindow.close();
			return this;
		},

		_removeInvalidMarkers : function() {
			var k, i;
			// iterate through all the markers and make sure there is still a location object corresponding to that marker
			// if not, delete it.
			for(k = 0; k < this.markers.length; k++) {
				var marker = this.markers[k],
					isMarkerFound = false;
				if(this.trainer.locations) {
					for(i = 0; i < this.trainer.locations.length; i++) {
						var location = this.trainer.locations[i];
						if(location.coords && marker.coords && location.coords.lat == marker.coords.lat && location.coords.lon == marker.coords.lon)
							isMarkerFound = true;
					}
				}
				if(!isMarkerFound) {
					this.markers[k].setMap(null);
					this.markers.slice(k, 1);
				}
			}
			return this;
		},

		_addNewMarkers : function() {
			//console.log("Trainer-map._addNewMarkers() locations:", this.trainer.locations);
			var i, k;
			function afterCreatingMarker(marker){
				TrainerMap.markers.push(marker);
				TrainerMap.setCenter();
			}
			if(this.trainer.locations) {
				// add the marker if our location results includes it and it's not on the map
				for(i = 0; i < this.trainer.locations.length; i++) {
					var location = this.trainer.locations[i],
						isLocationFound = false;
					for(k = 0; k < this.markers.length; k++) {
						var marker = this.markers[k];
						if(marker.id == location._id) {
							isLocationFound = true;
							// it's found, great, but it might have changed content (if we call a changeTitle method), so always make sure it's updated.
							this.setMarkerContent(marker, location);
						}
					}
					if(!isLocationFound) {
						//console.log("updateLocations created a marker for location:", this.trainer.locations[i]);
						this._createGoogleMarker(this.trainer.locations[i]).then(afterCreatingMarker);
					}
				}
			}
			return this;
		},

		_setTrainer : function(trainer) {
			this.trainer = trainer;
		},

		/**
		 *
		 * @returns {TrainerMap}
		 */
		updateLocations : function(trainer) {
			// if(trainer)
			// 	this._setTrainer(trainer);
			// if(trainer) {
			// 	this.init(trainer);
			// }
			return this;
			// return this.closeInfoWindow()._removeInvalidMarkers()._addNewMarkers();
		},

		/**
		 *
		 * @returns {TrainerMap}
		 */
		setCenter : function() {
			if(this.trainer.location && this.trainer.location.coords) {
				this.map.center = {latitude: this.trainer.location.coords.lat, longitude: this.trainer.location.coords.lon }
			}
			else {
				this.map = {center : {latitude: 70, longitude: 0 }, zoom : 2, bounds : {
					northeast : null,
					northwest : null
				}};
			}
			//console.log("-------------\n-------------\n setting map center : ", this.map, " ------------\n--------------\n");
			return this;
		},

		/**
		 *
		 * @param infoBoxContent
		 * @returns {Array}
		 * @private
		 */
		_getInfoBoxDimensions : function(infoBoxContent) {
			var sensor = $("<div>").html(infoBoxContent);
			$(sensor).appendTo(".locations").css({"position" : "absolute", left : "-9000px"});
			var width = $(sensor).width();
			var height = $(sensor).height();
			$(sensor).remove();
			return new Array(width, height);
		},

		/**
		 *
		 * @param location
		 * @private
		 */
		_triggerMarkerClick : function(location) {
			var id = location._id;
			for(var i = 0; i < TrainerMap.markers.length; i++) {
				var marker = TrainerMap.markers[i];
				if(marker.id == id) {
					//console.log("found the marker, the map has been sent the click event");
					new google.maps.event.trigger( marker, 'click' );
				}
			}
		},

		/**
		 *
		 * @param marker
		 * @param location
		 */
		setMarkerContent : function(marker, location) {
			if(this.map.control.getGMap) {
				var map = this.map.control.getGMap();
				var contentTitle = location.title ? location.title : this.trainer.name.first + "'s location";
				var address_line_1 = location.address_line_1 ?"<div class='address_line_1'>" + location.address_line_1 + "</div>"  : "";
				var zipcode = location.zipcode ? "<div class='zipcode'>" + location.zipcode + "</div>" : "";
				marker.content = "" +
					"<div class='infoWindow' id='infoWindow'>" +
					"<div class='close' ng-click='closeInfoWindow()'><i class='fa fa-times'></i></div>" +
					"<div class='title'>" + contentTitle  + "</div>"+
					"<div class='content'>" +
					address_line_1 +
					"<div class='city-state'>" + location.city + ", " + location.state + "</div>" +
					zipcode +
					"</div>" +
					"</div>";
				// if the marker is already on the scope, it means we're updating it, not creating it
				// this is an issue when we want to set the marker content after calling changeTitle()
				for(var i = 0; i < this.markers.length; i++) {
					var mk = this.markers[i];
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
					// not used TrainerMap.selectedMarker = marker;
					var infoBoxContent = marker.content;
					var infoBoxDimensions = TrainerMap._getInfoBoxDimensions(infoBoxContent);
					var infoBoxWidth = infoBoxDimensions[0];
					var infoBoxHeight = infoBoxDimensions[1];
					var infoBoxHeightOffset = -infoBoxHeight;
					var infoBoxOffset = - (infoBoxWidth / 2);
					TrainerMap.infoWindow.setOptions({
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
					this.infoWindow.open(map, marker);
				}.bind(this));
			}
			else {
				console.warn("no control.gmap() function found");
			}
		},

		/**
		 *
		 * @param $scope
		 * @returns {TrainerMap}
		 */
		bindInfoWindow : function($scope){
			this.infoWindow = new InfoBox(); // InfoBox is a custom javascript vendor file
			// Allowing ng-click directives within the html I use in the infoWindow
			// I have to $compile the html inside the window once the window is ready
			function onload(){
				/*
				 $scope.$apply(function(){
				 $compile(document.getElementById("infoWindow"))($scope)
				 });
				 */
				$timeout(function(){
					$compile(document.getElementById("infoWindow"))($scope)
				})
			}
			//$scope.updateLocations();
			google.maps.event.addListener(TrainerMap.infoWindow, 'domready', function(a,b,c,d) {
				onload();
			});
			this.googleMapLoaded = true;
			return this;
		},

		/**
		 *
		 * @param location
		 * @returns {*}
		 * @private
		 */
		_createGoogleMarker : function(location) {

			var deferred = $q.defer();
			if(this.map.control.getGMap) {
				//console.log("something created a marker...");
				var map = this.map.control.getGMap();
				var myLatlng = new google.maps.LatLng(location.coords.lat, location.coords.lon);
				var contentTitle = location.title ? location.title : this.trainer.name.first + "'s location";
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
				this.setMarkerContent(marker, location);
				google.maps.event.addListener(marker, 'click', function() {
					//console.log("set the selected location as: ", location);
					this.selectedMarkerLocation = location;
				}.bind(this));
				//return marker;
				deferred.resolve(marker);
			}
			else {
				console.log("The map was unavailable and hence we could not create the marker");
				deferred.reject("The map was unavailable and hence we could not create the marker");
			}
			return deferred.promise;
		}

	};
	return TrainerMap;
});