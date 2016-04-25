var Promise = require('promise'),
	async = require('async')
;
module.exports = function setup(options, imports, register){
	var certificationOrganizationModel = imports.certificationOrganizationModel;
	var certificationMapCreator = {
		// note - this uses population, the createWithoutPopulating might be what you want for a virtual! (efficient)
		create : function(trainer) {
			return new Promise(function(resolve, reject){
				trainer
					.populate('certifications_v2.certification_type',
					function(err, populatedTrainer) {
						certificationOrganizationModel
							.populate(populatedTrainer,
							{
								path : 'certifications_v2.certification_type.organization',
								model : 'CertificationOrganization'
							},
							function(err, unused){
								if (err) return reject(err);

								var map = parseAfterPopulation(populatedTrainer);
								return resolve(map);
								//return resolve(populatedTrainer)
							});
					});
			})
		},
		// used in the trainer virtual.  If the trainer is populated, this will be invoked!
		createWithoutPopulating : parseAfterPopulation
	}

	function parseAfterPopulation(populatedTrainer){
		var map = {};
		if(!populatedTrainer.certifications_v2 || !populatedTrainer.certifications_v2.length) {
			return map;
		}
		// iterate
		for(var i = 0; i < populatedTrainer.certifications_v2.length; i++) {
			var certification_v2 = populatedTrainer.certifications_v2[i];
			// the certification_v2 can be deleted, in which case the active flag simply goes to false.
			// this helps with recovering files if you deleted a certificate
			if(certification_v2.active) {
				var certification_v2_certification_type = certification_v2.certification_type;
				if(certification_v2_certification_type.organization) {
					var mapKey = certification_v2_certification_type.organization._id;
					var exists = checkIfMapKeyExists(mapKey);
					if(!exists) {
						// instantiate the map, then populate it
						createMapKeyAndInsertCertiificationV2(mapKey, certification_v2);
					}
					else {
						// populate the map, it's already instantiated
						pushCertificationV2ToMapKey(mapKey, certification_v2);
					}
					addStatusCountForCertificationToMapKey(mapKey, certification_v2);
				}
				else {
					console.log("\n\nPOTENTIAL ERROR:\n\n certification_v2_certification_type does not exist for " +
					"list:", populatedTrainer.certifications_v2);
				}
			}
		}

		function addStatusCountForCertificationToMapKey(mapKey, certification_v2) {
			map[mapKey].count++;
			if(certification_v2.verification.status == 'Pending') {
				map[mapKey].count_pending++;
			}
			if(certification_v2.verification.status == 'Verified') {
				map[mapKey].count_verified++;
			}
		}

		function createMapKeyAndInsertCertiificationV2(mapKey, certification_v2) {
			createMapKeyForCertificationOrganization(certification_v2_certification_type.organization);
			pushCertificationV2ToMapKey(mapKey, certification_v2);
		}
		function pushCertificationV2ToMapKey(key, certification_v2) {
			if(certification_v2.status == 'Pending') {
				map[key].count_pending++;
			}
			if(certification_v2.status == 'Verified') {
				map[key].count_verified++;
			}
			// note - if you want to delete something from the certification_v2_certification_type you must clone it.
			// somehow it's immutable.  I guess mongo does that.
			map[key].certification_v2s.push(certification_v2);
			//map[key].certification_types.push(certification_v2_certification_type);
		}
		function checkIfMapKeyExists(key) {
			return map[key];
		}
		function createMapKeyForCertificationOrganization(organization){
			map[organization._id] = {
				name : organization.name,
				count : 0,
				count_verified : 0,
				count_pending : 0,
				certification_types : [],
				certification_v2s : []
			}
			return true;
		}
		return map;
	}
	register(null, {
		certificationMapCreator : certificationMapCreator
	})
}