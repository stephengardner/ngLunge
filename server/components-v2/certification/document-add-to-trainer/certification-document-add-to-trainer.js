var async = require('async'),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register){
	var certificationStatusSetter = imports.certificationStatusSetter;
	/**
	 *
	 * @type {{add: Function}}
	 */
	var certificationDocumentAddToTrainer = {
		/**
		 *
		 * @param trainer
		 * @param file
		 * @returns {Promise} - Returns the CERTIFICATION_V2 Model object that the file was appended to!
		 * This helps so that we can just send that certification_v2 back to the client.
		 * we actually will send both, because the AddCertificationToTrainer popup really just deals with
		 * a single certification, and we just want to send that back on updating...
		 */
		add : function(trainer, file) {
			return new Promise(function(resolve, reject){
				console.log("Adding file to trainer");
				expect(file.certificationV2).to.exist;
				expect(file.certificationV2).to.have.property('_id');
				expect(trainer).to.have.property('save');
				var fileCertificationV2 = file.certificationV2;
				var foundCertificationV2;
				for(var i = 0; i < trainer.certifications_v2.length; i++) {
					var certification_v2 = trainer.certifications_v2[i];
					console.log("Checking:", certification_v2._id,
						" against: ", fileCertificationV2._id);
					if(certification_v2._id == fileCertificationV2._id) {
						console.log("pushing file:", file, " onto cert type");
						file.uploaded_at = new Date();
						certification_v2.verification.files.push(file);
						foundCertificationV2 = certification_v2;
						break;
					}
				}
				try {
					certificationStatusSetter.set(foundCertificationV2);
				}
				catch(err) {
					return reject(err);
				}
				trainer.save(function(err, savedTrainer){
					if(err) return reject(err);
					console.log("foundCertificationV2 is:", foundCertificationV2);
					expect(foundCertificationV2).to.exist;
					expect(foundCertificationV2.verification.files).to.be.an.array;
					for(i = 0; i < foundCertificationV2.verification.files.length; i++) {
						if(foundCertificationV2.verification.files[i].active == false) {
							foundCertificationV2.verification.files.splice(i, 1);
							i--;
						}
					}
					return resolve(foundCertificationV2);
				})
			})
		}
	};
	register(null, {
		certificationDocumentAddToTrainer : certificationDocumentAddToTrainer
	})
}