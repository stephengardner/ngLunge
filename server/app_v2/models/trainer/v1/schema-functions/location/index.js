var _ = require('lodash');

var validatePresenceOf = function(value) {
	return value && value.length;
};
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

	// null and undefined are "empty"
	if (obj == null) return true;

	// Assume if it has a length property with a non-zero value
	// that that property is correct.
	if (obj.length > 0)    return false;
	if (obj.length === 0)  return true;

	// Otherwise, does it have any properties of its own?
	// Note that this doesn't handle
	// toString and valueOf enumeration bugs in IE < 9
	for (var key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
}

module.exports = function(TrainerSchema) {
	/*
	 TrainerSchema.pre('save', function (next) {
	 if (validatePresenceOf(this.locations)) {
	 for(var i = 0; i < this.locations.length; i++) {
	 var location = this.locations[i];
	 if(null == location) {
	 this.locations[i] = { address_line_1 : '' };
	 }
	 }
	 }
	 next();
	 })
	 */
	// PRE SAVE HOOKS
	TrainerSchema
		.pre('save', function(next) {
			if (!this.isNew) return next();
			/*
			 if(this.registration.sent > 0 && !this.resitration.resend) {
			 return this.invalidate("email", "An activation link has already been sent to that user");
			 }
			 */
			/*
			 if (validatePresenceOf(this.location) && !validatePresenceOf(this.locations)) {
			 console.log("*\n*\nWARN*\n*\n LOCATION being auto pushed to LOCATIONS *\n*\n*\n");
			 this.locations.push(this.location);
			 }
			 */
			next();
		});

	// if the primary location was deleted, set the primary location to be the next location.
	// if there are no locations, delete the primary location altogether
	TrainerSchema
		.pre('save', function(next) {
			// if the primary location is set and there are no lcoations, put this in the locations array
			// this occurs when the primary location is added for the first time, or without any other locations
			/*
			 if(this.hasLocationObject() && !this.hasLocationsArray()){
			 var newLocation = _.extend({}, this.location);
			 this.locations.push(newLocation);
			 this.markModified("locations");
			 }
			 */
			next();
		});

	// VIRTUALS
	TrainerSchema.virtual('location.for_google_search').get(function () {
		var locationFull = "";
		if(this.location.google.placesAPI.formatted_address) {
			return this.location.google.placesAPI.formatted_address;
		}
		else {
			if(this.location.address1) {
				locationFull += this.location.address1;
			}
			if(this.location.city) {
				if(this.location.address1) {
					locationFull += ", "
				}
				locationFull += this.location.city;
			}
			if(this.location.state) {
				if(this.location.city) {
					locationFull += ", "
				}
				locationFull += this.location.state;
			}
			if(this.location.zipcode) {
				locationFull += " " + this.location.zipcode;
			}
		}
		return locationFull;
	});
	TrainerSchema.virtual('location.cityState').get(function () {
		return (this.location.city && this.location.state ) ? this.location.city + ", " + this.location.state : "Set Location";
	});

	TrainerSchema.path('locations')
		.validate(function(locations) {
			if (validatePresenceOf(locations)) {
				for ( var i=0; i < locations.length; i++ ) {
					var checkLocation = locations[i];
					if (null == checkLocation) {
						return this.invalidate("location", "That location could not be found, please try a more precise location.");
					}
				}
			}
		});

	//TrainerSchema.path('registration').validate(function(registration){
	//});
	// VALIDATORS
	// if primary location was updated, we must update the locations primary location
	TrainerSchema.path('locations')
		.validate(function(locations) {
			if(validatePresenceOf(locations)) {
				var i;
				for (i=0; i < locations.length; i++ ) {
					var checkLocation = locations[i];
					if(checkLocation) {
						for(var k = 0; k < locations.length; k++) {
							if(k != i) {
								var checkLocationAgainst = locations[k];
								if(checkLocationAgainst) {
									if((checkLocation.coords && checkLocationAgainst.coords) &&
										(checkLocation.coords.lat == checkLocationAgainst.coords.lat)
										&& (checkLocation.coords.lon == checkLocationAgainst.coords.lon)
									) {
										if(checkLocation.address_line_1 == checkLocationAgainst.address_line_1) {
											console.log("The location with the name:", checkLocationAgainst.title, " is the same as the location with the name: ", checkLocation.title, "... here are the total locations:", locations);
											//console.log("locations are:", locations, " and checkLocation == ", checkLocation, " and checkLocationAgainst = ", checkLocationAgainst, " and i = ", i, " and k = ", k);
											return this.invalidate("location", "That location has already been added!");
										}
									}
								}
							}
						}
					}
				}
				for(i = 0; i < locations.length; i++) {
					var location = locations[i];
					if(location) {
						if(!location.type == 'manual' && !location.address_line_1) {
							this.invalidate("location", "Please include an address");
						}
						if(!location.address_line_1) {
							console.log("There is no address_line_1 for the location:", location);
							// if this err pops up, don't include the city/state ones.
							// because in reality, they might have included a city/state but the smartystreets
							// processor didn't end up showing it.
							// As of 8.29.2016 I'm remvoing this.
							// I'm letting them click, for example, "Washington DC" as an address
							// return this.invalidate("location", "Please include a more exact address");
						}
						if(!location.city) {
							this.invalidate("city", "Please include a city");
						}
						if(!location.state) {
							this.invalidate("state", "Please include a state");
						}
						if(location.coords && (typeof location.coords.lat !== "undefined") && (typeof location.coords.lon !== "undefined")) {

						}
						else {
							console.log("The location coords are not available... here is the full location: ", location);
							return this.invalidate("location", "There was a problem processing your locations coordinates");
						}
					}
					else {
						//return this.invalidate("location", "This location is not valid");
					}
				}
			}
		});

	// Validate title
	TrainerSchema.path('locations')
		.validate(function(locations) {
			//console.log("validating location title");
			if(validatePresenceOf(locations)) {
				for(var i = 0; i < locations.length; i++) {
					var location = locations[i];
					if(location) {
						var title = location.title;
						if(!validatePresenceOf(title)) {
							return this.invalidate("title", "Title cannot be blank");
						}
						if(title.length > 30) {
							return this.invalidate("title", "Title must be less than 30 characters");
						}
					}
				}
			}
		});

	// Validate state for non-primary locations
	TrainerSchema.path('locations')
		.validate(function(locations) {
			//console.log("validating location title");
			if(validatePresenceOf(locations)) {
				for(var i = 0; i < locations.length; i++) {
					var location = locations[i];
					if(location) {
						var value = location.state;
						// removing state validation
						// if (value && (value != "MD" && value != "DC" && value != "VA")) {
						// 	console.log("INVALID USER STATE (not dc,md,va)");
						// 	return this.invalidate('state', 'Lunge is not active in that state');
						// }
					}
					else {
						console.log("\nWARNING - is this a null location? ::: ", location, " and all locations are:", locations);
					}
				}
			}
		});

	// Validate zipcode
	if (!TrainerSchema
			.path('location.zipcode')
			.validate(function (value) {
				if (!isEmpty(value)) {
					if (!(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value))) {
						return this.invalidate('zipcode', 'Please enter a valid zipcode');
					}
					else {
						return true;
					}
				}
				else {
					console.log("Zipcode is Empty!");
					return true;
					// but we cannot invalidate this zipcode because we may have just deleted the primary location
					// in which case the zip is empty, and it's valid.
				}
				//return this.invalidate('zipcode', 'Please enter a zipcode');
				//return true;
			}, 'Invalid zipcode')) {

	}

	// Validate state
	// TrainerSchema
	// 	.path('location.state')
	// 	.validate(function(value) {
	// 		if(!isEmpty(value)) {
	// 			if (value && (value != "MD" && value != "DC" && value != "VA")) {
	// 				console.log("INVALID USER STATE (not dc,md,va)");
	// 				return this.invalidate('state', 'Lunge is not active in that state');
	// 			}
	// 		}
	// 		return true;
	// 	}, 'Invalid state');

	// Validate coords
	TrainerSchema
		.path('location.coords')
		.validate(function(value) {
			//console.log("\n------------------\nTrainerSchema location.coords validate (nothing is happening yet) : \n''", value, "'\n---------\n------------\n");
		}, 'Invalid location coordinates');
}