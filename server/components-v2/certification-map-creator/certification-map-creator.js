var async = require('async'),
	_ = require('lodash')
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
	};

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

		function getCertificationStatus(certification_v2) {
			return certification_v2.verification.status;
		}
		function addStatusCountForCertificationToMapKey(mapKey, certification_v2) {
			var organizationTypes = map[mapKey].types;
			var certificationStatus = getCertificationStatus(certification_v2);
			organizationTypes.count_all++;
			if(certificationStatus == 'Unverified') {
				organizationTypes.count_unverified++;
			}
			if(certificationStatus == 'Pending') {
				organizationTypes.count_pending++;
			}
			if(certificationStatus == 'Verified') {
				organizationTypes.count_verified++;
			}
			if(certificationStatus == 'Rejected') {
				organizationTypes.count_rejected++;
			}
		}

		function createMapKeyAndInsertCertiificationV2(mapKey, certification_v2) {
			createMapKeyForCertificationOrganization(certification_v2_certification_type.organization);
			pushCertificationV2ToMapKey(mapKey, certification_v2);
		}
		function pushCertificationV2ToMapKey(key, certification_v2) {
			var organizationTypes = map[key].types;
			var certificationStatus = getCertificationStatus(certification_v2);
			var verification = certification_v2.verification.toObject();
			var copyOfCertification = _.merge({}, certification_v2.toObject());
			copyOfCertification.verification = verification;//_.merge({}, verification);

			// console.log("CopyOfCertification.verification.files:", copyOfCertification.verification.files);
			if(certificationStatus == 'Unverified') {
				organizationTypes.unverified.push(copyOfCertification);
			}
			if(certificationStatus == 'Pending') {
				organizationTypes.pending.push(copyOfCertification);
			}
			if(certificationStatus == 'Verified') {
				organizationTypes.verified.push(copyOfCertification);
			}
			if(certificationStatus == 'Rejected') {
				organizationTypes.rejected.push(copyOfCertification);
			}
			// note - if you want to delete something from the certification_v2_certification_type you must clone it.
			// somehow it's immutable.  I guess mongo does that.
			organizationTypes.all.push(copyOfCertification);
			//map[key].certification_types.push(certification_v2_certification_type);
		}
		function checkIfMapKeyExists(key) {
			return map[key];
		}
		function createMapKeyForCertificationOrganization(organization){
			map[organization._id] = {
				_id : organization._id,
				name : organization.name,
				types : {
					all : [],
					unverified : [],
					pending : [],
					approved : [],
					rejected : [],
					count_all : 0,
					count_unverified : 0,
					count_pending : 0,
					count_verified : 0,
					count_rejected : 0
				}
			};
			return true;
		}
		return map;
	}
	register(null, {
		certificationMapCreator : certificationMapCreator
	})
};