// This was used successfully, but we opted not to show the map for a trainee

myApp.factory('traineeMap', function(){
	var TraineeMap = {
		map : {
			control : {},
			bounds: {
				northeast : null,
				northwest : null
			}
		},
		uniqueMarkerId : 0,
		googleMapLoaded : false,
		trainee : {},
		reset : function() {
			this.map = {};
		},
		init : function(trainee) {
			this.markers = [];
			this.googleMapLoaded = false;
			this.trainee = trainee;
			this.map = angular.extend(this.map,
				{
					center: {
						latitude: trainee.location && trainee.location.coords ? trainee.location.coords.lat : 10,
						longitude: trainee.location && trainee.location.coords ? trainee.location.coords.lon : 10
					}
				});
			console.log('[Trainee Map Service] setting this.map to be: ', this.map);
			this.setMarkers();
			return this;
		},
		setMarkers : function() {
			var location = this.trainee.location;

			if(location && location.coords) {
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
					traineeLocationModel : location
				};
				console.log("Trainee map setting new marker:", newMarker);

				this.markers = [newMarker]; //just a single item array at the moment, for trainees
				this.map.markers = this.markers;
			}
		}
	};
	return TraineeMap;
});