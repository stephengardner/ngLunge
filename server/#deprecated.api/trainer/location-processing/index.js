var $q = require('q');
var GoogleMapApi = require('googlemaps');
var geocoder = require('../../../components/geocoder')($q, GoogleMapApi);
var _ = require("lodash");
var LocationProcessor = {
	init : function(trainer, params) {
		this.trainer = trainer;
		this.params = params;
		this.locations = params.locations;
		this.location = params.location;

		// if it's just updating the main location, the locations array will be empty just because I'm passing it like that,
		// but we don't want to delete them all, so do this:
		if(!this.locations && Object.keys(this.location).length != 0) {
			console.log("Warning, setting locationprocessor locations to equal trainer locations which are:", trainer.locations);
			this.locations = trainer.locations;
		}
	},

	_hasLocationsArray : function(){
		return this.locations && this.locations.length;
	},

	/**
	 * completely removes the primary location from the locations array and replaces it with new location
	 * @param newPrimary
	 * @private
	 */
	_replacePrimaryInArray : function() {
		var newPrimary = this.location;
		console.log("...");
		if(this._hasLocationsArray()) {
			console.log("Location Processor _replacePrimaryInArray()");
			for(var i = 0; i < this.locations.length; i++) {
				var oldLocation = this.locations[i];
				console.log("Processing oldLocation:",oldLocation);
				if(oldLocation.primary){
					this.locations.splice(i, 1, newPrimary);
					return true;
				}
			}
		}
		return false;
	},

	_replacePrimaryFromArray : function() {
		if(this._hasLocationsArray()) {
			console.log("Location Processor _replacePrimaryFromArray()");
			var primaryFound = false;
			for(var i = 0; i < this.locations.length; i++) {
				var location = this.locations[i];
				if(location.primary) {
					primaryFound = true;
					var newPrimaryLocation = _.extend({}, location);
					this.location = newPrimaryLocation;
					return true;
				}
			}

			// if the locations array has no primary in it, it probably means that we just deleted the primary
			// location, from the account page
			if(!primaryFound && this.locations.length) {
				var newPrimaryLocation = _.extend({}, this.locations[0]);
				this.locations[0].primary = true;
				this.location = newPrimaryLocation;
				return true;
			}
		}
		return false;
	},
	/*
	_forcePrimaryInArrayToUpdateWithNewPrimary : function() {
		if(this._hasLocationsArray()) {
			for(var i = 0; i < this.locations.length; i++) {
				var oldLocation = this.locations[i];
				if(oldLocation.primary){
					this.locations.splice(i, 1, newPrimary);
					return true;
				}
			}
		}
	},
	*/

	_parseManualLocation : function(){
		return new Promise(function(resolve, reject){
			if(this.location.type == "manual"){
				geocoder.init().then(function(){
					var location = LocationProcessor.location;
					geocoder.geocodeObjectAddress(location).then(function(response){
						var location = response;
						location.title = "Main Location";
						location.primary = true;
						LocationProcessor.location = location;
						LocationProcessor._replacePrimaryInArray(location);
						//checkProfilePagePrimaryLocationOverwrite(location);
						//console.log("\n-----------------\n all updated locations: \n", trainer.locations, "\n--------------------------\n");
						resolve(LocationProcessor);
					}, function(err){
						console.log("geocoder.geocodeObjectAddress promise rejected with err", err);
						reject(err);
					}).catch(function(err){
						console.log("geocoder.geocodeObjectAddress caught exception:", err);
						reject(err);
					});
				});
			}
		}.bind(this))
	},

	_pushLocationToArray : function() {
		this.locations.push(this.location);
	},

	_parseNonManualLocation : function() {
		/*
		 // if theres a primary location in the locations array, make sure to set it to the location object.
		 // there will only be a params.locations and no params.location in the event of a location update such as this
		 for(var i = 0; i < this.locations.length; i++) {
		 var location = this.locations[i];
		 if(location.primary && !trainer.compareLocationTo(location)) {
		 var newLocation = _.extend({}, location);
		 console.log("\n\n\n\n\n\n\nWARNING:\nSETTING NEW TRAINER MAIN LOCATION:", newLocation);
		 trainer.location = newLocation;
		 }
		 }
		 if(validatePresenceOf(trainer.locations)) {
		 console.log("\n\nChecking if primary location exists\n\n");
		 var primaryFound = false;
		 for(var i = 0; i < params.locations.length; i++) {
		 var location = params.locations[i];
		 if(trainer.compareLocationTo(location)){
		 console.log("\n\nPrimary location exists, it is:", location,"\n\n");
		 primaryFound = true;
		 }
		 }
		 if(!primaryFound) {
		 console.log("\n\nPrimary location doesnt exist, setting it to:", params.locations[0],"\n\n");
		 params.locations[0].primary = true;
		 trainer.location = params.locations[0];
		 }
		 */
		var location = this.location;

		console.log("Processor parseNonManualLocation");
		console.log("\n\n", location);
		console.log("\n\n", this.trainer.location);
		//console.log(!this.trainer.compareLocationTo(location));
		console.log("THIS TRAINER LOCATION IS:", this.trainer.location);
		console.log("\n\n THE NEW LOCATION IS:", location);

		if(location && !this.trainer.compareLocationTo(location)) {
			if(!this._replacePrimaryInArray()) {
				this._pushLocationToArray();
			}
		}

	},

	_parseNewLocationsArray : function() {
		return this._replacePrimaryFromArray();
		// set the location
	},

	process : function(trainer, params) {
		this.init(trainer, params);
		return new Promise(function(resolve, reject){
			if((!this.location || Object.keys(this.location).length == 0) && this.locations && this.locations.length) {
				this.location = trainer.location;
				this._parseNewLocationsArray();
				resolve(this);
			}
			else if(!this.location && this.locations && this.locations.length == 0) {
				// We've just deleted the last location, empty everything
				this.location = undefined;
				this.locations = undefined;
				resolve(this);
			}
			else if(this.location && this.location.type == "manual") {
				this._parseManualLocation().then(resolve, reject);
			}
			else if(this.location && this.location.type != "manual"){
				console.log("Parsing automatic location");
				this._parseNonManualLocation();
				resolve(this);
			}
			else {
				console.log("Parsing nothing");
				console.log("\n\nwe parsed nothing because this.locations was:", this.locations, " and this.locations was:", this.location, " and trainer.locations was :", trainer.locations, " and params.locations was:", params.locations, "\n\n\n");
				// otherwise we didn't need to process anything so just return exactly what the trainer had
				this.locations = this.trainer.locations;
				this.location = this.trainer.location;
				resolve(this);
			}
		}.bind(this));
	},
	updatePrimaryLocation : function(trainer, params) {

	}
};

module.exports = LocationProcessor;