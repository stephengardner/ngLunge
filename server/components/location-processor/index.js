var $q = require('q');
var GoogleMapApi = require('googlemaps');
var geocoder = require('../geocoder')($q, GoogleMapApi);
var Promise = require("promise");
var _ = require("lodash");
var async = require("async");
var logger = require("../logger")();
var exports = function(){
	var LocationProcessor = {
		parseTrainer : function(trainer) {
			return new Promise(function(resolve, reject){
				//if(trainer.locations && trainer.locations.length) {
					LocationProcessor.parseTrainerLocations(trainer).then(function(results){
						trainer.locations = results;
						trainer = LocationProcessor.setPrimaryLocationFromLocationsArray(trainer);
						resolve(trainer);
					}).catch(function(err){
						reject(err);
					});
				//}
			})
		},
		setPrimaryLocationFromLocationsArray : function(trainer) {
			console.log("setPrimaryLocationFromLocationsArray()");
			try {
				if(trainer.locations && trainer.locations.length) {
					console.log("Iterating through lcation...");
					for(var i = 0; i < trainer.locations.length; i++) {
						var location = trainer.locations[i];
						console.log(location);
						if(location.primary) {
							delete location._id;
							//delete trainer._id;
							delete trainer.__v;
							var merged = _.extend(trainer/*.toObject()*/, { location : location });
							//console.log("Setting primary location to:", location);
							//_.merge(trainer.location, location);
							//trainer.location = _.merge({}, location);
							console.log("\nExtended trainer before returning is:", merged, "\n");
							delete merged.password;
							delete merged.hashedPassword;
							return merged;
						}
					}
					// if we haven't returned yet, set the primary location
					trainer.locations[0].primary = true;
					trainer.location = _.extend({}, trainer.locations[0]);
				}
			}
			catch(err) {
				logger.error(err);
			}
			return trainer;
		},
		parseTrainerLocations : function(trainer) {
			return new Promise(function(resolve, reject){
				var tasks = [];
				if(trainer.locations && trainer.locations.length) {
					for(var i = 0; i < trainer.locations.length; i++) {
						var location = trainer.locations[i];
						if(location.type == "manual"){
							tasks.push(function(callback){
								LocationProcessor.parseManualLocation(this).then(function(result){
									callback(null, result)
								}).catch(callback);
							}.bind(location));
						}
						else {
							tasks.push(function(callback){
								callback(null, this);
							}.bind(location))
						}
					}
				}
				else {
					return resolve(trainer);
				}
				async.series(tasks,
					function(err, results){
						if(err) return reject(err);
						else resolve(results);
					})
			})
		},
		parseManualLocation : function(location) {
			return new Promise(function(resolve, reject){
				if(location.type == "manual"){
					geocoder.init().then(function(){
						geocoder.geocodeObjectAddress(location).then(function(response){
							response.title = location.title ? location.title : 'My Location';
							console.log("Geocoder response:", response);
							resolve(response);
						}, function(err){
							console.log("geocoder.geocodeObjectAddress promise rejected with err", err);
							reject(err);
						}).catch(function(err){
							console.log("geocoder.geocodeObjectAddress caught exception:", err);
							reject(err);
						});
					});
				}
				else {
					reject("This must be a manual location")
				}
			}.bind(this))
		}
	};
	return LocationProcessor;
}
module.exports = exports;