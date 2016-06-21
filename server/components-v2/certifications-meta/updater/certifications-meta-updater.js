var async = require('async')
;
module.exports = function setup(options, imports, register) {
	var trainerPopulatorCertificationsAggregated = imports.trainerPopulatorCertificationsAggregated,
		certificationMapCreator = imports.certificationMapCreator
	;
	var certificationsMetaUpdater = {
		update : function(trainer) {
			var populatedTrainer,
				organizationMap
			;
			return new Promise(function(resolve, reject) {
				async.waterfall([
					function getMap(callback) {
						certificationMapCreator.create(trainer).then(function(map){
							console.log("The map:", map);
							organizationMap = map;
							callback();
						}).catch(callback);
					},
					function setTrainer(callback) {
						trainer.certifications_meta.organization_map = organizationMap;
						trainer.markModified('certifications_meta');
						trainer.markModified('certifications_meta.organization_map');
						trainer.markModified('certifications_meta.organization_map.verification');
						trainer.markModified('certifications_meta.organization_map.verification.files');
						callback();
					}
				], function(err) { 
					if(err) return reject(err);
					return resolve();
				})
			})
		}
	};

	register(null, {
		certificationsMetaUpdater : certificationsMetaUpdater
	})
}