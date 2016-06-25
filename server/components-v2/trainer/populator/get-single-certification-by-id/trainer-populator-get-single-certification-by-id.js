var async = require('async'),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register) {
	var certificationOrganizationModel = imports.certificationOrganizationModel;
	var trainerPopulatorGetSingleCertificationById = {
		get : function(trainer, certification_v2_id) {
			return new Promise(function(resolve, reject) {
				expect(trainer).to.have.property('populate');
				expect(certification_v2_id).to.exist;
				trainer.populate('certifications_v2.certification_type', function(err, populated) {
					if(err) return reject(err);
					certificationOrganizationModel.populate(populated,
						{
							path : 'certifications_v2.certification_type.organization'
						}, function(err, trainer){
							if(err) return reject(err);
							var foundCertification = false,
								i
							for(i = 0; i < trainer.certifications_v2.length; i++) {
								var certification_v2 = trainer.certifications_v2[i];
								if(certification_v2._id == certification_v2_id) {
									foundCertification = certification_v2;
								}

							}
							if(foundCertification) {
								for(i = 0; i < foundCertification.verification.files.length; i++) {
									if(foundCertification.verification.files[i].active == false) {
										foundCertification.verification.files.splice(i, 1);
										i--;
									}
								}
								return resolve(foundCertification);
							}

							var newErr = new Error();
							newErr.code = 404;
							return reject(newErr);
						})
				})
			})
		}
	};
	register(null, {
		trainerPopulatorGetSingleCertificationById : trainerPopulatorGetSingleCertificationById
	})
}