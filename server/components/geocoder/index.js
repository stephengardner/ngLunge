module.exports = function($q, GoogleMapApi){

	// the "type" field in "address_components" that represents what this "address_component" holds.
	// the "type" field is an array and may have more than one item.  This is a tested but not guaranteed check.
	var ADDRESS_TYPES = {
		"state" : "administrative_area_level_1",
		"city" : "locality"
	};
	var _ADDRESS_TYPES_PLUS = {
		"street_number" : { google_type : "street_number", google_target : "short_name" },
		"street_name" : { google_type : "route", google_target : "short_name" },
		"state" : { google_type : "administrative_area_level_1", google_target : "short_name" },
		"city" : { google_type : "locality", google_target : "long_name" },
		"zipcode" : { google_type : "postal_code", google_target : "short_name" }
	};
	var Geocoder = {
		geocoder : {},
		init : function(opt_position){
			Geocoder.googleMapsPosition = opt_position;
			var deferred = $q.defer();
			/*
			GoogleMapApi.then(function(maps) {
				if(!Geocoder.geocoder.geocode)
					Geocoder.geocoder = new maps.Geocoder();
				deferred.resolve(Geocoder);
			});
			*/
			Geocoder.geocoder = GoogleMapApi;
			deferred.resolve(Geocoder);
			return deferred.promise;
		},

		createLocationFromAPIResponse : function(result) {
			var updatedLocation = Geocoder._unwrapAddressComponents(result);
			updatedLocation.google = {
				placesAPI : {
					formatted_address : result.formatted_address
				}
			};
			return updatedLocation;
		},

		bindPlaces : function(el, cb) {
			$(function(){
				if(google) {
					var trainerLocation = $(el).geocomplete({blur : true}).on("geocode:result", function(event, result){
						var updatedLocation = Geocoder.createLocationFromAPIResponse(result);
						cb(updatedLocation);
					});
				}
				$("#find").click(function(){
					trainerLocation.trigger("geocode");
				});
			});
		},

		_deconstruct : function(opt_googleMapsPosition) {
			this._setPosition(opt_googleMapsPosition);
			var lat = this.googleMapsPosition.coords.latitude,
				long = this.googleMapsPosition.coords.longitude,
				latlng = new google.maps.LatLng(lat, long),
				deferred = $q.defer();
			if((!opt_googleMapsPosition || opt_googleMapsPosition == this.googleMapsPosition) && Geocoder._deconstruction) {
				deferred.resolve(this._deconstruction);
			}
			else {
				this.geocoder.geocode({'latLng': latlng}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						Geocoder._deconstruction = results;
						deferred.resolve(results);
					}
					else {
						deferred.reject();
					}
				});
			}
			return deferred.promise;
		},
		_setPosition : function(googleMapsPosition){
			if(googleMapsPosition)
				this.googleMapsPosition = googleMapsPosition;
		},
		getPositionFull : function(opt_googleMapsPosition) {
			var deferred = $q.defer();
			Geocoder._deconstruct(opt_googleMapsPosition).then(function(results){
				deferred.resolve(results[0]);
			});
			return deferred.promise;
		},
		getCityState : function(opt_googleMapsPosition){
			var deferred = $q.defer();
			var resultCity = "";
			var resultState = "";
			Geocoder._deconstruct(opt_googleMapsPosition).then(function(results){
				var mainResults = results[0];
				angular.forEach(mainResults.address_components, function(val, key){
					angular.forEach(val.types, function(type){
						if(type == ADDRESS_TYPES.city){
							resultCity = val.long_name;
						}
						else if(type == ADDRESS_TYPES.state) {
							resultState = val.short_name;
						}
					});
				});
				if(resultCity && resultState) {
					deferred.resolve(resultCity + ", " + resultState);
				}
			});
			return deferred.promise;
		},
		_unwrapAddressComponents : function(googleResultObject) {
			var result = {};

			for(var i = 0; i < googleResultObject.address_components.length; i++) {
				var address_component = googleResultObject.address_components[i];
				for(var j = 0; j < address_component.types.length; j++) {
					var type = address_component.types[j];
					for (var property in _ADDRESS_TYPES_PLUS) {
						if (_ADDRESS_TYPES_PLUS.hasOwnProperty(property)) {
							var google_type = _ADDRESS_TYPES_PLUS[property].google_type;
							if(type == google_type) {
								result[property] = address_component[_ADDRESS_TYPES_PLUS[property].google_target];
							}
						}
					}
				}
			}

			if(googleResultObject.geometry && googleResultObject.geometry.location) {
				result['coords'] = {
					lat : googleResultObject.geometry.location.lat,
					lon : googleResultObject.geometry.location.lng
				}
			}

			// the city is actually the "locality" provided by google, which is not necessarily a city, but rather a
			// city, (comma) state.  So split this along the comma and get just the city.
			if(result.city && result.city.indexOf(",") != -1) {
				result.city = result.city.split(",");
				result.city = result.city[0];
			}
			if(result.street_number && result.street_name) {
				result.address_line_1 = result.street_number + " " + result.street_name;
			}
			else if (result.street_name && !result.street_number) {
				result.address_line_1 = result.street_name;
			}

			return result;
		},
		getPositionPostal : function(opt_googleMapsPosition){
			var deferred = $q.defer();
			Geocoder._deconstruct(opt_googleMapsPosition).then(function(results){
				var mainResults = results[0];
				angular.forEach(mainResults.address_components, function(val, key){
					angular.forEach(val.types, function(type){
						if(type == "postal_code"){
							deferred.resolve(val.long_name);
						}
					});
				});
			});
			return deferred.promise;
		},
		geocodePosition : function(googleMapsPosition) {
			Geocoder._setPosition(googleMapsPosition);
			return Geocoder._deconstruct();
		},

		_parseAddressToString : function(locationObject) {
			var location = locationObject, locationFull = "";
			if(location.address_line_1) {
				locationFull += location.address_line_1;
			}
			if(location.city) {
				if(location.address_line_2) {
					locationFull += ","
				}
				locationFull += " " + location.city;
			}
			if(location.state) {
				if(location.city) {
					locationFull += ", "
				}
				locationFull += location.state;
			}
			if(location.zipcode) {
				locationFull += " " + location.zipcode;
			}
			return locationFull;
		},

		geocodeObjectAddress : function(address) {
			var deferred = $q.defer();
			address = Geocoder._parseAddressToString(address);
			Geocoder.geocodeTextualAddress(address).then(function(response){
				deferred.resolve(response);
			}, function(err){
				deferred.reject(err);
			})
			return deferred.promise;
		},

		geocodeTextualAddress : function(address) {
			var deferred = $q.defer();
			Geocoder.geocoder.geocode(address, function (err, response) {
				if (response && response.status == 'OK') {
					var address = response.results[0].formatted_address;
					numCommas = address.match(/,/g).length;
					if (numCommas >= 3) {
						deferred.resolve(Geocoder.createLocationFromAPIResponse(response.results[0]));
					} else {
						deferred.reject(false);
					}
				} else {
					deferred.reject(false);
				}
			});
			return deferred.promise;
		}
	};
	return Geocoder;
};