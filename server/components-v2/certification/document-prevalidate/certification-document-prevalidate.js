var async = require('async'),
	expect = require('chai').expect
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var errorFormatter = imports.errorFormatter;

	var certificationDocumentPrevalidate = {
		validate : function(req) {
			return new Promise(function(resolve, reject) {
				expect(req.body.certificationV2).to.exist;
				expect(req.body.certificationV2).to.have.property('_id');
				expect(req.file).to.exist;
				expect(req.file).to.have.property('user_desired_name');
				expect(req.body.certificationV2).to.have.property('certification_type');
				expect(req.trainer).to.exist;
				if(req.file.user_desired_name.length > 30) {
					var err = errorFormatter.customValidationError(
						{
							type : 'limit',
							message : 'Name must be less than 30 characters.',
							path : 'name'
						}
					);
					return reject(err);
				}
				trainerModel.findById(req.trainer._id).exec(function(err, foundTrainer){
					if(err) return reject(err);
					if(!foundTrainer) return reject(404);
					var i, foundCertificationV2 = false;
					for(i = 0; i < foundTrainer.certifications_v2.length; i++) {
						var certification_v2 = foundTrainer.certifications_v2[i];
						if (certification_v2._id == req.body.certificationV2._id) {
							console.log("FOUND!");
							foundCertificationV2 = certification_v2;
						}
					}
					if(!foundCertificationV2) {
						return reject('No certification v2 found on this trainer with id: '
						+ req.body.certification_v2._id);
					}
					var certsActive = 0;
					for(i = 0; i < foundCertificationV2.verification.files.length; i++) {
						if(foundCertificationV2.verification.files[i].active == true) {
							certsActive++;
						}
					}
					if(certsActive >= 3) {
						var err = errorFormatter.customValidationError(
							{
								type : 'limit',
								message : 'You may only have 3 files pending vertification at one' +
								' time.  Please delete a file before uploading others.',
								path : 'file'
							}
						);
						return reject(err);
					}


					//var certification_v2_certification_type = certification_v2.certification_type;
					//console.log("Checking ", certification_v2._id, " and ", req.body.certification._id);
					//if(certification_v2.verification
					//	&& certification_v2.verification.files
					//	&& certification_v2_certification_type == req.body.certification._id) {
					//	console.log("Found it:", certification_v2);
					//	var certsActive = 0;
					//	for(var k = 0; k < certification_v2.verification.files.length; k++ ){
					//		if(certification_v2.verification.files[k].active == true) {
					//			certsActive++;
					//		}
					//	}
					//	if(certsActive >= 3) {
					//		var err = errorFormatter.customValidationError(
					//			{
					//				type : 'limit',
					//				message : 'You may only have 3 files pending vertification at one' +
					//				' time.  Please delete a file before uploading others.',
					//				path : 'file'
					//			}
					//		);
					//		return reject(err);
					//	}
					//}
					//}
					return resolve(req);
				})
			})
		}
	};

	register(null, {
		certificationDocumentPrevalidate : certificationDocumentPrevalidate
	})
}