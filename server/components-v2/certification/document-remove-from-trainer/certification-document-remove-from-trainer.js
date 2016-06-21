var Promise = require('promise'),
	async = require('async'),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register) {
	var certificationPopulator = imports.certificationPopulator;
	var certificationDocumentRemoveFromTrainer = {
		remove : function(req, res) {
			// var found = false;
			// var foundCertification;
			// expect(req.trainer).to.exist;
			// expect(req.trainer).to.have.property('certifications_v2');
			// expect(req.trainer.certifications_v2).to.be.an.array;
			// for(var i = 0; i < req.trainer.certifications_v2.length; i++) {
			// 	var certification_v2 = req.trainer.certifications_v2[i];
			// 	expect(certification_v2.certification_type).to.exist;
			// 	expect(certification_v2.verification).to.exist;
			// 	expect(certification_v2.verification.files).to.be.an.array;
			// 	for(var k = 0; k < certification_v2.verification.files.length; k++ ) {
			// 		var file = certification_v2.verification.files[k];
			// 		if(file._id == req.params.file_id) {
			// 			file.active = false;
			// 			found = true;
			// 			foundCertification = certification_v2;
			// 			break;
			// 		}
			// 	}
			// }
			// req.trainer.save(function(err, savedTrainer){
			// 	if(err) return res.json(422, err);
			// 	// respond with the certification.  On the remove file page we just update it with this
			// 	// new ceritificaiton, which contains all the files now that we need.
			// 	// If we don't want to do this we can pass some other param into req.body if we'd like...
			// 	certificationPopulator.populate(foundCertification).then(function(populatedCertification){
			// 		return res.json(populatedCertification);
			// 	}).catch(function(err){
			// 		return res.json(422, err);
			// 	})
			// });
			//res.json(req.trainer);
			var found = false,
				foundCertification,
				populatedCertification
				;
			async.waterfall([
				function validate(callback){
					try {
						expect(req.trainer).to.exist;
						expect(req.trainer).to.have.property('certifications_v2');
						expect(req.trainer.certifications_v2).to.be.an.array;
					}
					catch(err) {
						return callback(err);
					}
					callback();
				},
				function attemptToFind(callback) {
					for(var i = 0; i < req.trainer.certifications_v2.length; i++) {
						var certification_v2 = req.trainer.certifications_v2[i];
						try {
							expect(certification_v2.certification_type).to.exist;
							expect(certification_v2.verification).to.exist;
							expect(certification_v2.verification.files).to.be.an.array;
						}
						catch(err) {
							return callback(err);
						}
						for(var k = 0; k < certification_v2.verification.files.length; k++ ) {
							var file = certification_v2.verification.files[k];
							if(file._id == req.params.file_id) {
								file.active = false;
								found = true;
								foundCertification = certification_v2;
								break;
							}
						}
						callback();
					}
				},
				function saveTrainer(callback) {
					req.trainer.save(function(err, savedTrainer){
						if(err) return res.json(422, err);
						// respond with the certification.  On the remove file page we just update it with this
						// new ceritificaiton, which contains all the files now that we need.
						// If we don't want to do this we can pass some other param into req.body if we'd like...
						certificationPopulator.populate(foundCertification).then(function(response){
							populatedCertification = response;
							callback();
						}).catch(function(err){
							return res.json(422, err);
						})
					});
				}
			], function(err){
				if(err) return handleError(res, err);
				return res.json(populatedCertification);
			})
		}
	};
	function removeWaterfall(req, res) {
		return Promise(function(resolve, reject){
			var found = false,
				foundCertification
			;
			async.waterfall([
				function validate(callback){
					try {
						expect(req.trainer).to.exist;
						expect(req.trainer).to.have.property('certifications_v2');
						expect(req.trainer.certifications_v2).to.be.an.array;
					}
					catch(err) {
						return callback(err);
					}
					callback();
				},
				function attemptToFind(callback) {
					for(var i = 0; i < req.trainer.certifications_v2.length; i++) {
						var certification_v2 = req.trainer.certifications_v2[i];
						try {
							expect(certification_v2.certification_type).to.exist;
							expect(certification_v2.verification).to.exist;
							expect(certification_v2.verification.files).to.be.an.array;
						}
						catch(err) {
							return callback(err);
						}
						for(var k = 0; k < certification_v2.verification.files.length; k++ ) {
							var file = certification_v2.verification.files[k];
							if(file._id == req.params.file_id) {
								file.active = false;
								found = true;
								foundCertification = certification_v2;
								break;
							}
						}
						callback();
					}
				},
				function saveTrainer(callback) {

					req.trainer.save(function(err, savedTrainer){
						if(err) return res.json(422, err);
						// respond with the certification.  On the remove file page we just update it with this
						// new ceritificaiton, which contains all the files now that we need.
						// If we don't want to do this we can pass some other param into req.body if we'd like...
						certificationPopulator.populate(foundCertification).then(function(populatedCertification){
							return res.json(populatedCertification);
						}).catch(function(err){
							return res.json(422, err);
						})
					});
				}
			], function(err){
				if(err) return reject(err);
				return resolve();
			})
		})
	}
	register(null, {
		certificationDocumentRemoveFromTrainer : certificationDocumentRemoveFromTrainer
	})
}