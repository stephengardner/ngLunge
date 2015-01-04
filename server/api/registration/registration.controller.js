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
var Registration = require('./registration.model');
var Trainer = require('../trainer/trainer.model');
var TrainerController = require('../trainer/trainer.controller');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Q = require('q');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');

// Get list of things
exports.index = function(req, res) {
	Registration.find(function (err, trainers) {
		if(err) { return handleError(res, err); }
		return res.json(200, trainers);
	});
};

/**
 * Get a single registration
 */
String.prototype.toObjectId = function() {
	var ObjectId = (require('mongoose').Types.ObjectId);
	return new ObjectId(this.length != 12 ? "DONTVALIDATE" : this.toString());
};

exports.show = function (req, res, next) {
	Registration.findOne( {$or : [ { '_id' : req.params.id.toObjectId() }, { 'authenticationHash' : req.params.id }]}, function(err, registration) {
		if(err) return next(err);

		if(!registration) return res.send(404, "Invalid registration link");
		console.log("............");
		res.json(registration);
	});
};

exports.test = function(req, res) {
	Registration.create({email : req.params.email}, function(err, registration) {
		if(err) { return handleError(res, err); }
		return res.json(201, registration);
	});
};

var validationError = function(res, err) {
	return res.json(422, err);
};

exports.create = function(req, res) {
	req.body = req.body && req.body.email ? req.body : { email : ""};
	console.log("Attempting to create registration from: ", req.body);
	var newRegistration = new Registration(req.body),
		authenticationHash = crypto.randomBytes(10).toString('hex');
	newRegistration.authenticationHash = authenticationHash;
	newRegistration.verified = false;
	newRegistration.save(function(err, registration){
		if (err) return validationError(res, err);
		sendEmail(registration);
		res.json({ registration : registration});
	});
};

var sendEmail = function(registrationDocument) {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: config.MAIL.user,
			pass: config.MAIL.pass
		}
	});
	transporter.sendMail({
		from: 'augdog911@gmail.com',
		to: 'augdog911@gmail.com',
		subject: 'Lunge Automatic Email Validation',
		text: 'Thanks for registering with Lunge.  To activate your account please click on this link:' + config.DOMAIN + '/trainer/register/password/' + registrationDocument.authenticationHash
	});
};

exports.validateEmail = function(req, res) {
	Registration.find({authenticationHash : req.params.id}, function(err, registration){
		registration.authenticated = true;
		registration.save(function(err, registration){
			if(err) { return handleError(res, err); }
			return res.json(201, registration);
		});

	});
	/*
	Registration.update({ id : req.params.id, authenticationHash : req.params.authenticationHash }, { authenticated : true }, {}, function(err, numAffected) {
		console.log("Response:", err, numAffected);
		if(err) { return handleError(res, err); }
		if(numAffected) {
			return res.json(200, {"message" : "Your email has been validated"});
		}
		return handleError(res, {"message" : "That link is no longer valid"});
	})
	*/
};

exports.submitPassword = function(req, res) {
	console.log("Attempting to submit password with registration:", req.registration);

	var registrationId = req.registration._id;
	var password1 = String(req.body.password ? req.body.password : "");
	var password2 = String(req.body.password2);
	Registration.findById(registrationId, function(err, registration){
		console.log("found: ", registration);
		var email = registration.email;
		var trainerProperties = {
			name : {
				first : "Lunge",
				last : "Trainer"
			},
			type : "in-home",
			email : email,
			password : password1,
			role : "trainer"
		}
		var trainer = new Trainer(trainerProperties);
		trainer.save(function(err, trainer){
			console.log("The error was:", err);
			console.log("SAVED:", trainer);
			/*
			console.log("Created...", trainer);
			if (err) return validationError(res, err);
			res.send(201, trainer);
			*/
			if (err) return validationError(res, err);
			var token = jwt.sign({_id: trainer._id }, config.secrets.session, { expiresInMinutes: 60*5 });
			res.json({ trainer : trainer, token: token });
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}