var Promise = require("promise");
var SmartyStreets = require('machinepack-smartystreets');
var async = require("async");
var logger = require("../../logger")();
var config = require("../../../config/environment");
/*
// Verify one or more addresses using the SmartyStreets API
SmartyStreets.verifyAddress({
	authId: 'e8d46275-e58b-4b69-82c8-5d02745a5574',
	authToken: 'LCpI38kWxnO74Nw7ErxX',
	street: '1368 monroe st nw',
	//input_id: 'address-123',
	//street2: 'North',
	//secondary: 'Suite 2A',
	city: 'ada',
	state: 'Delaware',
	zipcode: '20009',
	//lastline: 'Doylestown, PA 18901',
	//addressee: 'Jane Doe',
	//urbanization: 'San Juan',
	//candidates: '1, 5, or 10 (max value)'
}).exec({
// An unexpected error occurred.
	error: function (err){
		logger.error(err);
	},
// OK.
	success: function (data){
		logger.info("Data?", data);
	},
});
*/
var exports = function() {
	var LocationProcessor = {
		credentials : {
			authId : config.smartyStreets.authId,
			authToken : config.smartyStreets.authToken
		},
		processLocation : function(location) {
			return new Promise(function(resolve, reject){
				var err;
				if(!location.address_line_1) {
					err = new Error();
					err.field = 'address_line_1';
					err.message = 'Missing address.';
					return reject(err);
				}
				if(!location.state) {
					err = new Error();
					err.field = 'state';
					err.message = 'Missing state.';
					return reject(err);
				}
				if(!location.city) {
					err = new Error();
					err.field = 'city';
					err.message = 'Missing city.';
					return reject(err);
				}
				var params = {
					authId: this.credentials.authId,
					authToken: this.credentials.authToken,
					street: location.address_line_1,
					secondary : location.address_line_2,
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
					error: function (err){
						//logger.error(err);
						reject(err);
					},
					success: function (data){
						resolve(data);
						//logger.info("Data?", data);
					}
				});
			}.bind(this))
		},
		convertSmartyStreetsResponseToLungeLocation : function(response) {
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
		},
		parseTrainer : function(trainer) {
			return new Promise(function(resolve, reject){
				if(trainer.locations && trainer.locations.length) {
					async.eachSeries(trainer.locations, function iterator(item, callback) {
						if (item.type == "manual") {
							console.log("Received a manual location:", item);
							LocationProcessor.processLocation(item).then(function(response){
								var index = trainer.locations.indexOf(item);
								console.log("The response was :", response);
								var convertedLocation = LocationProcessor
									.convertSmartyStreetsResponseToLungeLocation(response[0]);
								convertedLocation.title = item.title;
								trainer.locations[index] = convertedLocation;
								callback(null);
							})
						}
						else {
							callback(null);
						}
					}, function done(err) {
						//...
						if(err) return reject(err);
						resolve(trainer);
					});
				}
				else {
					resolve(trainer);
				}
			})
		}
	};
	return LocationProcessor;
}
module.exports = exports;