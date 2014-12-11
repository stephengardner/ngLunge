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
var Trainer = require('./trainer.model');
var Registration = require('../registration/registration.model');
var CertificationType = require('../certification-type/certification-type.model');
var Certification = require('../certification/certification.model');
var AWSController = require('../aws/aws.controller');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');
var app = require('../../app');

var validationError = function(res, err) {
	return res.json(422, err);
};

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

// Get a single thing
exports.show = function(req, res) {
	console.log("Trainer.controller.show(), urlName: ", req.params.urlName);
	if(req.params.urlName) {
		Trainer.findOne({ 'urlName' : req.params.urlName}, '-salt -hashedPassword')
			// populate the certifications which are really the certification-types, subclasses of a parent certification
			.populate({path : 'certifications'})
			.exec(function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }
				// need to populate the parent certification of the certification-type
				// from the "Certification" model
				CertificationType.populate(trainer.certifications, {path : 'certification', model : 'Certification'}, function(err, certs) {
					if(err) { return handleError(res, err); }
					if(req.user && req.user._id == trainer._id) {
						trainer.me = true;
					}
					return res.json(trainer);
				});
			});
	}
	else {
		Trainer.findOne({ id : req.params.id}, '-salt -hashedPassword')
			// populate the certifications which are really the certification-types, subclasses of a parent certification
			.populate('certifications').exec(function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }

				// need to populate the parent certification of the certification-type
				// from the "Certification" model
				CertificationType.populate(trainer.certifications, {path : 'certification', model : 'Certification'}, function(err, certs) {
					if(err) { return handleError(res, err); }
					if(req.user && req.user._id == trainer._id) {
						trainer.me = true;
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

// Updates an existing thing in the DB.
exports.update = function(req, res, next) {
	if(req.body._id) { delete req.body._id; }
	Trainer.findById(req.params.id, function (err, trainer) {
		if (err) { return handleError(res, err); }
		if(!trainer) { return res.send(404); }
		if(req.body.name && req.body.name.full) {
			console.log("Lunge: received a full name on updating, so updating the name.first and name.last according to this virtual attribute");
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}
		trainer.me = true;
		var updated = _.merge(trainer, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			console.log("THE APP Is:", app);
			app.e.emit("updated", trainer);
			return res.json(200, trainer);
		});
	});
};

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
			for(var i = 0; i < trainer.certifications.length; i++) {
				if(trainer.certifications[i] == new_cert_types) {
					trainer.certifications.splice(i, 1);
				}
			}
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
			trainer.certifications.push(new_cert_types);

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
					return res.json(200, trainer);
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
	console.log("------------------");
	console.log(req.session);
	var userId = req.user._id;
	Trainer.findOne(
		{_id: userId}, '-salt -hashedPassword')
		.populate('certifications')
		.exec(function(err, trainer) {
			// don't ever give out the password or salt
			if (err) return next(err);
			if (!trainer) return res.json(401);
			res.json(trainer);
		});
};
function handleError(res, err) {
	return res.send(500, err);
}