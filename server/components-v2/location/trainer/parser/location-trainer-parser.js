var Promise = require("promise");
var SmartyStreets = require('machinepack-smartystreets');
var async = require("async");
var config = require("../../../../config/environment")
;
module.exports = function setup(options, imports, register) {
	var logger = imports.logger.info;
	var credentials = {
		authId : config.smartyStreets.authId,
		authToken : config.smartyStreets.authToken
	};
	function parseLocationUsingSmartyStreets(location) {
		return new Promise(function (resolve, reject) {
			if (!location.address_line_1) {
				err = new Error();
				err.field = 'address_line_1';
				err.message = 'Missing address.';
				return reject(err);
			}
			if (!location.state) {
				err = new Error();
				err.field = 'state';
				err.message = 'Missing state.';
				return reject(err);
			}
			if (!location.city) {
				err = new Error();
				err.field = 'city';
				err.message = 'Missing city.';
			}
			var params = {
				authId: credentials.authId,
				authToken: credentials.authToken,
				street: location.address_line_1,
				secondary: location.address_line_2,
				//input_id: 'address-123',
				//street2: 'North',
				//secondary: 'Suite 2A',
				city: location.city,
				state: location.state,
				zipcode: location.zipcode
				//lastline: 'Doylestown, PA 18901',
				//addressee: 'Jane Doe',
				//urbanization: 'San Juan',
				//candidates: '1, 5, or 10 (max value)'
			};
			SmartyStreets.verifyAddress(params).exec({
				error: function (err) {
					//logger.error(err);
					reject(err);
				},
				success: function (data) {
					resolve(data);
					//logger.info("Data?", data);
				}
			});
		});
	}
	function convertSmartyStreetsResponseToLungeLocation(response) {
		logger.verbose("Convering response:", response, " into a lunge location");
		try {
			var returnableLocation = {
				city : response.components.city_name,
				state : response.components.state_abbreviation,
				zipcode : response.components.zipcode,
				address_line_1 : response.delivery_line_1,
				address_line_2 : response.delivery_line_2,
				coords : {
					lat : response.metadata.latitude,
					lon : response.metadata.longitude
				},
				smarty_streets_response : response
			};
		}
		catch(err) {
			logger.error(err);
			return {};
		}
		return returnableLocation;
	}

	function parseLocationsFromTrainer(trainer) {
		return new Promise(function(resolve, reject) {
			if(!trainer.locations || !trainer.locations.length) {
				return resolve([]);
			}
			else {
				var returnLocations = [];
				async.eachSeries(trainer.locations, function iterator(location, callback) {
					// sometimes a location can be null, what?
					if(!location) {
						callback();
					}
					else if (location.type == "manual") {
						console.log("Received a manual location:", location);
						parseLocationUsingSmartyStreets(location).then(function(response){
							var index = trainer.locations.indexOf(location);
							console.log("The response was :", response);
							var convertedLocation = convertSmartyStreetsResponseToLungeLocation(response[0]);
							// set the title since it gets lost in the transformation
							convertedLocation.title = location.title;
							returnLocations.push(convertedLocation);
							//trainer.locations[index] = convertedLocation;
							callback(null);
						}).catch(callback);
					}
					else {
						returnLocations.push(location);
						callback(null);
					}
				}, function done(err) {
					if(err) return reject(err);
					resolve(returnLocations);
				});
			}
		})
	}
	var locationTrainerParser = {
		parse : parseLocationsFromTrainer
	};
	register(null, {
		locationTrainerParser : locationTrainerParser
	})
}