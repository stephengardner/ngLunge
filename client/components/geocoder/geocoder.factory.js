lungeApp.factory("Geocoder", ['$q', 'uiGmapGoogleMapApi', function($q, GoogleMapApi){
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
			GoogleMapApi.then(function(maps) {
				if(!Geocoder.geocoder.geocode)
					Geocoder.geocoder = new maps.Geocoder();
				deferred.resolve(Geocoder);
			});
			return deferred.promise;
		},

		// Used still, to create a Lunge location from a Google API response.  Used by the
		// places-autocomplete directive
		createLocationFromAPIResponse : function(result) {
			var updatedLocation = Geocoder._unwrapAddressComponents(result);
			updatedLocation.google = {
				placesAPI : {
					formatted_address : result.formatted_address
				}
			};
			console.log("\n\nTHIS is out complete location:\n\n", updatedLocation);
			return updatedLocation;
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
			angular.forEach(googleResultObject.address_components, function(val, key){
				angular.forEach(val.types, function(type){
					angular.forEach(_ADDRESS_TYPES_PLUS, function(_typeObj, _type){
						if(type == _typeObj.google_type) {
							result[_type] = val[_typeObj.google_target];
						}
					})
				});
			});
			if(googleResultObject.geometry && googleResultObject.geometry.location) {
				result['coords'] = {
					lat : googleResultObject.geometry.location.lat(),
					lon : googleResultObject.geometry.location.lng()
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
		
		geocodeTextualAddress : function(address) {
			Geocoder.geocoder.geocode({ 'address': address }, function (results, status) {

				/* The code below only gets run after a successful Google service call has completed.
				Because this is an asynchronous call, the validator has already returned a 'true' result to
				supress an error message and then cancelled the form submission.  The code below needs to fetch
				the true validation from the Google service and then re-execute the jQuery form validator to
				display the error message.  Futhermore, if the form was
				 being submitted, the code below needs to resume that submit. */

				// Google reported a valid geocoded address
				if (status == google.maps.GeocoderStatus.OK) {
					// Get the formatted Google result
					var address = results[0].formatted_address;

					/* Count the commas in the fomatted address. This doesn't look great, but it helps us
					understand how specific the geocoded address is.  For example, "CA" will geocde to
					"California, USA". */
					numCommas = address.match(/,/g).length;

					/* A full street address will have at least 3 commas.  Alternate techniques involve fetching
					the address_components returned by Google Maps. That code looked even more ugly. */
					if (numCommas >= 3) {

						console.log("This is a valid address");
						/* Replace the first comma found with a line-break */
						address = address.replace(/, /, "\n");

						/* Remove USA from the address (remove this, if this is important to you) */
						address = address.replace(/, USA$/, "");
						/*
						// Set the textarea value to the geocoded address
						$(element).val(address);

						// Cache this latest result
						$(element).data("LastAddressValidated", address);

						// We have a valid geocoded address
						$(element).data("IsValid", true);
						*/
					} else {
						console.log("This is not a valid address");
						/* Google Maps was able to geocode the address, but it wasn't specific enough (not enough commas) to be a valid street address. */
						//$(element).data("IsValid", false);
					}

					// Otherwise the address is invalid
				} else {
					//$(element).data("IsValid", false);
				}

				// We're no longer in the midst of validating
				//$(element).data("IsChecking", false);

				// Get the parent form element for this address field
				//var form = $(element).parents('form:first');

				/* This code is being run after the validation for this field, if the form was being submitted
				before this validtor was called then we need to re-submit the form. */
				if (1/*$(element).data("SubmitForm") == true*/) {
					//form.submit();
				} else {
					// Re-validate this property so we can return the result.
					//form.validate().element(element);
				}
				console.log("our address is: ", address);
			});
		}
	};
	return Geocoder;
}]);