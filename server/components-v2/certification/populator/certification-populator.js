var Promise = require('promise'),
	async = require('async'),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register) {
	var certificationTypeModel = imports.certificationTypeModel,
		certificationOrganizationModel = imports.certificationOrganizationModel;

	var certificationPopulator = {
		populate : function(certification_v2, keepDeletedFiles) {
			return new Promise(function(resolve, reject){
				certificationTypeModel
					.populate(certification_v2, {path : 'certification_type'}, function(err, unusedPopulated){
						if(err) return reject(err);
						certificationOrganizationModel.populate(certification_v2, {
							path : 'certification_type.organization'
						}, function(err, unusedPopulated){
							if(err) return reject(err);
							expect(certification_v2).to.have.property('verification');
							expect(certification_v2.verification.files).to.be.an.array;

							// Remove teh deleted files from the files array within the verification property
							// we can keep the deleted files if we pass in true for the "keepDeletedFiles" argument
							if(!keepDeletedFiles) {
								for(var i = 0; i < certification_v2.verification.files.length; i++) {
									var file = certification_v2.verification.files[i];
									console.log("Got file:", file);
									if(!file.active) {
										certification_v2.verification.files.splice(i, 1);
										i--;
									}

								}
							}
							return resolve(certification_v2);
						})
					})
			})
		}
	};
	register(null, {
		certificationPopulator : certificationPopulator
	})
}