/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trainers              ->  index
 * POST    /trainers              ->  create
 * GET     /trainers/:id          ->  show
 * PUT     /trainers/:id          ->  update
 * DELETE  /trainers/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');
// var app = require('../../app');
var $q = require('q');
var GoogleMapApi = require('googlemaps');
var util = require('util');
var geocoder = require('../..//components/geocoder')($q, GoogleMapApi);
var domain = require('domain');
var logger = require("../../components/logger")();
var EventEmitter = require('events').EventEmitter;

var validationError = function(res, err) {
	return res.json(422, err);
};

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
	return validationError(res, err);
}

var validatePresenceOf = function(value) {
	return value && value.length;
};

module.exports = function(app) {
	var AWSController = require('../aws/aws.controller')(app);
	var exports = {};
	var Trainer = app.models.Trainer;
	var Certification = app.models.Certification;
	var CertificationType = app.models.CertificationType;

// Get list of things
	exports.index = function(req, res) {
		console.log("SESSION!", req.session);
		app.redisClient.set("something", "else");
		Trainer.find({}, '-salt -hashedPassword', function (err, trainers) {
			if(err) { return handleError(res, err); }
			return res.json(200, trainers);
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
		//console.log("Trainer.controller.show(), urlName: ", req.params.urlName, " req.user: ", req.user);
		if(req.params.urlName) {
			Trainer.findOne({ 'urlName' : req.params.urlName}, '-salt -hashedPassword')
				// populate the certifications which are really the certification-types, subclasses of a parent certification
				//.populate({path : 'certifications'})
				.populate({path : 'specialties'})
				.populate({path : 'certifications_v2'})
				.exec(function (err, trainer) {
					if(err) { return handleError(res, err); }
					if(!trainer) { return res.send(404); }
					app.models.CertificationOrganization
						.populate(trainer,
						{path : 'certifications_v2.organization', model : 'CertificationOrganization'},
						function(err, populatedTrainer){
							if(req.user && req.user._id == trainer._id) {
								// removed this because it's not right to have this property on the db trainer object. set it client side
								//
								//console.log("Setting trainer.me = true for trainer._id: ", trainer._id);
								//trainer.me = true;
							}
							console.log("Trainer specialties:", populatedTrainer.specialties);
							return res.json(populatedTrainer);
						})
					// need to populate the parent certification of the certification-type
					// from the "Certification" model
					//CertificationType.populate(trainer.certifications, {path : 'certification', model : 'Certification'}, function(err, certs) {
					//if(err) { return handleError(res, err); }
					//});
				});
		}
		else {
			Trainer.findOne({ id : req.params.id}, '-salt -hashedPassword')
				// populate the certifications which are really the certification-types, subclasses of a parent certification
				.populate('certifications_v2')
				.populate('specialties')
				.exec(function (err, trainer) {
					if(err) { return handleError(res, err); }
					if(!trainer) { return res.send(404); }

					app.models.CertificationOrganization
						.populate(trainer,
						{path : 'certifications_v2.organization', model : 'CertificationOrganization'},
						function(err, populatedTrainer){
							if(err) { return handleError(res, err); }
							if(req.user && req.user._id == populatedTrainer._id) {
								// removed this because it's not right to have this property on the db trainer object. set it client side
								//
								//console.log("Setting trainer.me = true for trainer._id: ", trainer._id);
								//trainer.me = true;
							}
							return res.json(populatedTrainer);
						});
				});
		}
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
			//return JSON.stringify(100);//res.json(json_result);
			var fuck = {"fuck" : "no"};
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
			res.json({ trainer : trainer, token: token });
		});
	};

	function updateName(trainer, params) {
		if(params.name && params.name.full) {
			//console.log("Lunge: received a full name on updating, so updating the name.first and name.last according to this virtual attribute");
			var nameFullParts = params.name.full.split(" ");
			trainer.name.first = nameFullParts[0];
			trainer.name.last = nameFullParts[1];
		}
		return trainer;
	}


	function mergeByProperty(arr1, arr2, prop) {
		console.log("Merging===============\n", arr1, "=============== on ===============", arr2, "===============\n==============");
		_.each(arr2, function(arr2obj) {
			var arr1obj = _.find(arr1, function(arr1obj) {
				console.log("////////\n//////////\nChecking if 'arr1obj[" + prop + "]' == arr2obj['" + prop + "']" + " which means does : ", arr1obj[prop], " == ", arr2obj[prop], "? :::: ",
					arr1obj[prop].toString() === arr2obj[prop].toString());
				return (arr1obj[prop] === arr2obj[prop]) || (arr1obj[prop].toString() == arr2obj[prop].toString());
			});

			arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
		});
	}

	function updateProviders(trainer, params) {
		var authTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];
		for(var i = 0; i < authTypes.length; i++) {
			if(params[authTypes[i]]) {
				//console.log("UPDATED : ", authTypes[i]);
				trainer[authTypes[i]] = params[authTypes[i]];
			}
		}
		return trainer;
	}

	var mongoose = require('mongoose');
	function unpopulateCertifications(trainer) {
		var certification_ids = [];
		for (var i = 0; i < trainer.certifications.length; i++){
			certification_ids.push(mongoose.Types.ObjectId(trainer.certifications[i]._id));
		}
		trainer.certifications = certification_ids;
		return trainer;
	}
	function unpopulateSpecialties(trainer) {
		var specialty_ids = [];
		for (var i = 0; i < trainer.specialties.length; i++){
			specialty_ids.push(mongoose.Types.ObjectId(trainer.specialties[i]._id));
		}
		trainer.specialties = specialty_ids;
		return trainer;
	}

	var LocationProcessor = require("./location-processing");
	var LocationProcessorV2 = require("../../components/location-processor/v2")();
// Updates an existing thing in the DB.
	exports.update = function(req, res, next) {
		console.log("trainer.controller.update()");
		if(req.body._id) { delete req.body._id; }
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		if(req.body.locations) {

		}
		var trainer = req.trainer;
		delete trainer.__v;
		console.log("\n-----------------------------\nThe trainer is:", trainer, "\n\n\n");
		if(!trainer) { return res.send(404); }

		delete req.body.certifications;
		delete req.body.__v;// = undefined;
		console.log("Request body is:", req.body);
		var toObject = trainer.toObject();
		delete toObject.password;
		delete toObject.hashedPassword;
		if(req.body.name && req.body.name.full) {
			//console.log("Lunge: received a full name on updating, so updating the name.first and name.last according to this virtual attribute");
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}

		for (var attrname in req.body) {
			console.log("Updating trainer." + attrname + " to be :", req.body[attrname]);
			trainer[attrname] = req.body[attrname]; }
		//trainer.locations = req.body.locations;
		delete trainer.password;
		LocationProcessorV2.parseTrainer(trainer).then(function(results){
			console.log("Results.locations is:", results.locations);
			trainer.locations = results.locations;
			if(trainer.locations && trainer.locations.length == 0) {
				trainer.location = {};
			}
			if(trainer.locations && trainer.locations.length && (!trainer.location || !trainer.location.coords)) {
				var primaryFound = false;
				for(var i = 0; i < trainer.locations.length; i++) {
					var location = trainer.locations[i];
					if(location.primary) {
						primaryFound = true;
						trainer.location = _.extend(trainer.locations[0]);
					}
				}
				if(!primaryFound) {
					trainer.locations[0].primary = true;
					trainer.location = _.extend(trainer.locations[0]);
				}
			}
			console.log("Trainer.location is now:", trainer.location);
			trainer.markModified('locations');
			trainer.markModified('location');
			//console.log("But somehow trainer.locations are:", trainer.locations);

			trainer.save(function(err, savedTrainer) {
				if (err) return handleError(res, err);
				app.models.CertificationType
					.populate(savedTrainer, 'certifications_v2', function (err, populatedTrainer) {

						app.models.CertificationOrganization
							.populate(populatedTrainer, 'certifications_v2.organization',
							function (err, morePopulatedTrainer) {
								return res.status(200).json(morePopulatedTrainer);
							})
						//return res.status(200).json(populatedTrainer);
					})
			})
		}).catch(function(err){
			logger.error(err);
			return handleError(res, err);
		})
	};

	exports.addLocation = function(req, res) {
		Trainer.findById(req.params.id, function (err, trainer) {
			//trainer.locations = [];
			//trainer.save(function(err, trainer){
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

	exports.changeProfilePicture = function(req, res) {
		Trainer.findById(req.params.id, function (err, trainer) {
			req.trainer = trainer;
			AWSController.crop(req, res).then(function(response){
				console.log("Trainer Controller changeProfilePicture completely successful :", response);
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
			}, function(err){
			})
		});
		/*
		 Trainer.findById(req.params.id, function (err, trainer) {
		 if(err) { return handleError(res, err); }
		 if(!trainer) { return res.send(404); }
		 return res.json(200, trainer);
		 });
		 */
	};

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
		var userId = req.user._id;
		Trainer.findOne(
			{_id: userId}, '-salt -hashedPassword')
			.populate('certifications')
			.populate('certifications_v2')
			.populate('specialties')
			.exec(function(err, trainer) {
				app.models.CertificationOrganization
					.populate(trainer,
					{path : 'certifications_v2.organization', model : 'CertificationOrganization'},
					function(err, populatedTrainer){
						// don't ever give out the password or salt
						if (err) return next(err);
						if (!populatedTrainer) return res.json(401);
						res.json(populatedTrainer);
					});
			});
	};

	return exports;
}
function handleError(res, err) {
	console.log("There was an error and logger should be outputting it...");
	console.log(err);
	console.log(err.stack);
	logger.error(err);
	return res.send(500, err);
}