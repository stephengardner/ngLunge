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
var app = require('../../app');
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
			console.log("TESTING!000");
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
		//console.log("Trainer.controller.show(), urlName: ", req.params.urlName, " req.user: ", req.user);
		if(req.params.urlName) {
			Trainer.findOne({ 'urlName' : req.params.urlName}, '-salt -hashedPassword')
				// populate the certifications which are really the certification-types, subclasses of a parent certification
				.populate({path : 'certifications'})
				.populate({path : 'specialties'})
				.exec(function (err, trainer) {
					if(err) { return handleError(res, err); }
					if(!trainer) { return res.send(404); }
					// need to populate the parent certification of the certification-type
					// from the "Certification" model
					CertificationType.populate(trainer.certifications, {path : 'certification', model : 'Certification'}, function(err, certs) {
						if(err) { return handleError(res, err); }
						if(req.user && req.user._id == trainer._id) {
							// removed this because it's not right to have this property on the db trainer object. set it client side
							//
							//console.log("Setting trainer.me = true for trainer._id: ", trainer._id);
							//trainer.me = true;
						}
						console.log("Trainer specialties:", trainer.specialties);
						return res.json(trainer);
					});
				});
		}
		else {
			Trainer.findOne({ id : req.params.id}, '-salt -hashedPassword')
				// populate the certifications which are really the certification-types, subclasses of a parent certification
				.populate('certifications')
				.populate('specialties')
				.exec(function (err, trainer) {
					if(err) { return handleError(res, err); }
					if(!trainer) { return res.send(404); }

					// need to populate the parent certification of the certification-type
					// from the "Certification" model
					CertificationType.populate(trainer.certifications, {path : 'certification', model : 'Certification'}, function(err, certs) {
						if(err) { return handleError(res, err); }
						if(req.user && req.user._id == trainer._id) {
							// removed this because it's not right to have this property on the db trainer object. set it client side
							//
							//console.log("Setting trainer.me = true for trainer._id: ", trainer._id);
							//trainer.me = true;
						}
						return res.json(trainer);
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
		if(req.body._id) { delete req.body._id; }
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		if(req.body.locations) {

		}
		Trainer.findById(req.params.id, function (err, trainer) {
			console.log("The trainer is:", trainer, "\n\n\n");
			if (err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }

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

			//var extended = _.merge(toObject, req.body);
			//var merged = extended;
			//merged.specialties = _.pluck(merged.specialties, "_id");
			//merged.specialties = [];

			//delete merged.password;
			//console.log("merged is :", merged.locations);

			//LocationProcessorV2.parseTrainer(foundTrainer).then(function(results){

			//});
			//console.log("\nxtended is :", extended);
			/*
			LocationProcessorV2.parseTrainer(merged).then(function(results){
				Trainer.findById(results._id).exec(function(err, foundTrainer){
					if(err) return reject(err);
					if(!foundTrainer) return reject(new Error("No trainer with that id"));
					console.log("The fucking found trainer was before:", foundTrainer);
					foundTrainer = _.extend(foundTrainer, results);
					console.log("The fucking found trainer is now:", foundTrainer);
					//if(foundTrainer && foundTrainer.password)
			//			delete foundTrainer.password;
					foundTrainer.save(function(err, savedTrainer){
						if(err) {
							console.log("Error:", err);
							console.log("Stack:", err.stack);
							logger.error(err);
							return handleError(res, err);
						}
						return res.status(200).json(savedTrainer);
					})
				});
			}).catch(function(err){
				console.log("Error:", err);
				console.log("Stack:", err.stack);
				logger.error(err);
				return handleError(res, err);
			});
			*/
			/*
			Trainer.findById(trainer._id).exec(function(err, foundTrainer){

			}

			*/
			//_.merge(trainer, extended);
			for (var attrname in req.body) {
				console.log("Updating trainer." + attrname + " to be :", req.body[attrname]);
				trainer[attrname] = req.body[attrname]; }
			//trainer.locations = req.body.locations;
			delete trainer.password;
			LocationProcessorV2.parseTrainer(trainer).then(function(results){
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

				trainer.save(function(err, savedTrainer){
					if(err) return handleError(res, err);
					return res.status(200).json(savedTrainer);
				})
			}).catch(function(err){
				logger.error(err);
				return handleError(res, err);
			})

			/*
			Trainer.update({_id : merged._id}, merged, {}, function(err, response){
				if(err) return handleError(res, err);
				return res.json(200, response);
			})
			*/
			/*
			console.log("merged:", merged);
			trainer.save(function(err, savedTrainer){
				if(err) return handleError(res, err);
				console.log("OK...");
				Trainer.findById(savedTrainer._id).populate('specialties').exec(function(err, foundTrainer){
					if(err) return handleError(res, err);
					return res.json(200, foundTrainer);
				})
			})
			*/
			/*
			var toMergeWith = req.body;

			console.log("Req body locations:\n", req.body.locations);//")
			// overwrite location / locations if present
			if(toMergeWith && (toMergeWith.location || toMergeWith.locations)) {
				console.log("about to process locations...");
				LocationProcessorV2.parseTrainer(req.body).then(function(results){
					toMergeWith = results;
					save(trainer);
				}).catch(function(err){
					return handleError(res, err);
				})


			}
			else {
				toMergeWith.location = trainer.location;
				toMergeWith.locations = trainer.locations;
				save(trainer);
			}
			function save(trainer) {
				console.log("\n\ntoMergeWithLocations:", toMergeWith.locations)
				// merge properties that are available, some will need to be processed later, hence the other functions
				trainer = _.merge(trainer, toMergeWith);
				trainer.locations = toMergeWith.locations;
				trainer.location = toMergeWith.location;
				// overwrite providers only if providers are present in the req.body
				trainer = updateProviders(trainer, toMergeWith);
				// overwrite name and parse it correctly
				trainer = updateName(trainer, toMergeWith);

				//trainer = unpopulateCertifications(trainer);
				//trainer.certifications = [];
				//trainer.markModified('certifications');

				//trainer.certifications = undefined;
				//trainer.set('certifications', []);
				//trainer.markModified('certifications');

				trainer.markModified('specialties');
				console.log("Trainer specialties:", trainer.specialties);
				trainer.save(function (err, updatedTrainer) {
					console.log("Done, the err:", err);
					if (err) { return handleError(res, err); }
					//logger.info("The trainer.locations after saving: ", trainer.locations);
					Trainer.findById(trainer._id)
						.populate('certifications')
						.populate('specialties')
						.exec(function(err, trainer){
							return res.json(200, trainer);
						})
				});
			}
		*/
		});

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
			//trainer.locations = [];
			//trainer.save(function(err, trainer){
			if (err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			//if(req.body.location){
			/*
			 for(var i = 0; i < trainer.locations.length; i++) {
			 var location = trainer.locations[i];
			 if(location._id == req.body.location._id) {
			 console.log("-\n-\n-\n-\n-\n-deleting location:", location, " at index: ", i);
			 trainer.locations.splice(i, 1);
			 }
			 }
			 if(trainer.location.coords && trainer.locations.length == 0) {
			 // removing this because setting an empty location will fail validation
			 trainer.location = {};
			 }
			 else {
			 if(trainer.location.coords && trainer.locations.length) {
			 if(req.body.location.primary) {
			 trainer.locations[0].primary = true;
			 trainer.location = trainer.locations[0];
			 }
			 }
			 }
			 trainer.markModified('locations');
			 trainer.markModified('location');
			 }
			 console.log("--\n--\nthe updated trainer locations:", trainer.locations);
			 */
			trainer.locations = [];
			trainer.save(function (err) {
				if (err) { return handleError(res, err); }
				return res.json(200, trainer);
			});
		});
	}

	exports.modifyCertification = function(req, res) {
		Trainer.findById(req.params.id, function (err, trainer) {
			var new_cert_types = req.body.certification;

			var callback = function(trainer) {
				trainer.save(function (err) {
					if (err) { return handleError(res, err); }
					return res.json(200, trainer);
				});
			}

			// DELETING a certification
			if(req.body.type == "DELETE") {
				// first method, this way works, but it is difficult to then display the trainer certifications when we want to show them on a profile
				//for(var i = 0; i < trainer.certifications.length; i++) {
				//	if(trainer.certifications[i] == new_cert_types) {
				//		trainer.certifications.splice(i, 1);
				//	}
				//}
				// second (new) method
				CertificationType.findById(new_cert_types).populate('certification').exec(function(err, cert_type) {
					if(trainer.certs[cert_type.certification.name]) {
						for(var i = 0; i < trainer.certs[cert_type.certification.name].length; i++) {
							if(trainer.certs[cert_type.certification.name][i]._id.toString() == cert_type._id.toString()) {
								trainer.certs[cert_type.certification.name].splice(i, 1);
							}
						}
						for(var key in trainer.certs ) {
							if(trainer.certs[key].length == 0) {
								var deleteKey = require('key-del');
								trainer.markModified('certs');
								trainer.markModified('certs.' + key);
								trainer.certs = deleteKey(trainer.certs, key);
							}
						}
					}
					trainer.save(function (err) {
						if (err) { return handleError(res, err); }
						return res.json(200, trainer);
					});
				});
			}
			else {
				// first method, simple...
				// removed on 7.3.2015, not sure why this was here
				//trainer.certifications.push(new_cert_types);

				// second (new) method, we need to show sub-certifications under their parent certification
				CertificationType.findById(new_cert_types).populate('certification').exec(function(err, cert_type) {
					if (err) { return handleError(res, err); }
					if(!trainer.certs) {
						trainer.certs = {};
					}
					if(!trainer.certs[cert_type.certification.name]) {
						trainer.certs[cert_type.certification.name] = []
					}
					trainer.markModified('certs');
					trainer.markModified('certs.' + cert_type.certification.name);
					trainer.certs[cert_type.certification.name].push(cert_type);
					trainer.save(function (err) {
						if (err) { return handleError(res, err); }

						Trainer.findById(trainer._id)
						.populate('certifications')
						.populate('specialties')
						.exec(function(err, trainer){
								return res.json(200, trainer);
							})
					});
				})
			}
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
			.populate('specialties')
			.exec(function(err, trainer) {
				// don't ever give out the password or salt
				if (err) return next(err);
				if (!trainer) return res.json(401);
				res.json(trainer);
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