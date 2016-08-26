/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trainers              ->  index
 * POST    /trainers              ->  create
 * GET     /trainers/:id          ->  show
 * PUT     /trainers/:id          ->  update
 * DELETE  /trainers/:id          ->  destroy
 */

'use strict';

var _ = require('lodash'),
	nodemailer = require('nodemailer'),
	jwt = require('jsonwebtoken'),
	config = require('../../../../config/environment'),
	$q = require('q'),
	GoogleMapApi = require('googlemaps'),
	util = require('util'),
	geocoder = require('../../../../components/geocoder')($q, GoogleMapApi),
	domain = require('domain'),
	logger = require("../../../../components/logger")(),
	EventEmitter = require('events').EventEmitter,
	async = require('async'),
	crypto = require('crypto'),
	moment = require('moment')
	;

var validationError = function(res, err) {
	return res.json(422, err);
};

var setErrorField = function(errObj, field, message) {
	errObj.errors[field] = {
		message : message,
		name : 'CustomValidationError',
		path : field,
		type : 'custom'
	};
}
var customValidationError = function(res, errField, errMessage) {
	var err = {
		message : 'Custom Validation Failed',
		name : 'CustomValidationError',
		errors : {
		}
	};
	if(typeof errField == 'object') {
		for(var i in errField) {
			if(errField.hasOwnProperty(i))
				setErrorField(err, errField[i], errField[i].message);
		}
	}
	else {
		setErrorField(err, errField, errMessage);
	}
	return validationError(res, err);
};

function handleError(res, err) {
	console.log("There was an error and logger should be outputting it...");
	logger.error(err);
	logger.error(err.message);
	logger.error(err.errors);
	return res.send(500, err);
}

var validatePresenceOf = function(value) {
	return value && value.length;
};

module.exports = function setup(options, imports, register) {
	var exports = {};
	var certificationOrganizationModel = imports.certificationOrganizationModel,
		certificationTypeModel = imports.certificationTypeModel,
		Trainer = imports.trainerModel,
		imageProfilePictureCrop = imports.imageProfilePictureCrop,
		imageProfilePictureS3Upload = imports.imageProfilePictureS3Upload,
		locationTrainerParser = imports.locationTrainerParser,
		locationTrainerSaver = imports.locationTrainerSaver,
		certificationDocumentRemoveFromTrainer = imports.certificationDocumentRemoveFromTrainer,
		trainerPopulatorCertificationsAggregated = imports.trainerPopulatorCertificationsAggregated,
		trainerContactEmail = imports.trainerContactEmail,
		profilePictureUploadLocal = imports.profilePictureUploadLocal,
		profilePictureUploadS3 = imports.profilePictureUploadS3,
		pictureCropper = imports.pictureCropper,
		trainerPopulator = imports.trainerPopulator,
		passwordResetSender = imports.passwordResetSender,
		bruteforce = imports.bruteforce
		;

	// Uploads the profile picture locally, so that the profile picture preview can be set
	exports.uploadProfilePicture = function(req, res) {
		profilePictureUploadLocal.upload(req).then(function(response){
			console.log("Done...");
			res.json(req.file);
		}).catch(function(err){
			console.log("Req uploaderror?", req.uploadError);
			if(req.uploadError) {
				if(req.uploadError && req.uploadError.code == 'LIMIT_FILE_SIZE') {
					return customValidationError(res, 'file', 'Please select an image smaller than ' +
						config.profile_picture.upload.maxSize + 'MB');
				}
			}
			return handleError(res, err);
		})
	};

	exports.passwordResetAuthenticate = function(req, res){
		var authenticationHash = req.params.authenticationHash,
			populatedTrainer,
			savedTrainer,
			foundTrainer
		;
		if(!authenticationHash) return handleError(res, 404);
		async.waterfall([
			function find(callback) {
				Trainer.findOne({
					'registration_providers.local' : true,
					'password_reset.authenticationHash' : authenticationHash
				}).exec(function(err, found){
					if(err) return callback(err);
					foundTrainer = found;
					return callback();
				})
			},
			function check(callback) {
				if(!foundTrainer) {
					return handleError(res, 404);//('/');
				}
				if(moment(foundTrainer.password_reset.expires_at).isBefore(moment(new Date()))) {
					return handleError(res, { error : 'expired' });
				}
				if(foundTrainer.password_reset.active == false) {
					return handleError(res, { error : 'used' });
				}
				callback();
			}
		], function(err, response){
			if(err) return handleError(res, err);
			return res.send(true);
		})
	};
	exports.passwordResetSubmit = function(req, res) {
		var populatedTrainer,
			savedTrainer,
			foundTrainer
			;
		console.log("Email:", req.body.email);
		async.waterfall([
			function find(callback) {
				Trainer.findOne({
					'registration_providers.local' : true,
					'email' : req.body.email
				}).exec(function(err, found){
					if(err) return callback(err);
					foundTrainer = found;
					return callback();
				})
			},
			function check(callback) {
				if(!foundTrainer) {
					return customValidationError(res, 'email', 'That email is not registered yet');
				}
				callback();
			},
			function populate(callback) {
				trainerPopulator.populate(foundTrainer).then(function(response){
					populatedTrainer = response;
					callback();
				}).catch(callback);
			},
			function brute(callback) {
				bruteforce.trainerPasswordReset.prevent(req, res, callback);
			},
			function createNewHash(callback) {
				populatedTrainer.password_reset.authenticationHash = crypto.randomBytes(20).toString('hex');
				populatedTrainer.password_reset.active = true;
				populatedTrainer.password_reset.expires_at = moment(new Date()).add(1, 'hour');
				populatedTrainer.password_reset.used_at = undefined;
				populatedTrainer.save(function(err, saved) {
					savedTrainer = saved;
					if(err) return callback(err);
					return callback();
				})
			},
			function sendEmail(callback) {
				passwordResetSender.send(savedTrainer).then(function(){
					callback();
				}).catch(callback);
			}
		], function(err, response){
			if(err) return handleError(res, err);
			return res.json({trainer : savedTrainer});
		})
	};
	
	exports.passwordResetConfirm = function(req, res){
		var newPass1 = String(req.body.password1),
			newPass2 = String(req.body.password2),
			authenticationHash = req.body.authenticationHash,
			savedTrainer,
			foundTrainer,
			token
		;
		console.log("Submitting new password '" + newPass1 + "'");
		async.waterfall([
			function validate(callback) {
				if(newPass1 !== newPass2) {
					return customValidationError(res, 'password2', 'The passwords must match')
				}
				if(newPass1.length < 6) {
					return customValidationError(res, 'password1', 'The password must be at least 6 characters')
				}
				callback();
			},
			function findTrainer(callback) {
				Trainer.findOne({
					'password_reset.authenticationHash' : authenticationHash,
					'password_reset.active' : true,
					'password_reset.expires_at' : { $gt : new Date() }
				}, function(err, response){
					if(err) return callback(err);
					if(!response) return callback(404);
					foundTrainer = response;
					callback();
				})
			},
			function setTrainer(callback) {
				foundTrainer.password_reset.active = false;
				foundTrainer.password_reset.used_at = new Date();
				foundTrainer.password = newPass1;
				callback();
			},
			function saveTrainer(callback) {
				foundTrainer.save(function(err, saved) {
					if(err) return callback(err);
					savedTrainer = saved;
					callback();
				})
			}
		], function(err, response){
			if(err) return handleError(res, err);
			token = jwt.sign({_id: savedTrainer._id }, config.secrets.session, { expiresInMinutes: 60*5 });
			return res.json({ trainer : savedTrainer, token: token, type : 'trainer' });
			// return res.json(savedTrainer);
		})
	};
	
	exports.uploadProfilePictureS3 = function(req, res) {
		async.waterfall([
			function crop(callback) {
				pictureCropper.crop(req).then(function(response){
					callback();
				}).catch(callback)
			},
			function upload(callback){
				profilePictureUploadS3.upload(req).then(function(response){
					callback(null, response);
				}).catch(callback)
			},
			function save(response, callback) {
				var profile_picture = {
					profile_picture : {
						thumbnail : {
							url : response.url
						}
					}
				};
				var updated = _.merge(req.trainer, profile_picture);
				updated.save(function (err, savedTrainer) {
					if (err) { return callback(err); }
					return callback(null, savedTrainer);
				});
			}
		], function(err, savedTrainer){
			if(err) return handleError(res, err);
			console.log("Done...");
			return res.json(savedTrainer);
		})
	};

// Get list of things
	exports.index = function(req, res) {
		Trainer.find({}, function (err, trainers) {
			if(err) { return handleError(res, err); }
			return res.status(200).json(trainers);
		});
	};

	exports.sendEmail = function(req, res) {
		Trainer.find({ email : req.params.email }, function(err, trainer) {
			if(err) { return handleError(res, err); }
			if(trainer[0]) {
				return handleError(res, {"message" : "That email address is already registered"});
			}
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'augdog911@gmail.com',
					pass: 'Augie!123'
				}
			});
			transporter.sendMail({
				from: 'augdog911@gmail.com',
				to: 'augdog911@gmail.com',
				subject: 'hello',
				text: 'hello world!'
			});
			return res.json(trainer[0]);
		})
	};

	exports.changeEmail = function(req, res) {
		if(req.body && req.body.email) {
			console.log("Attempting to change a trainers email to: " + req.body.email);
		}
		Trainer.findById(req.params.id, '-salt -hashedPassword', function(err, trainer){
			if(err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			if(req.user && req.user._id == trainer._id) {
				console.log("TESTING!111");
				trainer.email = req.body.email;
				trainer.save(function(err, trainer){
					console.log("TESTING!222");
					console.log("Error Changing Email?:", err);
					if(err) {
						return validationError(res, err);
					}
					if(!trainer) { return res.send(404); }
					return res.json(trainer);
				});
			}
			else {
				console.log("TESTING!333");
			}
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		if(!req.params.urlName && !req.params.id) {
			return res.status(404).send(404);
		}
		// if we use this to pass in a urlName, cast it to urlName.
		if(req.params.id && isNaN(req.params.id)){
			req.params.urlName = req.params.id;
			req.params.id = undefined;
		}
		var query = {};
		if(req.params.urlName) {query.urlName = req.params.urlName}
		else {query.id = req.params.id;}
		Trainer.findOne(query, '-salt -hashedPassword')
			// populate the certifications which are really the certification-types, subclasses of a parent certification
			.populate('certifications_v2.certification_type')
			.populate('specialties')
			.exec(function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }
				certificationOrganizationModel
					.populate(trainer,
						{path : 'certifications_v2.certification_type.organization', model : 'CertificationOrganization'},
						function(err, populatedTrainer){
							if(err) { return handleError(res, err); }
							return res.json(populatedTrainer);
						});
			});
	};


	exports.showType = function(req, res) {
		if(req.params.type == "all"){
			var json_result = {};
			Trainer.find({type : "in-home"}, function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }
				json_result['in-home'] =  trainer;//res.json(trainer);
				Trainer.find({type : "in-gym"}, function (err, trainer) {
					if(err) { return handleError(res, err); }
					if(!trainer) { return res.send(404); }
					json_result['in-gym'] = trainer;//res.json(trainer);
					return res.json(200, json_result);
				});
			});
		}
		else {
			Trainer.find({type : req.params.type}, function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }
				return res.json(trainer);
			});
		}
	};

// Creates a new thing in the DB.
	exports.create = function(req, res) {
		// if(req.body.password != req.body.password2) {
		// 	return customValidationError(res, 'password2', 'Passwords must match');
		// }
		if(req.body) {
			req.body.password = req.body.password ? req.body.password : ""
		}
		var newTrainer = new Trainer(req.body);
		newTrainer.provider = 'local';
		newTrainer.role = 'trainer';
		newTrainer.verified = false;
		newTrainer.save(function(err, trainer){
			if (err) return validationError(res, err);
			var token = jwt.sign({_id: trainer._id }, config.secrets.session, { expiresInMinutes: 60*5 });
			res.json({ trainer : trainer, type : 'trainer', token: token });
		});
	};

	var mongoose = require('mongoose');

	// Updates an existing thing in the DB.
	// Todo find out if i delete certifications but if certifications_v2 are actually used...
	exports.update = function(req, res, next) {
		if(req.body._id) { delete req.body._id; }
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		var trainer = req.trainer;
		delete trainer.__v;
		if(!trainer) { return res.send(404); }

		delete req.body.certifications;
		delete req.body.__v;
		if(req.body.name && req.body.name.full) {
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}
		for (var attrname in req.body) {
			trainer[attrname] = req.body[attrname];
		}
		delete trainer.password;
		locationTrainerParser.parse(trainer).then(function(parsedLocations){
			locationTrainerSaver.save(trainer, parsedLocations).then(function(savedTrainer){
				trainerPopulatorCertificationsAggregated.get(savedTrainer).then(function(populated){
					return res.status(200).json(populated);
				}).catch(function(err){
					return handleError(res, err);
				});
				// This was, for some reason, outrageously slow?  Maybe it was my connection, but sometimes it was OK,
				// but essentially we had the post save socket returning the correct thing anyways, I think
				// this wasn't necessary at all.
				//certificationTypeModel
				//	.populate(savedTrainer, 'certifications_v2.certification_type', function (err, populatedTrainer) {
				//		certificationOrganizationModel
				//			.populate(populatedTrainer, 'certifications_v2.certification_type.organization',
				//			function (err, morePopulatedTrainer) {
				//				return res.status(200).json(morePopulatedTrainer);
				//			});
				//	})
			}).catch(function(err) {
				return handleError(res, err);
			})
		}).catch(function(err){
			if(err.field) {
				return customValidationError(res, err.field, err.message);
			}
			return handleError(res, err);
		})
	};

	exports.updateOverwrite = function(req, res, next) {
		if(req.body._id) { delete req.body._id; }
		if(req.body.id) { delete req.body.id; } // um... sometimes this is "undefined"??? that's BAD
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		var trainer = req.user;
		delete trainer.__v;
		if(!trainer) { return res.send(404); }

		if(req.body.name && req.body.name.full) {
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}
		delete trainer.password;
		Trainer.findById(trainer._id, function(err, found) {
			if(err) return handleError(res, err);
			for (var attrname in req.body) {
				console.log("updating " + attrname + " to: ", req.body[attrname]);
				found[attrname] = req.body[attrname];
				if(_.isEmpty(req.body[attrname])) {
					console.log(attrname + " is being DELETED");
					found[attrname] = undefined; // this WORKED for deleting a location
					found.markModified[attrname];
				}
			}
			console.log("found:", found);
			found.save(function(err, saved){
				console.log("Saved");
				if(err) return handleError(res, err);
				return res.json(saved);
			})
		});
	};

	exports.addLocation = function(req, res) {
		Trainer.findById(req.params.id, function (err, trainer) {
			if (err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			if(req.body.location){
				trainer.locations.push(req.body.location);
			}
			var updated = trainer;
			updated.save(function (err) {
				if (err) { return handleError(res, err); }
				return res.json(200, trainer);
			});
		});
	};

	exports.removeLocation = function(req, res) {
		console.log("-------------- removing location\n --------------", req.body.location);
		Trainer.findById(req.params.id, function (err, trainer) {
			if (err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			trainer.locations = [];
			trainer.save(function (err) {
				if (err) { return handleError(res, err); }
				return res.json(200, trainer);
			});
		});
	};

	exports.deleteCertificationFile = certificationDocumentRemoveFromTrainer.remove;

	exports.sendEmail = trainerContactEmail.send;

	/**
	 * warniung - DO NOT DELETE, I accidentally implemented this twice, but I don't want to delete this.
	 * @param req
	 * @param res
	 */
	/*
	 exports.changeProfilePicture = function(req, res) {
	 Trainer.findById(req.params.id, function (err, trainer) {
	 req.trainer = trainer;
	 var coords = req.body.coords,
	 filepath = req.body.filepath
	 ;
	 async.waterfall([
	 function doCrop(callback){
	 imageProfilePictureCrop.crop(filepath, coords).then(function(profilePictureCropResponse){
	 callback(null, profilePictureCropResponse)
	 }).catch(callback);
	 },
	 function doUpload(profilePictureCropResponse, callback) {
	 imageProfilePictureS3Upload.upload(req.trainer,
	 profilePictureCropResponse.localFilepath,
	 profilePictureCropResponse.buffer)
	 .then(function(response){
	 callback(null, response);
	 }).catch(callback);
	 }
	 ], function(err, response){
	 if(err) return handleError(res, err);
	 var profile_picture = {
	 profile_picture : {
	 thumbnail : {
	 url : response.url
	 }
	 }
	 };
	 var updated = _.merge(trainer, profile_picture);
	 updated.save(function (err) {
	 if (err) { return handleError(res, err); }
	 return res.json(200, trainer);
	 });
	 });
	 });
	 };
	 */

// Deletes a thing from the DB.
	exports.destroy = function(req, res) {
		Trainer.findById(req.params.id, function (err, trainer) {
			if(err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			trainer.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		});
	};

	/**
	 * Get my info
	 */
	exports.me = function(req, res, next) {
		var mongoose = require('mongoose');

		var userId = req.user._id;
		trainerPopulatorCertificationsAggregated.get(userId).then(function(response){
			res.json(response);
		}).catch(function(err) {
			handleError(res, err);
		})

		//Trainer.aggregate([
		//	{
		//		"$match" : { "_id" : mongoose.Types.ObjectId(userId) }
		//	},
		//	{
		//		$redact : {
		//			$cond :
		//			{
		//				if : {
		//					$and : [
		//						{
		//							$eq : [ "$active", false ]
		//						},
		//						{
		//							$ifNull : ['$originalname', false ]
		//						}
		//					]
		//				},
		//				then : "$$PRUNE",
		//				else : "$$DESCEND"
		//			}
		//		}
		//	}
		//], function(err, aggregated){
		//	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA", aggregated);
		//	var trainerAfterAggregated = aggregated[0];
		//
		//	Trainer.findOne(
		//		{_id: userId}, '-salt -hashedPassword')
		//		.populate('certifications_v2.certification_type')
		//		.populate('specialties')
		//		.exec(function(err, trainer) {
		//			if (err) return next(err);
		//			if (!trainer) return res.json(401);
		//			trainer.certifications_v2 = trainerAfterAggregated.certifications_v2;
		//
		//			trainer.populate('certifications_v2.certification_type specialties', function(err, populatedTrainer){
		//				if (err) return next(err);
		//				certificationOrganizationModel
		//					.populate(trainer,
		//					{path : 'certifications_v2.certification_type.organization', model : 'CertificationOrganization'},
		//					function(err, unusedPopulatedTrainer){
		//						if (err) return next(err);
		//						res.json(populatedTrainer);
		//					})
		//			})
		//		});
		//});


	};

	register(null, {
		apiTrainerController : exports
	});
};