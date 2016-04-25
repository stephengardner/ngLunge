var Promise = require('promise'),
	async = require('async'),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register) {
	var certificationPopulator = imports.certificationPopulator;
	var certificationDocumentRemoveFromTrainer = {
		remove : function(req, res) {
			expect(req.trainer).to.exist;
			expect(req.trainer).to.have.property('certifications_v2');
			expect(req.trainer.certifications_v2).to.be.an.array;
			var found = false;
			var foundCertification;
			for(var i = 0; i < req.trainer.certifications_v2.length; i++) {
				var certification_v2 = req.trainer.certifications_v2[i];
				expect(certification_v2.certification_type).to.exist;
				expect(certification_v2.verification).to.exist;
				expect(certification_v2.verification.files).to.be.an.array;
				for(var k = 0; k < certification_v2.verification.files.length; k++ ) {
					var file = certification_v2.verification.files[k];
					if(file._id == req.params.file_id) {
						console.log("GOTEM", file);
						file.active = false;
						found = true;
						foundCertification = certification_v2;
						break;
					}
				}
				//console.log("Got one:", i);
			}
			console.log("did we find the file?", found);
			req.trainer.save(function(err, savedTrainer){
				if(err) return res.json(422, err);
				// respond with the certification.  On the remove file page we just update it with this
				// new ceritificaiton, which contains all the files now that we need.
				// If we don't want to do this we can pass some other param into req.body if we'd like...
				//if(certification_v2.verification && certification_v2.verification.files) {
				//	for(var i = 0; i < certification_v2.verification.files.length; i++) {
				//		var file = certification_v2.verification.files[i];
				//		if(file.active == false) {
				//			certification_v2.verification.files.splice(i, 1);
				//			i--;
				//		}
				//	}
				//}
				certificationPopulator.populate(foundCertification).then(function(populatedCertification){
					return res.json(populatedCertification);
				}).catch(function(err){
					return res.json(422, err);
				})
			})
			//res.json(req.trainer);
		}
	};
	register(null, {
		certificationDocumentRemoveFromTrainer : certificationDocumentRemoveFromTrainer
	})
}