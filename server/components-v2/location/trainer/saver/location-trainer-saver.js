var async = require('async'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var locationTrainerSaver = {
		save : function(trainer, parsedLocations) {
			return new Promise(function(resolve, reject){
				console.log("PRE-MAIN-location is:", trainer.location);
				trainer.locations = parsedLocations;
				resetPrimaryLocationIfLocationsDeleted(trainer);
				if(!isPrimaryLocationInLocationsArray(trainer)){
					setPrimaryLocation(trainer);
				}
				//else if(!isPrimaryLocationFound(trainer)){
					setPrimaryLocation(trainer);
				//}
				console.log("POST-main-location is:", trainer.location);

				trainer.markModified('locations');
				trainer.markModified('location');
				trainer.save(function(err, savedTrainer) {
					if(err) return reject(err);
					return resolve(savedTrainer);
				})
			})
		}
	};

	function resetPrimaryLocationIfLocationsDeleted(trainer) {
		if(trainer.locations && trainer.locations.length == 0) {
			trainer.location = {};
		}
	}
	function isPrimaryLocationInLocationsArray(trainer){
		var isPrimaryFound = false;
		if(trainer.locations && trainer.locations.length) {
			for(var i = 0; i < trainer.locations.length; i++) {
				if(trainer.locations[i] == trainer.location) {
					isPrimaryFound = true;
				}
			}
		}
		return isPrimaryFound;
	}
	function isPrimaryLocationFound(trainer) {
		if(trainer.locations
			&& trainer.locations.length
			&& (!trainer.location || !trainer.location.coords)) {
			return false;
		}
		return true;
	}
	function setPrimaryLocation(trainer) {
		var primaryFound = false;
		for(var i = 0; i < trainer.locations.length; i++) {
			var location = trainer.locations[i];
			if(location.primary) {
				primaryFound = true;
				trainer.location = _.extend(trainer.locations[i]);
			}
		}
		if(!primaryFound && trainer.locations[0]) {
			trainer.locations[0].primary = true;
			trainer.location = _.extend(trainer.locations[0]);
		}
	}
	register(null, {
		locationTrainerSaver : locationTrainerSaver
	})
}