var Promise = require('promise'),
	async = require('async'),
	mocha = require('mocha'),
	chai = require('chai'),
	expect = chai.expect,
	config = require('../../../config/environment')
	;
var maxFileMegabytes = config.certification.upload.maxSize, //MB. Set this value, the maxFileSize will be inferred
	maxFileSize = maxFileMegabytes * 1000000;
module.exports = function setup(options, imports, register) {
	var certificationDocumentUpload = imports.certificationDocumentUpload,
		certificationDocumentS3Upload = imports.certificationDocumentS3Upload,
		certificationDocumentAddToTrainer = imports.certificationDocumentAddToTrainer,
		certificationDocumentPrevalidate = imports.certificationDocumentPrevalidate,

		certificationOrganizationModel = imports.certificationOrganizationModel,
		trainerPopulatorGetSingleCertificationById = imports.trainerPopulatorGetSingleCertificationById,
		certificationPopulator = imports.certificationPopulator,
		certificationRemoveLocalFile = imports.certificationRemoveLocalFile,
	//certificationOrganizationModel = imports.certificaitonOr
		errorFormatter = imports.errorFormatter;
	logger = imports.logger.info
	;

	var customValidationError = function(res, errField, errMessage) {
		var err = {
			message : 'Custom Validation Failed',
			name : 'CustomValidationError',
			errors : {
			}
		};
		err.errors[errField] = {
			message : errMessage,
			name : 'CustomValidationError',
			path : errField,
			type : 'custom'
		};
		console.log("Returning validation error:", err);
		return validationError(res, err);
	};

	var validationError = function(res, err) {
		logger.error(err);
		if(err.code == 'LIMIT_FILE_SIZE') {
			console.log("File too large");
			return customValidationError(res, 'file', 'The file must be less than ' + maxFileSize / 1000000 + 'MB.  Please try uploading a smaller file.')
		}
		console.log("Sending validation error");
		return res.status(422).json(err);
	};
	var certificationDocumentProcess = {
		process : function(req, res) {
			process(req, res).then(function(response){
				console.log("Certificaiton file successfully processed");
				certificationPopulator.populate(response.certification_v2).then(function(populated){
					console.log("Populated certification");
					onSuccess(req).then(function(unused){
						return res.json(populated);
					}).catch(function(err){
						return validationError(res, err);
					});
				}).catch(function(err){
					onError(req, err).then(function(response){
						return validationError(res, err);
					}).catch(function(err){
						return validationError(res, err);
					})
				})
			}).catch(function(err){
				console.log("Certificaiton file not successfully processed");
				onError(req, err).then(function(response){
					console.log("onError completed successfully");
					return validationError(res, err);
				}).catch(function(err){
					console.log("onError completed unsuccessfully");
					return validationError(res, err);
				})
			})
		}
	};
	function onError(req, err) {
		return new Promise(function(resolve, reject){
			if(req.file) {
				certificationRemoveLocalFile.remove(req).then(function(response){
					return resolve(null);
				}).catch(reject);
			}
			else {
				return resolve(null);
			}
		})
	}
	function onSuccess(req) {
		return new Promise(function(resolve, reject){
			certificationRemoveLocalFile.remove(req).then(function(response){
				return resolve(null);
			}).catch(reject);
		})
	}
	function process(req, res) {
		return new Promise(function(resolve, reject){
			var updated_certification_v2;
			expect(req.trainer).to.exist;
			async.waterfall([
				function uploadLocally(callback) {
					certificationDocumentUpload.upload(req).then(function(response){
						callback(null);
					}).catch(callback);
				},
				function prevalidate(callback) {
					certificationDocumentPrevalidate.validate(req).then(function(response){
						callback(null);
					}).catch(callback);
				},
				function uploadToS3(callback) {
					certificationDocumentS3Upload.upload(req).then(function(response){
						callback(null);
					}).catch(callback);
				},
				function addFileToTrainer(callback){
					certificationDocumentAddToTrainer.add(req.trainer, req.file)
						.then(function(response){
							updated_certification_v2 = response;
							callback(null);
						}).catch(callback);
				},
				// todo implement
				function determineCertificationV2Status(callback) {
					callback();
				}
			], function(err){
				if(err) return reject(err);
				return resolve({ req : req, certification_v2 : updated_certification_v2});
			})
		})
	}
	register(null, {
		certificationDocumentProcess : certificationDocumentProcess
	})
}